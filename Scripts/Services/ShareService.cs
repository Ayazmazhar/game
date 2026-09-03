using System;
using UnityEngine;

namespace NeonSnake.Services
{
    /// <summary>
    /// Native Android Score Share Intent Bridge (US-603 / SDD Section 3.4 / FR-21).
    /// </summary>
    public class ShareService
    {
        public event Action<string, bool> OnScoreShared;

        public string FormatShareMessage(int score, string modeName = "Classic")
        {
            return $"I just scored {score} in Neon Snake: Light ({modeName} Mode)! Can you beat my high score?";
        }

        public bool ShareScore(int score, string modeName = "Classic")
        {
            string message = FormatShareMessage(score, modeName);
            bool success = FalseFallbackShare(message);

#if UNITY_ANDROID && !UNITY_EDITOR
            try
            {
                using (AndroidJavaClass intentClass = new AndroidJavaClass("android.content.Intent"))
                using (AndroidJavaObject intentObject = new AndroidJavaObject("android.content.Intent"))
                {
                    intentObject.Call<AndroidJavaObject>("setAction", intentClass.GetStatic<string>("ACTION_SEND"));
                    intentObject.Call<AndroidJavaObject>("setType", "text/plain");
                    intentObject.Call<AndroidJavaObject>("putExtra", intentClass.GetStatic<string>("EXTRA_TEXT"), message);

                    using (AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer"))
                    using (AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity"))
                    using (AndroidJavaObject chooser = intentClass.CallStatic<AndroidJavaObject>("createChooser", intentObject, "Share High Score via"))
                    {
                        currentActivity.Call("startActivity", chooser);
                        success = true;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[SHARE SERVICE] Android Intent dispatch failed: {ex.Message}");
                success = false;
            }
#endif

            OnScoreShared?.Invoke(message, success);
            return success;
        }

        private bool FalseFallbackShare(string message)
        {
            Debug.Log($"[SHARE SERVICE MOCK] Intent message ready: \"{message}\"");
            return true;
        }
    }
}
