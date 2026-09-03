using System;
using System.Collections.Generic;

namespace NeonSnake.Core
{
    /// <summary>
    /// Reusable generic object pooler for game visual segments (US-105).
    /// Pre-allocates instances during BootState to eliminate GC frame spikes.
    /// </summary>
    public class ObjectPooler<T> where T : class
    {
        private readonly Stack<T> pool = new Stack<T>();
        private readonly Func<T> factoryMethod;
        private readonly Action<T> onGet;
        private readonly Action<T> onRelease;

        public int TotalCreated { get; private set; }
        public int AvailableCount => pool.Count;
        public int ActiveCount => TotalCreated - pool.Count;

        public ObjectPooler(Func<T> factory, Action<T> getAction = null, Action<T> releaseAction = null, int initialCapacity = 100)
        {
            factoryMethod = factory ?? throw new ArgumentNullException(nameof(factory));
            onGet = getAction;
            onRelease = releaseAction;

            Prewarm(initialCapacity);
        }

        public void Prewarm(int count)
        {
            for (int i = 0; i < count; i++)
            {
                T item = factoryMethod();
                TotalCreated++;
                onRelease?.Invoke(item);
                pool.Push(item);
            }
        }

        public T Get()
        {
            T item;
            if (pool.Count > 0)
            {
                item = pool.Pop();
            }
            else
            {
                item = factoryMethod();
                TotalCreated++;
            }

            onGet?.Invoke(item);
            return item;
        }

        public void Release(T item)
        {
            if (item == null) return;
            onRelease?.Invoke(item);
            pool.Push(item);
        }
    }
}
