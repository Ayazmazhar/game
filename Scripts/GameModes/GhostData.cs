using System;
using System.Collections.Generic;

namespace NeonSnake.GameModes
{
    /// <summary>
    /// Individual snapshot frame of snake position and movement direction for ghost playback (US-404 / FR-16).
    /// </summary>
    [Serializable]
    public struct GhostFrame
    {
        public float Timestamp;
        public int Direction;
        public int HeadX;
        public int HeadY;

        public GhostFrame(float timestamp, int dir, int x, int y)
        {
            Timestamp = timestamp;
            Direction = dir;
            HeadX = x;
            HeadY = y;
        }
    }

    /// <summary>
    /// Complete serializable recording of a player run for ghost mode visualization (US-404 / SDD Section 6.1).
    /// </summary>
    [Serializable]
    public class GhostRecording
    {
        public int FinalScore;
        public float TotalDuration;
        public List<GhostFrame> Frames = new List<GhostFrame>();

        public void AddFrame(float timestamp, int dir, int headX, int headY)
        {
            Frames.Add(new GhostFrame(timestamp, dir, headX, headY));
        }
    }
}
