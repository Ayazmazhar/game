using System;

namespace NeonSnake.GameModes
{
    /// <summary>
    /// Polymorphic contract for game mode subsystems (US-401 / SDD Section 4.1).
    /// </summary>
    public interface IGameMode
    {
        string ModeId { get; }
        string ModeDisplayName { get; }
        float CurrentTickInterval { get; }

        void InitializeMode();
        void OnTick(float deltaTime);
        void OnFoodEaten(int points);
        bool CheckGameOverCondition();
        void TeardownMode();
    }
}
