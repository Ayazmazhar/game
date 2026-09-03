using System;
using UnityEngine;

namespace NeonSnake.Customization
{
    public enum ThemeMode
    {
        Dark = 0,
        Light = 1
    }

    /// <summary>
    /// Color palette definition for dynamic theme rendering (US-502 / SDD Section 6.1).
    /// </summary>
    [Serializable]
    public class ThemeData
    {
        public ThemeMode Mode;
        public string ThemeName;
        public Color BackgroundColor;
        public Color GridLineColor;
        public Color TextPrimaryColor;
        public Color CardBackgroundColor;

        public static ThemeData CreateDarkTheme()
        {
            return new ThemeData
            {
                Mode = ThemeMode.Dark,
                ThemeName = "Neon Cyber Dark",
                BackgroundColor = new Color(0.03f, 0.04f, 0.07f, 1.0f),
                GridLineColor = new Color(0.0f, 0.94f, 1.0f, 0.07f),
                TextPrimaryColor = new Color(0.97f, 0.98f, 0.99f, 1.0f),
                CardBackgroundColor = new Color(0.06f, 0.09f, 0.16f, 0.75f)
            };
        }

        public static ThemeData CreateLightTheme()
        {
            return new ThemeData
            {
                Mode = ThemeMode.Light,
                ThemeName = "Clean Neon Light",
                BackgroundColor = new Color(0.94f, 0.96f, 0.98f, 1.0f),
                GridLineColor = new Color(0.0f, 0.60f, 0.80f, 0.15f),
                TextPrimaryColor = new Color(0.06f, 0.09f, 0.16f, 1.0f),
                CardBackgroundColor = new Color(1.0f, 1.0f, 1.0f, 0.85f)
            };
        }
    }
}
