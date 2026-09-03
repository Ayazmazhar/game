using System;
using UnityEngine;
using NeonSnake.Customization;

namespace NeonSnake.UI
{
    /// <summary>
    /// Settings View Presenter for Themes and Controls (US-502 / FR-18).
    /// </summary>
    public class SettingsView : MonoBehaviour
    {
        public event Action<ThemeMode> OnThemeChanged;

        public void SelectTheme(ThemeMode mode)
        {
            OnThemeChanged?.Invoke(mode);
        }
    }
}
