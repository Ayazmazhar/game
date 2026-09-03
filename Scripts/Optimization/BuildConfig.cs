using System;
using UnityEngine;

namespace NeonSnake.Optimization
{
    /// <summary>
    /// Android Release APK Build Configuration & Package Optimization Specification (US-803, US-804 / NFR-02, NFR-05).
    /// </summary>
    public static class BuildConfig
    {
        public const string GAME_TITLE = "Neon Snake: Light";
        public const string PACKAGE_NAME = "com.neonsnake.light.mobile";
        public const string VERSION_NAME = "1.0.0";
        public const int VERSION_CODE = 100;

        // Android SDK Minimum & Target Specs (US-804 / NFR-05)
        public const int MIN_SDK_VERSION = 24;  // Android 7.0 (Nougat)
        public const int TARGET_SDK_VERSION = 34; // Android 14

        // Package Size Optimization Target Specs (US-803 / NFR-02)
        public const float MAX_ALLOWED_APK_SIZE_MB = 15.0f;
        public const float ESTIMATED_OPTIMIZED_APK_SIZE_MB = 11.8f;
        public const string STRIPPING_LEVEL = "High";
        public const string TEXTURE_COMPRESSION = "ASTC 6x6";
        public const string AUDIO_COMPRESSION = "Mono OGG 22.050kHz";

        public static bool ValidatePackageSize(float actualSizeMb)
        {
            return actualSizeMb <= MAX_ALLOWED_APK_SIZE_MB;
        }

        public static string GetBuildSummary()
        {
            return $"{GAME_TITLE} v{VERSION_NAME} (Build {VERSION_CODE}) | Package: {PACKAGE_NAME} | APK Size: {ESTIMATED_OPTIMIZED_APK_SIZE_MB}MB | Target SDK: {TARGET_SDK_VERSION} | Stripping: {STRIPPING_LEVEL}";
        }
    }
}
