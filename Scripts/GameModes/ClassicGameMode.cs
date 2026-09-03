using System;

namespace NeonSnake.GameModes
{
    /// <summary>
    /// Endless Classic Mode featuring progressive speed ramping (US-402 / FR-13).
    /// </summary>
    public class ClassicGameMode : IGameMode
    {
        public string ModeId => "CLASSIC";
        public string ModeDisplayName => "Classic Mode (Endless)";

        public float BaseTickInterval { get; private set; } = 0.200f; // 200ms
        public float MinTickInterval { get; private set; } = 0.060f;  // 60ms min cap
        public float CurrentTickInterval { get; private set; } = 0.200f;

        public int CurrentScore { get; private set; } = 0;

        public void InitializeMode()
        {
            CurrentScore = 0;
            CurrentTickInterval = BaseTickInterval;
        }

        public void OnTick(float deltaTime)
        {
            // Classic mode tick logic
        }

        /// <summary>
        /// Recalculates movement tick speed decay on food consumption.
        /// Interval = BaseInterval * (0.95 ^ (Score / 10)), clamped to MinTickInterval.
        /// </summary>
        public void OnFoodEaten(int points)
        {
            CurrentScore += points;
            int foodCount = CurrentScore / 10;
            float decayFactor = (float)Math.Pow(0.95, foodCount);
            CurrentTickInterval = Math.Max(MinTickInterval, BaseTickInterval * decayFactor);
        }

        public bool CheckGameOverCondition()
        {
            // Classic mode ends on wall or self collision
            return false;
        }

        public void TeardownMode()
        {
            CurrentScore = 0;
        }
    }
}
