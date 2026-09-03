using System;

namespace NeonSnake.GameModes
{
    /// <summary>
    /// Time Attack Mode with fixed 60-second countdown timer (US-403 / FR-14).
    /// </summary>
    public class TimeAttackGameMode : IGameMode
    {
        public string ModeId => "TIME_ATTACK";
        public string ModeDisplayName => "Time Attack (60s)";

        public float TotalTimeLimit { get; private set; } = 60.0f;
        public float RemainingTime { get; private set; } = 60.0f;
        public float CurrentTickInterval { get; private set; } = 0.120f; // Fixed crisp speed

        public event Action<float> OnTimerUpdated;
        public event Action OnTimeExpired;

        public void InitializeMode()
        {
            RemainingTime = TotalTimeLimit;
            OnTimerUpdated?.Invoke(RemainingTime);
        }

        public void OnTick(float deltaTime)
        {
            if (RemainingTime > 0)
            {
                RemainingTime = Math.Max(0.0f, RemainingTime - deltaTime);
                OnTimerUpdated?.Invoke(RemainingTime);

                if (RemainingTime <= 0.0f)
                {
                    OnTimeExpired?.Invoke();
                }
            }
        }

        public void OnFoodEaten(int points)
        {
            // Time Attack score tracking
        }

        public bool CheckGameOverCondition()
        {
            return RemainingTime <= 0.0f;
        }

        public void TeardownMode()
        {
            RemainingTime = TotalTimeLimit;
        }
    }
}
