using System;
using UnityEngine;

namespace NeonSnake.Services
{
    /// <summary>
    /// Device Haptic Vibration Feedback Subsystem (US-602 / SDD Section 3.4 / FR-20).
    /// </summary>
    public class HapticsManager
    {
        public bool IsVibrationEnabled { get; private set; } = true;

        public event Action<int, bool> OnHapticTriggered;

        public HapticsManager(bool initialVibrationState = true)
        {
            IsVibrationEnabled = initialVibrationState;
        }

        public void SetVibrationEnabled(bool enabled)
        {
            IsVibrationEnabled = enabled;
        }

        public bool TriggerFoodEatenHaptic()
        {
            return TriggerPulse(30); // 30ms pulse for food collection
        }

        public bool TriggerCrashHaptic()
        {
            return TriggerPulse(200); // 200ms pulse for crash impact
        }

        public bool TriggerButtonClickHaptic()
        {
            return TriggerPulse(15); // 15ms micro-pulse for UI clicks
        }

        public bool TriggerPulse(int milliseconds)
        {
            if (!IsVibrationEnabled)
            {
                OnHapticTriggered?.Invoke(milliseconds, false);
                return false;
            }

#if UNITY_ANDROID && !UNITY_EDITOR
            try
            {
                using (AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer"))
                using (AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity"))
                using (AndroidJavaObject vibrator = currentActivity.Call<AndroidJavaObject>("getSystemService", "vibrator"))
                {
                    if (vibrator != null && vibrator.Call<bool>("hasVibrator"))
                    {
                        vibrator.Call("vibrate", (long)milliseconds);
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[HAPTICS] Native vibration failed: {ex.Message}");
                Handheld.Vibrate();
            }
#else
            Debug.Log($"[HAPTICS MOCK] Vibration triggered: {milliseconds}ms pulse.");
#endif

            OnHapticTriggered?.Invoke(milliseconds, true);
            return true;
        }
    }
}
