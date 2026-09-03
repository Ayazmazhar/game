using System;
using System.Collections.Generic;

namespace NeonSnake.Persistence
{
    /// <summary>
    /// Data Transfer Object (DTO) for game high scores, settings, and anti-tamper security hash (US-303 / SDD Section 6.1).
    /// </summary>
    [Serializable]
    public class SaveData
    {
        public int HighScoreClassic = 0;
        public int HighScoreTimeAttack = 0;
        public int SelectedSkinId = 0;
        public int SelectedThemeId = 0; // 0: Dark, 1: Light
        public bool SoundEnabled = true;
        public bool VibrationEnabled = true;
        public int ControlType = 0; // 0: Swipe, 1: Touch Buttons
        public List<int> UnlockedSkinIds = new List<int> { 0 };
        public string SecurityHash = "";
    }
}
