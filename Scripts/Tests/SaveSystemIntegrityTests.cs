using System;
using NUnit.Framework;
using NeonSnake.Persistence;

namespace NeonSnake.Tests
{
    [TestFixture]
    public class SaveSystemIntegrityTests
    {
        [Test]
        public void US801_SaveDataGeneratesValidHMACChecksum()
        {
            var data = new SaveData
            {
                HighScoreClassic = 500,
                HighScoreTimeAttack = 120,
                SelectedSkinId = 2,
                SelectedThemeId: 0,
                SoundEnabled = true,
                VibrationEnabled = true,
                ControlType = 0,
                UnlockedSkinIds = new[] { 0, 2 },
                SecurityHash = ""
            };

            string hash = SaveSystem.ComputeSecurityHash(data);
            Assert.IsNotNull(hash);
            Assert.IsTrue(hash.Length > 0, "Security hash must not be empty");
        }

        [Test]
        public void US801_CorruptedSaveDataTriggersTamperDetectionFallback()
        {
            var data = new SaveData
            {
                HighScoreClassic = 999999, // Injected cheated score
                HighScoreTimeAttack = 500,
                SelectedSkinId = 0,
                SelectedThemeId = 0,
                SoundEnabled = true,
                VibrationEnabled = true,
                ControlType = 0,
                UnlockedSkinIds = new[] { 0 },
                SecurityHash = "CORRUPTED_TAMPERED_HASH_STRING"
            };

            string expectedHash = SaveSystem.ComputeSecurityHash(data);
            Assert.AreNotEqual(expectedHash, data.SecurityHash, "Security hash mismatch indicates tampering");
        }
    }
}
