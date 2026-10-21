using System;
using UnityEngine;

public class Voice : MonoBehaviour
{
    string lastHeard = "";
    string liveCaption = "";
    bool listening;
    AndroidJavaObject recognizer;
    AndroidJavaObject tts;
    bool ttsReady;
    string pendingHeard;
    string pendingLive;
    string speakerSex = "F";
    float micLevel;
    float pendingRms = -100f;
    AudioClip micClip;
    string micDevice;
    readonly float[] micSamples = new float[512];
    bool micOpen;
    bool micSeen;
    bool voiceHeard;
    bool speechReady;
    string micStatus = "";

    public string LastHeard
    {
        get { return lastHeard; }
        private set { lastHeard = value; }
    }

    /// <summary>Partial speech text while the mic is open.</summary>
    public string LiveCaption
    {
        get { return liveCaption; }
        private set { liveCaption = value; }
    }

    public bool Listening
    {
        get { return listening; }
        private set { listening = value; }
    }

    /// <summary>0–1 mic energy while listening (RMS / clip peak).</summary>
    public float MicLevel
    {
        get { return micLevel; }
        private set { micLevel = value; }
    }

    /// <summary>True once voice energy was clearly detected this listen.</summary>
    public bool VoiceHeard
    {
        get { return voiceHeard; }
    }

    /// <summary>True if a mic session was opened this hold (survives EndListen).</summary>
    public bool MicSeen
    {
        get { return micSeen; }
    }

    /// <summary>True if speech-to-text is active (Android only on this build).</summary>
    public bool SpeechReady
    {
        get { return speechReady; }
    }

    /// <summary>Short status for the mic meter.</summary>
    public string MicStatus
    {
        get { return micStatus; }
    }

    public bool MicOpen
    {
        get { return micOpen; }
    }

    /// <summary>PC uses typing + mic meter; Android uses real speech-to-text.</summary>
    public bool UsesTypedInput
    {
        get
        {
#if UNITY_ANDROID && !UNITY_EDITOR
            return false;
#else
            return true;
#endif
        }
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
        StopMicProbe();
        MicLevel = 0f;
        voiceHeard = false;
        speechReady = false;
        micStatus = "";
    }

    public void BeginListen()
    {
        LastHeard = "";
        LiveCaption = "";
        pendingHeard = null;
        pendingLive = null;
        pendingRms = -100f;
        MicLevel = 0f;
        voiceHeard = false;
        speechReady = false;
        micSeen = false;
        micStatus = "Opening mic…";
#if UNITY_ANDROID && !UNITY_EDITOR
        if (tts != null) tts.Call<int>("stop");
#endif
        Listening = true;
        StartMicProbe();
#if UNITY_ANDROID && !UNITY_EDITOR
        try
        {
            EnsureRecognizer();
            AndroidJavaClass intentClass = new AndroidJavaClass("android.speech.RecognizerIntent");
            AndroidJavaObject intent = new AndroidJavaObject("android.content.Intent", intentClass.GetStatic<string>("ACTION_RECOGNIZE_SPEECH"));
            intent.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_LANGUAGE_MODEL"), intentClass.GetStatic<string>("LANGUAGE_MODEL_FREE_FORM"));
            intent.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_LANGUAGE"), "en-US");
            intent.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_PARTIAL_RESULTS"), true);
            intent.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_MAX_RESULTS"), 1);
            recognizer.Call("startListening", intent);
            speechReady = true;
            micSeen = true;
            micStatus = "Mic on — speak";
        }
        catch (Exception error)
        {
            Debug.LogWarning(error.Message);
            micStatus = "Mic error — type instead";
        }
#else
        // Windows Unity speech (DictationRecognizer) fails on this PC (StopAsync 0x80131509).
        // Keep the real USB mic open for the impulse meter; words come from the type box.
        speechReady = false;
        if (micOpen || micSeen)
            micStatus = "Mic OK — type English";
        else
            micStatus = "No microphone";
#endif
    }

    public void EndListen()
    {
#if UNITY_ANDROID && !UNITY_EDITOR
        if (recognizer != null) recognizer.Call("stopListening");
#endif
        Listening = false;
        StopMicProbe();
        MicLevel = 0f;
        micStatus = "";
    }

    public void DisposeListen()
    {
        // Android recognizer already stopped in EndListen; nothing else to dispose on PC.
    }

    /// <summary>PC: mirror typed text into the live caption while holding Start.</summary>
    public void SetLiveTyped(string text)
    {
        if (!Listening) return;
        if (string.IsNullOrEmpty(text)) return;
        LiveCaption = text.Trim();
    }

    void Update()
    {
        if (pendingLive != null)
        {
            LiveCaption = pendingLive;
            pendingLive = null;
        }
        if (pendingHeard != null)
        {
            LastHeard = pendingHeard;
            LiveCaption = pendingHeard;
            pendingHeard = null;
        }
        UpdateMicLevel();
    }

    void StartMicProbe()
    {
        StopMicProbe();
        micOpen = false;
#if UNITY_ANDROID && !UNITY_EDITOR
        micOpen = true;
        micSeen = true;
        micStatus = "Mic on — speak";
#else
        try
        {
            micDevice = null;
            if (Microphone.devices != null && Microphone.devices.Length > 0)
                micDevice = Microphone.devices[0];

            int freq = 16000;
            int minFreq;
            int maxFreq;
            Microphone.GetDeviceCaps(micDevice, out minFreq, out maxFreq);
            if (maxFreq > 0)
                freq = Mathf.Clamp(16000, minFreq > 0 ? minFreq : 16000, maxFreq);
            else
                freq = 44100;

            micClip = Microphone.Start(micDevice, true, 1, freq);
            micOpen = micClip != null;
            if (micOpen)
            {
                micSeen = true;
                micStatus = "Mic OK — type English";
                Debug.Log("Mic probe started: " + (string.IsNullOrEmpty(micDevice) ? "(default)" : micDevice) + " @ " + freq + "Hz");
            }
            else
            {
                micStatus = "Mic failed";
                Debug.LogWarning("Microphone.Start returned null.");
            }
        }
        catch (Exception error)
        {
            Debug.LogWarning(error.Message);
            micClip = null;
            micDevice = null;
            micOpen = false;
            micStatus = "Mic failed";
        }
#endif
    }

    void StopMicProbe()
    {
#if !UNITY_ANDROID || UNITY_EDITOR
        try { Microphone.End(micDevice); }
        catch (Exception) { }
        micClip = null;
        micDevice = null;
#endif
        pendingRms = -100f;
        micOpen = false;
    }

    void UpdateMicLevel()
    {
        if (!Listening)
        {
            MicLevel = Mathf.MoveTowards(MicLevel, 0f, Time.deltaTime * 4f);
            return;
        }

        float target = 0f;
#if UNITY_ANDROID && !UNITY_EDITOR
        if (pendingRms > -90f)
            target = Mathf.Clamp01((pendingRms + 2f) / 10f);
#else
        if (micClip != null && Microphone.IsRecording(micDevice))
        {
            int pos = Microphone.GetPosition(micDevice);
            if (pos >= micSamples.Length)
            {
                int start = pos - micSamples.Length;
                micClip.GetData(micSamples, start);
                float sum = 0f;
                float peak = 0f;
                for (int i = 0; i < micSamples.Length; i++)
                {
                    float a = Mathf.Abs(micSamples[i]);
                    sum += micSamples[i] * micSamples[i];
                    if (a > peak) peak = a;
                }
                float rms = Mathf.Sqrt(sum / micSamples.Length);
                target = Mathf.Clamp01(Mathf.Max(rms * 22f, peak * 6f));
                if (target > 0.08f) micSeen = true;
            }
        }
#endif
        MicLevel = Mathf.Lerp(MicLevel, target, Time.deltaTime * 18f);

        bool hasWords = !string.IsNullOrEmpty(LiveCaption);
        bool realAudio = false;
#if UNITY_ANDROID && !UNITY_EDITOR
        realAudio = pendingRms > -90f && target > 0.12f;
#else
        realAudio = micClip != null && target > 0.12f;
#endif
        if (realAudio) voiceHeard = true;
        if (hasWords)
        {
            voiceHeard = true;
            micStatus = UsesTypedInput ? "Typed + mic" : "Got words";
        }
        else if (voiceHeard)
            micStatus = UsesTypedInput ? "Hearing you — type words" : "Hearing you…";
        else if (micOpen || micSeen)
            micStatus = UsesTypedInput ? "Mic OK — type English" : "Mic on — speak English";
    }

    void OnRms(float rms)
    {
        pendingRms = rms;
    }

    void OnDestroy()
    {
        StopMicProbe();
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
        recognizer.Call("setRecognitionListener", new ListenProxy(OnPartial, OnFinal, OnRms));
    }

    void OnPartial(string text)
    {
        pendingLive = text;
        voiceHeard = true;
    }

    void OnFinal(string text)
    {
        pendingHeard = text;
        pendingLive = text;
        voiceHeard = true;
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
        readonly Action<string> onPartial;
        readonly Action<string> onFinal;
        readonly Action<float> onRms;

        public ListenProxy(Action<string> onPartial, Action<string> onFinal, Action<float> onRms)
            : base("android.speech.RecognitionListener")
        {
            this.onPartial = onPartial;
            this.onFinal = onFinal;
            this.onRms = onRms;
        }

        public void onReadyForSpeech(AndroidJavaObject bundle) { }
        public void onBeginningOfSpeech() { }
        public void onRmsChanged(float rms)
        {
            if (onRms != null) onRms(rms);
        }
        public void onBufferReceived(byte[] buffer) { }
        public void onEndOfSpeech() { }
        public void onError(int error) { }
        public void onPartialResults(AndroidJavaObject bundle) { Read(bundle, false); }
        public void onResults(AndroidJavaObject bundle) { Read(bundle, true); }
        public void onEvent(int type, AndroidJavaObject bundle) { }

        void Read(AndroidJavaObject bundle, bool isFinal)
        {
            if (bundle == null) return;
            AndroidJavaObject list = bundle.Call<AndroidJavaObject>("getStringArrayList", "results_recognition");
            if (list == null) return;
            string text = list.Call<string>("get", 0);
            if (string.IsNullOrEmpty(text)) return;
            if (isFinal) onFinal(text);
            else onPartial(text);
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
