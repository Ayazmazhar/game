using System;
using UnityEngine;

namespace NeonSnake.UI
{
    /// <summary>
    /// Main Menu View Presenter (US-501 / FR-02).
    /// Handles Main Menu UI button interactions and dispatches navigation events.
    /// </summary>
    public class MainMenuView : MonoBehaviour
    {
        public event Action OnPlayClicked;
        public event Action OnModesClicked;
        public event Action OnSkinsClicked;
        public event Action OnSettingsClicked;
        public event Action OnHighScoresClicked;
        public event Action OnShareClicked;

        public void TriggerPlay() => OnPlayClicked?.Invoke();
        public void TriggerModes() => OnModesClicked?.Invoke();
        public void TriggerSkins() => OnSkinsClicked?.Invoke();
        public void TriggerSettings() => OnSettingsClicked?.Invoke();
        public void TriggerHighScores() => OnHighScoresClicked?.Invoke();
        public void TriggerShare() => OnShareClicked?.Invoke();
    }
}
