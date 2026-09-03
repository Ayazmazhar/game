using System;

namespace NeonSnake.Customization
{
    /// <summary>
    /// Dynamic Light & Dark Theme Manager (US-502 / FR-18).
    /// </summary>
    public class ThemeManager
    {
        public ThemeMode CurrentMode { get; private set; } = ThemeMode.Dark;
        public ThemeData CurrentTheme { get; private set; }

        public event Action<ThemeData> OnThemeChanged;

        public ThemeManager(ThemeMode initialMode = ThemeMode.Dark)
        {
            SetTheme(initialMode);
        }

        public void SetTheme(ThemeMode mode)
        {
            CurrentMode = mode;
            CurrentTheme = mode == ThemeMode.Light 
                ? ThemeData.CreateLightTheme() 
                : ThemeData.CreateDarkTheme();

            OnThemeChanged?.Invoke(CurrentTheme);
        }

        public void ToggleTheme()
        {
            ThemeMode newMode = CurrentMode == ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark;
            SetTheme(newMode);
        }
    }
}
