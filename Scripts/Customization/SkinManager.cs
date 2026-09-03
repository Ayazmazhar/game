using System;
using System.Collections.Generic;

namespace NeonSnake.Customization
{
    /// <summary>
    /// Snake Skin Selection Subsystem (US-503 / FR-17).
    /// Manages 5 distinct skin styles and active selection state.
    /// </summary>
    public class SkinManager
    {
        private readonly List<SkinData> skinLibrary;
        public int ActiveSkinId { get; private set; } = 0;
        public SkinData ActiveSkin => skinLibrary.Find(s => s.SkinId == ActiveSkinId) ?? skinLibrary[0];

        public event Action<SkinData> OnSkinChanged;

        public SkinManager(int initialSkinId = 0)
        {
            skinLibrary = SkinData.GetDefaultSkinLibrary();
            SelectSkin(initialSkinId);
        }

        public IReadOnlyList<SkinData> GetSkinLibrary()
        {
            return skinLibrary;
        }

        public bool SelectSkin(int skinId)
        {
            if (skinId < 0 || skinId >= skinLibrary.Count) return false;

            ActiveSkinId = skinId;
            OnSkinChanged?.Invoke(ActiveSkin);
            return true;
        }
    }
}
