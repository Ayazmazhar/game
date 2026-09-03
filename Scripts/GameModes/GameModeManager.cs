using System;
using System.Collections.Generic;

namespace NeonSnake.GameModes
{
    /// <summary>
    /// Lifecycle manager for polymorphic game mode instances (US-401 / SDD Section 3.3).
    /// </summary>
    public class GameModeManager
    {
        private readonly Dictionary<string, IGameMode> registeredModes = new Dictionary<string, IGameMode>();

        public IGameMode ActiveMode { get; private set; }

        public event Action<IGameMode> OnModeChanged;

        public void RegisterMode(IGameMode mode)
        {
            if (mode == null || string.IsNullOrEmpty(mode.ModeId)) return;
            registeredModes[mode.ModeId] = mode;
        }

        public bool SelectMode(string modeId)
        {
            if (!registeredModes.TryGetValue(modeId, out var targetMode))
            {
                return false;
            }

            if (ActiveMode != null)
            {
                ActiveMode.TeardownMode();
            }

            ActiveMode = targetMode;
            ActiveMode.InitializeMode();
            OnModeChanged?.Invoke(ActiveMode);
            return true;
        }

        public void UpdateActiveMode(float deltaTime)
        {
            ActiveMode?.OnTick(deltaTime);
        }

        public void HandleFoodEaten(int points)
        {
            ActiveMode?.OnFoodEaten(points);
        }
    }
}
