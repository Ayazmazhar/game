using System;
using System.Collections.Generic;

namespace NeonSnake.UI
{
    public enum ViewType
    {
        MainMenu,
        Gameplay,
        GameOver,
        SkinSelection,
        Settings,
        Modes
    }

    /// <summary>
    /// Stack-based navigation router managing screen hierarchy and back stack traversal (US-501 / SDD Section 4.1).
    /// </summary>
    public class NavigationRouter
    {
        private readonly Stack<ViewType> navigationStack = new Stack<ViewType>();

        public ViewType CurrentView => navigationStack.Count > 0 ? navigationStack.Peek() : ViewType.MainMenu;
        public int StackDepth => navigationStack.Count;

        public event Action<ViewType, ViewType> OnViewChanged;

        public NavigationRouter(ViewType initialView = ViewType.MainMenu)
        {
            navigationStack.Push(initialView);
        }

        /// <summary>
        /// Pushes a new sub-view onto the navigation stack.
        /// </summary>
        public void PushView(ViewType newView)
        {
            if (navigationStack.Count > 0 && navigationStack.Peek() == newView) return;

            ViewType previous = CurrentView;
            navigationStack.Push(newView);
            OnViewChanged?.Invoke(previous, newView);
        }

        /// <summary>
        /// Pops current view and returns to previous view on stack.
        /// </summary>
        public bool PopView()
        {
            if (navigationStack.Count <= 1)
            {
                return false; // Root view reached, cannot pop further
            }

            ViewType previous = navigationStack.Pop();
            ViewType current = CurrentView;
            OnViewChanged?.Invoke(previous, current);
            return true;
        }

        /// <summary>
        /// Clears navigation back stack and resets root view to MainMenu.
        /// </summary>
        public void NavigateToHome()
        {
            ViewType previous = CurrentView;
            navigationStack.Clear();
            navigationStack.Push(ViewType.MainMenu);
            
            if (previous != ViewType.MainMenu)
            {
                OnViewChanged?.Invoke(previous, ViewType.MainMenu);
            }
        }
    }
}
