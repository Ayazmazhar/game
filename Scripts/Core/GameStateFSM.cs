using System;
using System.Collections.Generic;

namespace NeonSnake.Core
{
    public enum GameState
    {
        BootState,
        MainMenuState,
        GameLoopState,
        PausedState,
        GameOverState,
        RewardedState
    }

    /// <summary>
    /// Core application lifecycle Finite State Machine (US-101).
    /// Enforces strict transition rules according to SDD Section 5.
    /// </summary>
    public class GameStateFSM
    {
        public GameState CurrentState { get; private set; } = GameState.BootState;

        public event Action<GameState, GameState> OnStateChanged;

        private static readonly Dictionary<GameState, HashSet<GameState>> AllowedTransitions = new Dictionary<GameState, HashSet<GameState>>
        {
            { GameState.BootState, new HashSet<GameState> { GameState.MainMenuState } },
            { GameState.MainMenuState, new HashSet<GameState> { GameState.GameLoopState } },
            { GameState.GameLoopState, new HashSet<GameState> { GameState.PausedState, GameState.GameOverState } },
            { GameState.PausedState, new HashSet<GameState> { GameState.GameLoopState, GameState.MainMenuState } },
            { GameState.GameOverState, new HashSet<GameState> { GameState.MainMenuState, GameState.GameLoopState, GameState.RewardedState } },
            { GameState.RewardedState, new HashSet<GameState> { GameState.GameLoopState, GameState.GameOverState } }
        };

        public bool ChangeState(GameState newState)
        {
            if (CurrentState == newState) return false;

            if (AllowedTransitions.TryGetValue(CurrentState, out var validTargets) && validTargets.Contains(newState))
            {
                GameState previous = CurrentState;
                CurrentState = newState;
                OnStateChanged?.Invoke(previous, newState);
                return true;
            }

            return false; // Transition invalid
        }
    }
}
