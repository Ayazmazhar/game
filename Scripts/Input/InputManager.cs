using System;
using UnityEngine;
using NeonSnake.Core;

namespace NeonSnake.Input
{
    public enum InputControlType
    {
        Swipe,
        Buttons
    }

    /// <summary>
    /// Central manager for controlling active input providers and runtime mode switching.
    /// </summary>
    public class InputManager : MonoBehaviour
    {
        [SerializeField] private SwipeInputHandler swipeHandler;
        [SerializeField] private ButtonInputHandler buttonHandler;

        public InputControlType ActiveControlType { get; private set; } = InputControlType.Swipe;
        public ISnakeInputProvider ActiveProvider => ActiveControlType == InputControlType.Swipe ? (ISnakeInputProvider)swipeHandler : buttonHandler;

        public event Action<Direction> OnDirectionRequested;

        private void Awake()
        {
            if (swipeHandler != null) swipeHandler.OnDirectionRequested += HandleDirectionRequested;
            if (buttonHandler != null) buttonHandler.OnDirectionRequested += HandleDirectionRequested;

            SetControlType(InputControlType.Swipe);
        }

        private void OnDestroy()
        {
            if (swipeHandler != null) swipeHandler.OnDirectionRequested -= HandleDirectionRequested;
            if (buttonHandler != null) buttonHandler.OnDirectionRequested -= HandleDirectionRequested;
        }

        public void SetControlType(InputControlType type)
        {
            ActiveControlType = type;

            if (type == InputControlType.Swipe)
            {
                swipeHandler?.EnableInput();
                buttonHandler?.DisableInput();
            }
            else
            {
                buttonHandler?.EnableInput();
                swipeHandler?.DisableInput();
            }
        }

        private void HandleDirectionRequested(Direction dir)
        {
            OnDirectionRequested?.Invoke(dir);
        }
    }
}
