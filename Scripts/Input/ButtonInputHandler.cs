using System;
using UnityEngine;
using NeonSnake.Core;

namespace NeonSnake.Input
{
    /// <summary>
    /// On-screen Virtual D-Pad touch button control handler (US-202 / FR-06).
    /// </summary>
    public class ButtonInputHandler : MonoBehaviour, ISnakeInputProvider
    {
        public event Action<Direction> OnDirectionRequested;
        public bool IsEnabled { get; private set; } = true;

        public void EnableInput()
        {
            IsEnabled = true;
            gameObject.SetActive(true);
        }

        public void DisableInput()
        {
            IsEnabled = false;
            gameObject.SetActive(false);
        }

        /// <summary>
        /// Direct button click / pointer down event trigger.
        /// </summary>
        public void OnDirectionButtonClicked(int directionIndex)
        {
            if (!IsEnabled) return;

            Direction requestedDir = directionIndex switch
            {
                0 => Direction.Up,
                1 => Direction.Down,
                2 => Direction.Left,
                3 => Direction.Right,
                _ => Direction.None
            };

            if (requestedDir != Direction.None)
            {
                OnDirectionRequested?.Invoke(requestedDir);
            }
        }
    }
}
