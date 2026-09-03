using System;
using System.Collections.Generic;

namespace NeonSnake.Core
{
    /// <summary>
    /// Core Domain controller for Snake body management and movement ticks (US-103).
    /// Implements FR-03 and FR-04 (180-degree turn rejection).
    /// </summary>
    public class SnakeController
    {
        private readonly List<GridPosition> bodyParts = new List<GridPosition>();
        private Direction currentDirection = Direction.Right;
        private Direction pendingDirection = Direction.Right;

        public GridPosition HeadPosition => bodyParts.Count > 0 ? bodyParts[0] : new GridPosition(0, 0);
        public IReadOnlyList<GridPosition> BodyParts => bodyParts;
        public Direction CurrentDirection => currentDirection;
        public Direction PendingDirection => pendingDirection;

        public event Action<GridPosition> OnHeadMoved;
        public event Action<GridPosition> OnTailRemoved;
        public event Action OnGrown;

        public void Initialize(GridPosition startPos, int initialLength = 3, Direction initialDirection = Direction.Right)
        {
            bodyParts.Clear();
            currentDirection = initialDirection;
            pendingDirection = initialDirection;

            int dx = initialDirection switch
            {
                Direction.Right => -1,
                Direction.Left => 1,
                _ => 0
            };
            int dy = initialDirection switch
            {
                Direction.Up => -1,
                Direction.Down => 1,
                _ => 0
            };

            for (int i = 0; i < initialLength; i++)
            {
                bodyParts.Add(new GridPosition(startPos.X + (dx * i), startPos.Y + (dy * i)));
            }
        }

        /// <summary>
        /// Validates direction change request against immediate 180-degree turn reversals.
        /// </summary>
        public bool RequestDirectionChange(Direction newDirection)
        {
            if (newDirection == Direction.None || IsOppositeDirection(currentDirection, newDirection))
            {
                return false; // Invalid or 180-degree reversal rejected
            }
            pendingDirection = newDirection;
            return true;
        }

        /// <summary>
        /// Executes a single discrete movement step tick.
        /// </summary>
        public void StepForward(bool growNextStep = false)
        {
            currentDirection = pendingDirection;
            GridPosition newHead = CalculateNextHeadPosition(bodyParts[0], currentDirection);

            bodyParts.Insert(0, newHead);
            OnHeadMoved?.Invoke(newHead);

            if (!growNextStep)
            {
                int lastIndex = bodyParts.Count - 1;
                GridPosition removedTail = bodyParts[lastIndex];
                bodyParts.RemoveAt(lastIndex);
                OnTailRemoved?.Invoke(removedTail);
            }
            else
            {
                OnGrown?.Invoke();
            }
        }

        /// <summary>
        /// Checks whether two directions are opposite (180-degree turn).
        /// </summary>
        public static bool IsOppositeDirection(Direction current, Direction requested)
        {
            return (current == Direction.Up && requested == Direction.Down) ||
                   (current == Direction.Down && requested == Direction.Up) ||
                   (current == Direction.Left && requested == Direction.Right) ||
                   (current == Direction.Right && requested == Direction.Left);
        }

        /// <summary>
        /// Clears snake body segments within the surrounding 3x3 radius of the head to safely resume gameplay on revive (US-702).
        /// </summary>
        public int ClearSurroundingRadius(int radius = 1)
        {
            if (bodyParts.Count <= 1) return 0;

            GridPosition head = HeadPosition;
            int removedCount = 0;

            for (int i = bodyParts.Count - 1; i >= 1; i--)
            {
                GridPosition pos = bodyParts[i];
                if (Math.Abs(pos.X - head.X) <= radius && Math.Abs(pos.Y - head.Y) <= radius)
                {
                    bodyParts.RemoveAt(i);
                    removedCount++;
                }
            }
            return removedCount;
        }

        private static GridPosition CalculateNextHeadPosition(GridPosition current, Direction dir)
        {
            return dir switch
            {
                Direction.Up => new GridPosition(current.X, current.Y + 1),
                Direction.Down => new GridPosition(current.X, current.Y - 1),
                Direction.Left => new GridPosition(current.X - 1, current.Y),
                Direction.Right => new GridPosition(current.X + 1, current.Y),
                _ => current
            };
        }
    }
}
