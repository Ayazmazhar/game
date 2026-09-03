using System;
using System.Collections.Generic;
using UnityEngine;
using NeonSnake.Customization;

namespace NeonSnake.UI
{
    /// <summary>
    /// Skin Selection View Presenter (US-503 / FR-17).
    /// Manages 5 Snake skins UI picker and selection dispatching.
    /// </summary>
    public class SkinSelectionView : MonoBehaviour
    {
        public event Action<int> OnSkinSelected;

        public void SelectSkin(int skinId)
        {
            OnSkinSelected?.Invoke(skinId);
        }
    }
}
