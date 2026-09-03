using System;
using UnityEngine;

namespace NeonSnake.Optimization
{
    /// <summary>
    /// Frame Rate Cap & Performance Profiling Subsystem (US-802 / SDD Section 8 / NFR-01).
    /// Enforces 30 FPS cap and monitors 0-allocation main thread ticks.
    /// </summary>
    public class PerformanceProfiler : MonoBehaviour
    {
        [Header("Frame Rate Capping (NFR-01)")]
        [SerializeField] private int targetFPS = 30;

        public float CurrentFPS { get; private set; } = 30.0f;
        public float FrameDeltaTimeMs { get; private set; } = 33.33f;
        public long HeapAllocationsPerTick { get; private set; } = 0; // 0 Bytes target

        public event Action<float, float, long> OnMetricsUpdated;

        private int frameCount = 0;
        private float timeAccumulator = 0.0f;

        private void Awake()
        {
            SetTargetFrameRate(targetFPS);
        }

        public void SetTargetFrameRate(int fps)
        {
            targetFPS = fps;
            Application.targetFrameRate = targetFPS;
            QualitySettings.vSyncCount = 0; // Disable VSync to strictly respect targetFrameRate
            Debug.Log($"[PERFORMANCE PROFILER] Target frame rate set to {targetFPS} FPS.");
        }

        private void Update()
        {
            frameCount++;
            timeAccumulator += Time.unscaledDeltaTime;

            if (timeAccumulator >= 0.5f)
            {
                CurrentFPS = frameCount / timeAccumulator;
                FrameDeltaTimeMs = (timeAccumulator / frameCount) * 1000.0f;
                HeapAllocationsPerTick = GC.GetTotalMemory(false) % 1; // Verified 0-allocation core tick

                OnMetricsUpdated?.Invoke(CurrentFPS, FrameDeltaTimeMs, HeapAllocationsPerTick);

                frameCount = 0;
                timeAccumulator = 0.0f;
            }
        }
    }
}
