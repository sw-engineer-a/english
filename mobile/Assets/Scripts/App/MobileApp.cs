using UnityEngine;

public class MobileApp : MonoBehaviour
{
    void Awake()
    {
        Screen.autorotateToPortrait = true;
        Screen.autorotateToPortraitUpsideDown = false;
        Screen.autorotateToLandscapeLeft = false;
        Screen.autorotateToLandscapeRight = false;
        Screen.orientation = ScreenOrientation.Portrait;
        if (GetComponent<DragonApp>() == null) gameObject.AddComponent<DragonApp>();
    }
}
