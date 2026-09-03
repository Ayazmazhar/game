using System;
using System.Collections.Generic;

namespace NeonSnake.Core
{
    /// <summary>
    /// Food generation and collection subsystem (US-301 / FR-07, FR-08).
    /// Finds unoccupied grid positions and handles food consumption events.
    /// </summary>
    public class FoodManager
    {
        private readonly int gridWidth;
        private readonly int gridHeight;
        private readonly Random random = new Random();

        public GridPosition ActiveFoodPosition { get; private set; }
        public int DefaultPointValue { get; set; } = 10;

        public event Action<int, GridPosition> OnFoodEaten;
        public event Action<GridPosition> OnFoodSpawned;

        public FoodManager(int width = 20, int height = 30)
        {
            gridWidth = width;
            gridHeight = height;
            ActiveFoodPosition = new GridPosition(15, 20);
        }

        /// <summary>
        /// Attempts to select a random grid position not occupied by the snake body.
        /// </summary>
        public bool SpawnFood(IReadOnlyList<GridPosition> occupiedPositions)
        {
            var occupiedSet = new HashSet<GridPosition>();
            if (occupiedPositions != null)
            {
                foreach (var pos in occupiedPositions)
                {
                    occupiedSet.Add(pos);
                }
            }

            var availableCells = new List<GridPosition>();
            for (int x = 0; x < gridWidth; x++)
            {
                for (int y = 0; y < gridHeight; y++)
                {
                    var cell = new GridPosition(x, y);
                    if (!occupiedSet.Contains(cell))
                    {
                        availableCells.Add(cell);
                    }
                }
            }

            if (availableCells.Count == 0) return false; // Grid full (win state)

            int idx = random.Next(0, availableCells.Count);
            ActiveFoodPosition = availableCells[idx];

            OnFoodSpawned?.Invoke(ActiveFoodPosition);
            return true;
        }

        /// <summary>
        /// Checks if head position matches active food position.
        /// </summary>
        public bool CheckFoodCollision(GridPosition head)
        {
            return head.X == ActiveFoodPosition.X && head.Y == ActiveFoodPosition.Y;
        }

        /// <summary>
        /// Triggers food eaten event and awards points.
        /// </summary>
        public void ConsumeFood(IReadOnlyList<GridPosition> occupiedPositions, int pointsOverride = -1)
        {
            int pts = pointsOverride > 0 ? pointsOverride : DefaultPointValue;
            OnFoodEaten?.Invoke(pts, ActiveFoodPosition);
            SpawnFood(occupiedPositions);
        }
    }
}
