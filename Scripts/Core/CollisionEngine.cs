using System.Collections.Generic;

namespace NeonSnake.Core
{
    /// <summary>
    /// Pure domain engine for detecting grid boundaries and self-body collisions (US-104).
    /// Implements FR-09 and guarantees 0 Bytes heap allocation per tick.
    /// </summary>
    public class CollisionEngine
    {
        private readonly int gridWidth;
        private readonly int gridHeight;

        public CollisionEngine(int width, int height)
        {
            gridWidth = width;
            gridHeight = height;
        }

        /// <summary>
        /// Validates whether the given head position has crossed the grid boundary.
        /// </summary>
        public bool IsWallCollision(GridPosition head)
        {
            return head.X < 0 || head.X >= gridWidth || head.Y < 0 || head.Y >= gridHeight;
        }

        /// <summary>
        /// Checks zero-allocation collision between the head and body segments (skipping head itself at index 0).
        /// </summary>
        public bool IsSelfCollision(GridPosition head, IReadOnlyList<GridPosition> body)
        {
            if (body == null || body.Count <= 1) return false;

            for (int i = 1; i < body.Count; i++)
            {
                if (head.X == body[i].X && head.Y == body[i].Y)
                {
                    return true;
                }
            }
            return false;
        }
    }
}
