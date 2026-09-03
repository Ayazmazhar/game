using System;

namespace NeonSnake.Core
{
    /// <summary>
    /// Value-type struct representing discrete integer coordinates on the 2D logical grid.
    /// Guarantees zero heap allocation when passed or stored.
    /// </summary>
    public struct GridPosition : IEquatable<GridPosition>
    {
        public int X;
        public int Y;

        public GridPosition(int x, int y)
        {
            X = x;
            Y = y;
        }

        public static bool operator ==(GridPosition a, GridPosition b)
        {
            return a.X == b.X && a.Y == b.Y;
        }

        public static bool operator !=(GridPosition a, GridPosition b)
        {
            return !(a == b);
        }

        public bool Equals(GridPosition other)
        {
            return X == other.X && Y == other.Y;
        }

        public override bool Equals(object obj)
        {
            return obj is GridPosition other && Equals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(X, Y);
        }

        public override string ToString()
        {
            return $"({X}, {Y})";
        }
    }
}
