using System;

namespace NeonSnake.Core
{
    /// <summary>
    /// Score tracking model (US-302 / FR-11).
    /// Manages session score, high score evaluation, and multiplier calculations.
    /// </summary>
    public class ScoreModel
    {
        public int CurrentScore { get; private set; } = 0;
        public int HighScore { get; private set; } = 0;

        public event Action<int> OnScoreChanged;
        public event Action<int> OnHighScoreUpdated;

        public ScoreModel(int initialHighScore = 0)
        {
            HighScore = Math.Max(0, initialHighScore);
        }

        public void AddScore(int points)
        {
            if (points <= 0) return;

            CurrentScore += points;
            OnScoreChanged?.Invoke(CurrentScore);

            if (CurrentScore > HighScore)
            {
                HighScore = CurrentScore;
                OnHighScoreUpdated?.Invoke(HighScore);
            }
        }

        public void ResetSessionScore()
        {
            CurrentScore = 0;
            OnScoreChanged?.Invoke(CurrentScore);
        }

        public void SetHighScore(int loadedHighScore)
        {
            HighScore = Math.Max(0, loadedHighScore);
            OnHighScoreUpdated?.Invoke(HighScore);
        }
    }
}
