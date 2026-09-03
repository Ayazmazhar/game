using System;
using NeonSnake.Core;

namespace NeonSnake.Input
{
    /// <summary>
    /// Decoupled interface for snake movement input providers (US-201, US-202).
    /// </summary>
    public interface ISnakeInputProvider
    {
        event Action<Direction> OnDirectionRequested;

        bool IsEnabled { get; }
        void EnableInput();
        void DisableInput();
    }
}
