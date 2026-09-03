using System;
using UnityEngine;
using NeonSnake.Core;

namespace NeonSnake.Input
{
    /// <summary>
    /// Touch swipe gesture detection handler (US-201 / FR-05).
    /// Calculates touch drag vectors and evaluates dominant axes against configurable pixel thresholds.
    /// </summary>
    public class SwipeInputHandler : MonoBehaviour, ISnakeInputProvider
    {
        [Header("Swipe Config")]
        [SerializeField] private float minSwipeThresholdPx = 50.0f;

        private Vector2 touchStartPos;
        private bool isSwiping = false;

        public event Action<Direction> OnDirectionRequested;
        public bool IsEnabled { get; private set; } = true;

        public float MinSwipeThresholdPx
        {
            get => minSwipeThresholdPx;
            set => minSwipeThresholdPx = Mathf.Max(10.0f, value);
        }

        public void EnableInput()
        {
            IsEnabled = true;
            isSwiping = false;
        }

        public void DisableInput()
        {
            IsEnabled = false;
            isSwiping = false;
        }

        private void Update()
        {
            if (!IsEnabled) return;

            // Touch Input Processing (Android / Mobile)
            if (UnityEngine.Input.touchCount > 0)
            {
                Touch touch = UnityEngine.Input.GetTouch(0);

                if (touch.phase == TouchPhase.Began)
                {
                    touchStartPos = touch.position;
                    isSwiping = true;
                }
                else if (touch.phase == TouchPhase.Ended && isSwiping)
                {
                    Vector2 touchEndPos = touch.position;
                    ProcessSwipe(touchStartPos, touchEndPos);
                    isSwiping = false;
                }
            }
            // Mouse Drag Fallback (Unity Editor / PC)
            else
            {
                if (UnityEngine.Input.GetMouseButtonDown(0))
                {
                    touchStartPos = UnityEngine.Input.mousePosition;
                    isSwiping = true;
                }
                else if (UnityEngine.Input.GetMouseButtonUp(0) && isSwiping)
                {
                    Vector2 touchEndPos = UnityEngine.Input.mousePosition;
                    ProcessSwipe(touchStartPos, touchEndPos);
                    isSwiping = false;
                }
            }
        }

        /// <summary>
        /// Evaluates touch drag vector Delta = TouchEnd - TouchStart and determines dominant axis.
        /// </summary>
        public Direction ProcessSwipe(Vector2 start, Vector2 end)
        {
            Vector2 delta = end - start;

            if (delta.magnitude < minSwipeThresholdPx)
            {
                return Direction.None; // Sub-threshold gesture rejected
            }

            Direction cardinalDir;
            if (Mathf.Abs(delta.x) > Mathf.Abs(delta.y))
            {
                // Horizontal dominant axis
                cardinalDir = delta.x > 0 ? Direction.Right : Direction.Left;
            }
            else
            {
                // Vertical dominant axis
                cardinalDir = delta.y > 0 ? Direction.Up : Direction.Down;
            }

            if (IsEnabled)
            {
                OnDirectionRequested?.Invoke(cardinalDir);
            }

            return cardinalDir;
        }
    }
}
