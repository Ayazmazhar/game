using System;
using System.Collections.Generic;
using UnityEngine;

namespace NeonSnake.Services
{
    public enum SoundType
    {
        Eat,
        ButtonClick,
        Crash
    }

    /// <summary>
    /// Audio Manager & Sound Effect Pool (US-601 / SDD Section 3.4 / FR-19).
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        [Header("Audio Pool Config")]
        [SerializeField] private int poolSize = 5;
        [SerializeField] private AudioClip eatSfx;
        [SerializeField] private AudioClip buttonClickSfx;
        [SerializeField] private AudioClip crashSfx;

        private readonly List<AudioSource> audioPool = new List<AudioSource>();
        public bool IsSoundEnabled { get; private set; } = true;

        public event Action<SoundType, bool> OnSoundPlayed;

        public void Initialize(bool initialSoundState = true)
        {
            IsSoundEnabled = initialSoundState;
            audioPool.Clear();

            for (int i = 0; i < poolSize; i++)
            {
                AudioSource source = gameObject.AddComponent<AudioSource>();
                source.playOnAwake = false;
                audioPool.Add(source);
            }
        }

        public void SetSoundEnabled(bool enabled)
        {
            IsSoundEnabled = enabled;
        }

        public bool PlaySFX(SoundType sound)
        {
            if (!IsSoundEnabled)
            {
                OnSoundPlayed?.Invoke(sound, false);
                return false;
            }

            AudioSource availableSource = GetAvailableSource();
            if (availableSource != null)
            {
                AudioClip clipToPlay = GetClipForSound(sound);
                if (clipToPlay != null)
                {
                    availableSource.PlayOneShot(clipToPlay);
                }
                OnSoundPlayed?.Invoke(sound, true);
                return true;
            }

            OnSoundPlayed?.Invoke(sound, false);
            return false;
        }

        private AudioSource GetAvailableSource()
        {
            foreach (var source in audioPool)
            {
                if (!source.isPlaying) return source;
            }
            return audioPool.Count > 0 ? audioPool[0] : null;
        }

        private AudioClip GetClipForSound(SoundType sound)
        {
            switch (sound)
            {
                case SoundType.Eat: return eatSfx;
                case SoundType.ButtonClick: return buttonClickSfx;
                case SoundType.Crash: return crashSfx;
                default: return null;
            }
        }
    }
}
