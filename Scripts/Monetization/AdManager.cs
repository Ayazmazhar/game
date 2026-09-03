using System;
using UnityEngine;

namespace NeonSnake.Monetization
{
    /// <summary>
    /// Google AdMob Bridge & Monetization Manager (US-701, US-702, US-703 / FR-22, FR-23, FR-24).
    /// </summary>
    public class AdManager : MonoBehaviour
    {
        public static readonly string TEST_REWARDED_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

        public bool IsInitialized { get; private set; } = false;
        public bool IsAdLoaded { get; private set; } = false;
        public bool IsOffline { get; set; } = false;

        public event Action OnAdInitialized;
        public event Action OnAdLoaded;
        public event Action<string> OnAdFailedToLoad;
        public event Action OnUserEarnedReward;
        public event Action OnAdClosed;

        public void InitializeSDKAsync()
        {
            Debug.Log("[ADMOB] Initializing Google Mobile Ads SDK asynchronously...");
            
            // Simulate async initialization completion
            IsInitialized = true;
            OnAdInitialized?.Invoke();
            LoadRewardedAd();
        }

        public void LoadRewardedAd()
        {
            if (IsOffline || Application.internetReachability == NetworkReachability.NotReachable)
            {
                IsAdLoaded = false;
                OnAdFailedToLoad?.Invoke("Network unreachable (Offline mode)");
                return;
            }

            // Simulate loading rewarded ad using Google Test Ad Unit ID
            IsAdLoaded = true;
            OnAdLoaded?.Invoke();
        }

        public bool IsRewardedAdReady()
        {
            if (IsOffline || Application.internetReachability == NetworkReachability.NotReachable)
            {
                return false;
            }
            return IsInitialized && IsAdLoaded;
        }

        public bool ShowRewardedAd(Action rewardCallback)
        {
            if (!IsRewardedAdReady())
            {
                Debug.LogWarning("[ADMOB] Cannot show rewarded ad: Ad not ready or offline.");
                return false;
            }

            Debug.Log("[ADMOB] Displaying Rewarded Video Ad...");
            
            // Simulate completed video callback
            OnUserEarnedReward += rewardCallback;
            OnUserEarnedReward?.Invoke();
            OnUserEarnedReward -= rewardCallback;

            IsAdLoaded = false; // Ad consumed
            LoadRewardedAd();   // Preload next ad
            OnAdClosed?.Invoke();
            return true;
        }

        public void SimulateAdCloseWithoutReward()
        {
            Debug.Log("[ADMOB] Player closed ad early without reward.");
            OnAdClosed?.Invoke();
        }
    }
}
