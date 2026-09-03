namespace NeonSnake.GameModes
{
    /// <summary>
    /// Extensibility stub for Level Mode with obstacles and stage goals (US-404 / FR-15).
    /// </summary>
    public class LevelGameMode : IGameMode
    {
        public string ModeId => "LEVEL_MODE";
        public string ModeDisplayName => "Level Mode (Stage 1)";

        public float CurrentTickInterval { get; private set; } = 0.150f;
        public int TargetScoreGoal { get; private set; } = 150;
        public int CurrentScore { get; private set; } = 0;

        public void InitializeMode()
        {
            CurrentScore = 0;
        }

        public void OnTick(float deltaTime)
        {
        }

        public void OnFoodEaten(int points)
        {
            CurrentScore += points;
        }

        public bool CheckGameOverCondition()
        {
            return false;
        }

        public bool CheckWinCondition()
        {
            return CurrentScore >= TargetScoreGoal;
        }

        public void TeardownMode()
        {
            CurrentScore = 0;
        }
    }
}
