using System;

namespace NeonSnake.Core
{
    /// <summary>
    /// Manages the logical 2D grid subsystem (US-102).
    /// Maps integer coordinates (0,0) through (Width-1, Height-1) to normalized world space.
    /// </summary>
    public class GridManager
    {
        public int Width { get; private set; }
        public int Height { get; private set; }
        public float CellSize { get; private set; }

        public GridManager(int width = 20, int height = 30, float cellSize = 1.0f)
        {
            if (width <= 0 || height <= 0)
                throw new ArgumentException("Grid dimensions must be greater than zero.");
            
            Width = width;
            Height = height;
            CellSize = cellSize;
        }

        /// <summary>
        /// Checks if a given GridPosition lies strictly inside grid bounds.
        /// </summary>
        public bool IsWithinBounds(GridPosition position)
        {
            return position.X >= 0 && position.X < Width && position.Y >= 0 && position.Y < Height;
        }

        /// <summary>
        /// Converts logical grid coordinates to 2D centered world position.
        /// </summary>
        public (float x, float y) GridToWorldPosition(GridPosition position)
        {
            float offsetX = (Width - 1) * CellSize / 2.0f;
            float offsetY = (Height - 1) * CellSize / 2.0f;
            return (position.X * CellSize - offsetX, position.Y * CellSize - offsetY);
        }

        /// <summary>
        /// Converts 2D world position back to nearest discrete grid coordinates.
        /// </summary>
        public GridPosition WorldToGridPosition(float worldX, float worldY)
        {
            float offsetX = (Width - 1) * CellSize / 2.0f;
            float offsetY = (Height - 1) * CellSize / 2.0f;

            int gridX = (int)Math.Round((worldX + offsetX) / CellSize);
            int gridY = (int)Math.Round((worldY + offsetY) / CellSize);

            return new GridPosition(gridX, gridY);
        }
    }
}
