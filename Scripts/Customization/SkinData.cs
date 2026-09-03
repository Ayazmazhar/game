using System;
using System.Collections.Generic;
using UnityEngine;

namespace NeonSnake.Customization
{
    /// <summary>
    /// Color and sprite material profile for Snake skins (US-503 / FR-17).
    /// </summary>
    [Serializable]
    public class SkinData
    {
        public int SkinId;
        public string SkinName;
        public Color HeadColor;
        public Color BodyColor;
        public Color GlowColor;

        public static List<SkinData> GetDefaultSkinLibrary()
        {
            return new List<SkinData>
            {
                new SkinData { SkinId = 0, SkinName = "Default Neon Green", HeadColor = new Color(0.0f, 0.94f, 1.0f), BodyColor = new Color(0.0f, 1.0f, 0.4f), GlowColor = new Color(0.0f, 1.0f, 0.4f) },
                new SkinData { SkinId = 1, SkinName = "Cyan Cyber", HeadColor = new Color(0.0f, 0.4f, 1.0f), BodyColor = new Color(0.0f, 0.94f, 1.0f), GlowColor = new Color(0.0f, 0.94f, 1.0f) },
                new SkinData { SkinId = 2, SkinName = "Magenta Pink", HeadColor = new Color(1.0f, 0.0f, 0.47f), BodyColor = new Color(1.0f, 0.2f, 0.67f), GlowColor = new Color(1.0f, 0.0f, 0.47f) },
                new SkinData { SkinId = 3, SkinName = "Solar Yellow", HeadColor = new Color(1.0f, 0.8f, 0.0f), BodyColor = new Color(1.0f, 1.0f, 0.0f), GlowColor = new Color(1.0f, 0.8f, 0.0f) },
                new SkinData { SkinId = 4, SkinName = "Rainbow Pulse", HeadColor = new Color(1.0f, 1.0f, 1.0f), BodyColor = new Color(0.0f, 1.0f, 0.8f), GlowColor = new Color(1.0f, 0.0f, 1.0f) }
            };
        }
    }
}
