using System;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;

namespace NeonSnake.Persistence
{
    /// <summary>
    /// Encrypted Save System providing HMAC-SHA256 anti-tamper security hash validation (US-303 / SDD Section 6.2).
    /// Prevents manual save file editing and score cheating.
    /// </summary>
    public class SaveSystem
    {
        private const string SaveKey = "NEON_SNAKE_SAVE_DATA_V1";
        private const string SecretSalt = "NeonSnake_AntiTamper_SecretSalt_#2026_SecureKey!";

        private readonly string deviceId;

        public bool LastLoadTamperDetected { get; private set; } = false;

        public SaveSystem(string deviceIdentifier = null)
        {
            deviceId = string.IsNullOrEmpty(deviceIdentifier) 
                ? SystemInfo.deviceUniqueIdentifier 
                : deviceIdentifier;
        }

        /// <summary>
        /// Computes HMAC-SHA256 security checksum for SaveData DTO.
        /// </summary>
        public string ComputeSecurityHash(SaveData data)
        {
            if (data == null) return string.Empty;

            string payload = $"{data.HighScoreClassic}:{data.HighScoreTimeAttack}:{data.SelectedSkinId}:{deviceId}";
            byte[] keyBytes = Encoding.UTF8.GetBytes(SecretSalt);
            byte[] payloadBytes = Encoding.UTF8.GetBytes(payload);

            using (var hmac = new HMACSHA256(keyBytes))
            {
                byte[] hashBytes = hmac.ComputeHash(payloadBytes);
                return Convert.ToBase64String(hashBytes);
            }
        }

        /// <summary>
        /// Saves data to local PlayerPrefs along with computed security hash.
        /// </summary>
        public void SaveData(SaveData data)
        {
            if (data == null) return;

            data.SecurityHash = ComputeSecurityHash(data);
            string json = JsonUtility.ToJson(data);
            PlayerPrefs.SetString(SaveKey, json);
            PlayerPrefs.Save();
        }

        /// <summary>
        /// Loads data from PlayerPrefs and validates HMAC-SHA256 hash integrity.
        /// </summary>
        public SaveData LoadData()
        {
            LastLoadTamperDetected = false;

            if (!PlayerPrefs.HasKey(SaveKey))
            {
                var defaultData = new SaveData();
                SaveData(defaultData);
                return defaultData;
            }

            string json = PlayerPrefs.GetString(SaveKey);
            SaveData loadedData = JsonUtility.FromJson<SaveData>(json);

            if (loadedData == null)
            {
                var fallback = new SaveData();
                SaveData(fallback);
                return fallback;
            }

            // Verify Anti-Tamper Security Hash (US-303 / FR-12)
            string expectedHash = ComputeSecurityHash(loadedData);
            if (loadedData.SecurityHash != expectedHash)
            {
                LastLoadTamperDetected = true;
                Debug.LogWarning("[SECURITY TAMPER DETECTED] Save file checksum mismatch! High scores reset to fallback 0.");
                
                // Fallback reset high scores
                loadedData.HighScoreClassic = 0;
                loadedData.HighScoreTimeAttack = 0;
                loadedData.SecurityHash = ComputeSecurityHash(loadedData);
                SaveData(loadedData);
            }

            return loadedData;
        }

        public void DeleteSaveData()
        {
            PlayerPrefs.DeleteKey(SaveKey);
            PlayerPrefs.Save();
        }
    }
}
