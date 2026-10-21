using System;
using UnityEngine;

public class Voice : MonoBehaviour
{
    string lastHeard = "";
    bool listening;
    AndroidJavaObject recognizer;
    AndroidJavaObject tts;
    bool ttsReady;
    string pendingHeard;
    string speakerSex = "F";

    public string LastHeard
    {
        get { return lastHeard; }
        private set { lastHeard = value; }
    }

    public bool Listening
    {
        get { return listening; }
        private set { listening = value; }
    }

    public void SetSpeaker(string sex)
    {
        speakerSex = sex == "M" ? "M" : "F";
        if (ttsReady && tts != null)
        {
            tts.Call<int>("setPitch", speakerSex == "M" ? 0.8f : 1.15f);
        }
    }

    public void Speak(string text)
    {
        if (string.IsNullOrEmpty(text)) return;
#if UNITY_ANDROID && !UNITY_EDITOR
        EnsureTts();
        if (ttsReady && tts != null)
        {
            tts.Call("speak", text, 0, null, "gogo");
            return;
        }
#endif
        Debug.Log("GOGO: " + text);
    }

    public void Stop()
    {
#if UNITY_ANDROID && !UNITY_EDITOR
        if (tts != null) tts.Call<int>("stop");
        if (recognizer != null) recognizer.Call("stopListening");
#endif
        Listening = false;
    }

    public void BeginListen()
    {
        LastHeard = "";
        pendingHeard = null;
#if UNITY_ANDROID && !UNITY_EDITOR
        if (tts != null) tts.Call<int>("stop");
#endif
        Listening = true;
#if UNITY_ANDROID && !UNITY_EDITOR
        try
        {
            EnsureRecognizer();
            AndroidJavaClass intentClass = new AndroidJavaClass("android.speech.RecognizerIntent");
            AndroidJavaObject intent = new AndroidJavaObject("android.content.Intent", intentClass.GetStatic<string>("ACTION_RECOGNIZE_SPEECH"));
            intent.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_LANGUAGE_MODEL"), intentClass.GetStatic<string>("LANGUAGE_MODEL_FREE_FORM"));
            intent.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_LANGUAGE"), "en-US");
            intent.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_PARTIAL_RESULTS"), true);
            recognizer.Call("startListening", intent);
        }
        catch (Exception error)
        {
            Debug.LogWarning(error.Message);
        }
#endif
    }

    public void EndListen()
    {
#if UNITY_ANDROID && !UNITY_EDITOR
        if (recognizer != null) recognizer.Call("stopListening");
#endif
        Listening = false;
    }

    void Update()
    {
        if (pendingHeard == null) return;
        LastHeard = pendingHeard;
        pendingHeard = null;
    }

    void EnsureTts()
    {
        if (tts != null) return;
        AndroidJavaClass unity = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
        AndroidJavaObject activity = unity.GetStatic<AndroidJavaObject>("currentActivity");
        tts = new AndroidJavaObject("android.speech.tts.TextToSpeech", activity, new TtsListener(OnTtsReady));
    }

    void OnTtsReady(bool ok)
    {
        ttsReady = ok;
    }

    void EnsureRecognizer()
    {
        if (recognizer != null) return;
        AndroidJavaClass unity = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
        AndroidJavaObject activity = unity.GetStatic<AndroidJavaObject>("currentActivity");
        AndroidJavaClass speech = new AndroidJavaClass("android.speech.SpeechRecognizer");
        recognizer = speech.CallStatic<AndroidJavaObject>("createSpeechRecognizer", activity);
        recognizer.Call("setRecognitionListener", new ListenProxy(OnHeard));
    }

    void OnHeard(string text)
    {
        pendingHeard = text;
    }

    class TtsListener : AndroidJavaProxy
    {
        readonly Action<bool> done;

        public TtsListener(Action<bool> done) : base("android.speech.tts.TextToSpeech$OnInitListener")
        {
            this.done = done;
        }

        public void onInit(int status)
        {
            done(status == 0);
        }
    }

    class ListenProxy : AndroidJavaProxy
    {
        readonly Action<string> heard;

        public ListenProxy(Action<string> heard) : base("android.speech.RecognitionListener")
        {
            this.heard = heard;
        }

        public void onReadyForSpeech(AndroidJavaObject bundle) { }
        public void onBeginningOfSpeech() { }
        public void onRmsChanged(float rms) { }
        public void onBufferReceived(byte[] buffer) { }
        public void onEndOfSpeech() { }
        public void onError(int error) { }
        public void onPartialResults(AndroidJavaObject bundle) { Read(bundle); }
        public void onResults(AndroidJavaObject bundle) { Read(bundle); }
        public void onEvent(int type, AndroidJavaObject bundle) { }

        void Read(AndroidJavaObject bundle)
        {
            if (bundle == null) return;
            AndroidJavaObject list = bundle.Call<AndroidJavaObject>("getStringArrayList", "results_recognition");
            if (list == null) return;
            string text = list.Call<string>("get", 0);
            if (!string.IsNullOrEmpty(text)) heard(text);
        }
    }
}

public static class PhoneId
{
    public static string Imei()
    {
#if UNITY_ANDROID && !UNITY_EDITOR
        try
        {
            AndroidJavaClass unity = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
            AndroidJavaObject activity = unity.GetStatic<AndroidJavaObject>("currentActivity");
            AndroidJavaObject tm = activity.Call<AndroidJavaObject>("getSystemService", "phone");
            AndroidJavaClass version = new AndroidJavaClass("android.os.Build$VERSION");
            int sdk = version.GetStatic<int>("SDK_INT");
            string imei = sdk >= 26
                ? tm.Call<string>("getImei")
                : tm.Call<string>("getDeviceId");
            if (!string.IsNullOrEmpty(imei)) return imei;
        }
        catch (Exception error)
        {
            Debug.LogWarning(error.Message);
        }
#endif
        return "";
    }
}
