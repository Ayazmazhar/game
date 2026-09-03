# Neon Snake: Light — Development Epics & Scrum Backlog Specification

**Document Version:** 1.0  
**Status:** Approved for Agile Development Execution  
**Role / Perspective:** Scrum Master & Lead Software Engineer  
**Project Name:** Neon Snake: Light (Android Mobile Game)  
**Target Engine & Language:** Unity 2022.3 LTS / C# (.NET Standard 2.1)  
**Input Specifications:** 
- IEEE SRS v1.0 ([Neon_Snake_Light_IEEE_SRS.md](file:///c:/Users/codes%20college/Desktop/codes%20boys/Neon_Snake_Light_IEEE_SRS.md))
- IEEE SDD v1.0 ([Neon_Snake_Light_Software_Design_Document.md](file:///c:/Users/codes%20college/Desktop/codes%20boys/Neon_Snake_Light_Software_Design_Document.md))  
**Date:** 28 August 2026  

---

## 1. Scrum Master Framework & Agile Execution Strategy

This document establishes the official **Agile Development Epics and Product Backlog** for *Neon Snake: Light*. As Scrum Master and Lead Software Engineer, the product requirements outlined in the Software Requirements Specification (SRS) and the technical architecture specified in the Software Design Document (SDD) have been converted into actionable, testable Scrum artifacts.

### 1.1 Sprint Velocity & Capacity Allocation
- **Sprint Duration:** 3 Sprints (Mapped to the 10-day development roadmap).
  - **Sprint 1 (Days 1–4):** Core Engine, Movement, Grid Physics, Input, and Encrypted Persistence (**32 Story Points**).
  - **Sprint 2 (Days 5–7):** Game Modes (Classic & Time Attack), UI/UX Presentation, Themes, Skins, and Audio/Haptics (**26 Story Points**).
  - **Sprint 3 (Days 8–10):** AdMob Rewarded Revive, Offline Fallback, Performance Profiling, Unit Testing, and Release APK Packaging (**18 Story Points**).
- **Estimation Standard:** Fibonacci Scale ($1, 2, 3, 5, 8$).
- **Total Backlog Weight:** **76 Story Points**.

```
+-----------------------------------------------------------------------------------+
| SPRINT 1: Core Engine, Movement, Input & Data Security (Days 1–4)                  |
| - EPIC 01: Core Engine Architecture & Grid Physics                               |
| - EPIC 02: Input Management & Gesture Control System                              |
| - EPIC 03: Food Spawning, Scoring & Anti-Tamper Security Persistence              |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
| SPRINT 2: Game Modes, UI/UX, Skins & Audio/Haptics (Days 5–7)                     |
| - EPIC 04: Game Modes Subsystem (Classic & Time Attack)                           |
| - EPIC 05: UI/UX Presentation, Dynamic Themes & Skin Customization                |
| - EPIC 06: Audio, Haptic Feedback & Native Android Sharing                        |
+-----------------------------------------------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
| SPRINT 3: Monetization, Optimization, Testing & Release Build (Days 8–10)         |
| - EPIC 07: Monetization & Google AdMob Integration                                |
| - EPIC 08: Non-Functional Optimization, NUnit Testing & Release APK Packaging     |
+-----------------------------------------------------------------------------------+
```

### 1.2 Definition of Done (DoD)
A User Story is marked **DONE** only when:
1. **Implementation:** C# code strictly adheres to Model-View-Presenter (MVP) decoupling and object-pooling patterns defined in SDD Section 2.
2. **Zero-Allocation Core Ticks:** Gameplay update methods (`StepForward`, `IsWallCollision`, `CheckFoodCollision`) achieve $0\text{ Bytes}$ heap allocation per tick.
3. **Automated Verification:** All corresponding NUnit tests in `NeonSnake.Tests` compile and pass in Unity Test Runner.
4. **SRS & SDD Traceability:** Requirements (FR-01 through FR-24, NFR-01 through NFR-09) are verified without introducing regressions.
5. **Code Review:** Code compiles cleanly with zero C# warnings or errors under standard Unity compilation.
6. **Device Compatibility:** Tested and visually verified on 16:9 (720x1280) and 19.5:9 (1080x2340) portrait Android viewport profiles.

---

## 2. Detailed Epics & User Stories Breakdown

---

### EPIC 01: Core Engine Architecture & Grid Physics
**Epic Objective:** Build the foundational application lifecycle FSM, 2D logical grid coordinate system, snake body queue, zero-allocation object pool, and collision engine.  
**SRS Traceability:** FR-01, FR-03, FR-04, FR-09  
**SDD Traceability:** SDD Sections 2, 3.2, 4.1, 4.2, 4.3, 5  

---

#### US-101: Core FSM & Application Boot Orchestration
- **Sprint:** Sprint 1
- **Story Points:** 3 Points
- **SRS Reference:** FR-01 (Application Launch)
- **SDD Reference:** SDD Section 5 (State Machine Architecture)

**User Story:**  
*As a player, I want the application to launch into an initial Boot state that initializes all subsystems, so that the game transitions smoothly to the main menu without UI hanging or freeze spikes.*

**Acceptance Criteria:**
- **Given** the application binary is launched on an Android device, **When** execution begins, **Then** `BootState` initializes preallocated pools, target frame rate, settings, and save data.
- **Given** `BootState` completes setup, **When** execution finishes, **Then** the FSM automatically transitions to `MainMenuState`.

**Technical Tasks:**
1. Write `GameStatePresenter` managing state transitions: `BootState`, `MainMenuState`, `GameLoopState`, `PausedState`, `GameOverState`, and `RewardedState`.
2. Implement async initialization of preallocated pools during `BootState`.
3. Provide UI view fade-in sequence onto `MainMenuView`.

---

#### US-102: Logical 2D Grid & Coordinate Mapping Subsystem
- **Sprint:** Sprint 1
- **Story Points:** 3 Points
- **SRS Reference:** FR-03, FR-07
- **SDD Reference:** SDD Section 3.2, Section 4.1 (`GridManager`, `GridPosition`)

**User Story:**  
*As a game developer, I want a decoupled 2D logical grid coordinate system, so that game rules operate on discrete integer coordinates independently of device screen resolution or aspect ratio.*

**Acceptance Criteria:**
- **Given** a grid configuration of $20 \times 30$ cells, **When** `GridManager` initializes, **Then** logical coordinates $(0,0)$ to $(19,29)$ map accurately to Unity 2D world space centered at $(0,0,0)$.
- **Given** portrait mobile aspect ratios (16:9, 18:9, 19.5:9, 20:9), **When** `FitCameraToGrid()` executes, **Then** the camera orthographic size scales automatically to fit the grid without clipping.

**Technical Tasks:**
1. Create `GridPosition` struct in `NeonSnake.Core` with operator overloads (`==`, `!=`).
2. Write `GridManager.cs` supporting `GridToWorldPosition()`, `WorldToGridPosition()`, and `IsWithinBounds()`.
3. Implement procedural line rendering for grid visual bounds and camera auto-fitting.

---

#### US-103: Snake Body Management & 180-Degree Turn Validation
- **Sprint:** Sprint 1
- **Story Points:** 5 Points
- **SRS Reference:** FR-03 (Snake Movement), FR-04 (Direction Validation)
- **SDD Reference:** SDD Section 4.2 (`SnakeController.cs`)

**User Story:**  
*As a player, I want the snake to move continuously in the current direction and reject instant 180-degree self-reversals, so that I don't accidentally crash into my own neck.*

**Acceptance Criteria:**
- **Given** the snake is moving `Right`, **When** the player inputs `Left`, **Then** `SnakeController` rejects the input and continues moving `Right`.
- **Given** the snake is moving `Right`, **When** the player inputs `Up`, **Then** pending direction becomes `Up`, and the next movement tick updates the head to $(X, Y+1)$.
- **Given** a movement tick trigger, **When** `StepForward(growNextStep=false)` is called, **Then** the tail segment is removed and head is added at the new grid position.

**Technical Tasks:**
1. Implement `SnakeController.cs` maintaining `List<GridPosition>` for body segments.
2. Write `RequestDirectionChange(Direction newDir)` with `IsOppositeDirection()` guard check.
3. Expose C# events `OnHeadMoved`, `OnTailRemoved`, and `OnGrown`.

---

#### US-104: Collision Engine (Wall & Self-Collision)
- **Sprint:** Sprint 1
- **Story Points:** 3 Points
- **SRS Reference:** FR-09 (Collision Detection), FR-10 (Game Over)
- **SDD Reference:** SDD Section 4.3 (`CollisionEngine.cs`)

**User Story:**  
*As a player, I want the system to detect when the snake collides with grid boundaries or its own body segments, so that Game Over triggers immediately upon impact.*

**Acceptance Criteria:**
- **Given** the head position reaches $X < 0$, $X \ge \text{Width}$, $Y < 0$, or $Y \ge \text{Height}$, **When** `IsWallCollision()` is evaluated, **Then** it returns `true`.
- **Given** the head position matches any body segment index $i \ge 1$, **When** `IsSelfCollision()` is evaluated, **Then** it returns `true`.

**Technical Tasks:**
1. Create pure domain `CollisionEngine.cs` in `NeonSnake.Core`.
2. Implement `IsWallCollision(GridPosition head)` logic.
3. Implement zero-allocation `IsSelfCollision(GridPosition head, IReadOnlyList<GridPosition> body)`.

---

#### US-105: Zero-Allocation Object Pooler for Visual Segments
- **Sprint:** Sprint 1
- **Story Points:** 3 Points
- **SRS Reference:** NFR-01 (Performance 30 FPS), NFR-06 (Maintainability)
- **SDD Reference:** SDD Section 8.1 (Memory & Garbage Collection Optimization)

**User Story:**  
*As a lead engineer, I want pre-allocated object pools for snake body segments and food items, so that zero dynamic instantiation calls occur during gameplay ticks to prevent GC frame stutters.*

**Acceptance Criteria:**
- **Given** game initialization, **When** `ObjectPooler` runs, **Then** 100 `SnakeSegmentView` game objects are pre-instantiated and disabled in the scene pool.
- **Given** snake growth or movement, **When** segment view instances are fetched or recycled, **Then** zero calls to `Instantiate()` or `Destroy()` occur.

**Technical Tasks:**
1. Write generic `ObjectPooler.cs` supporting Component pooling.
2. Pre-fill pool stacks during `BootState`.
3. Integrate `ObjectPooler` with `SnakeView` and `FoodView` renderers.

---

### EPIC 02: Input Management & Gesture Control System
**Epic Objective:** Build unified touch input handlers for high-responsiveness swipe gestures and virtual touch D-Pad buttons with user settings integration.  
**SRS Traceability:** FR-05, FR-06  
**SDD Traceability:** SDD Section 3.1, Section 4.1 (`ISnakeInputProvider`, `SwipeInputHandler`, `ButtonInputHandler`)  

---

#### US-201: Touch Swipe Gesture Detection Handler
- **Sprint:** Sprint 1
- **Story Points:** 3 Points
- **SRS Reference:** FR-05 (Swipe Control)
- **SDD Reference:** SDD Section 3.1 (`SwipeInputHandler.cs`)

**User Story:**  
*As a player, I want to swipe anywhere on the touch screen to change the snake's direction, so that I have intuitive touch control.*

**Acceptance Criteria:**
- **Given** swipe input mode is enabled, **When** a drag gesture exceeds the minimum pixel threshold (e.g., 50px), **Then** the swipe vector is calculated into cardinal direction `Up`, `Down`, `Left`, or `Right`.
- **Given** quick consecutive swipe gestures, **When** inputs occur between ticks, **Then** the latest valid direction is queued for execution on the next movement step.

**Technical Tasks:**
1. Implement `SwipeInputHandler.cs` implementing `ISnakeInputProvider`.
2. Calculate delta vector $\Delta = \text{TouchEnd} - \text{TouchStart}$ and evaluate dominant axis ($\vert \Delta x \vert > \vert \Delta y \vert$).
3. Dispatch `OnDirectionRequested` event upon valid gesture.

---

#### US-202: On-Screen Virtual D-Pad Touch Button Controls
- **Sprint:** Sprint 1
- **Story Points:** 2 Points
- **SRS Reference:** FR-06 (Button Control)
- **SDD Reference:** SDD Section 3.1 (`ButtonInputHandler.cs`)

**User Story:**  
*As a player who prefers touch buttons, I want an optional on-screen directional button overlay, so that I can control movement by tapping visual buttons.*

**Acceptance Criteria:**
- **Given** button control mode is enabled in settings, **When** gameplay loads, **Then** the directional UI button overlay is displayed on screen.
- **Given** a tap on `Up`, `Down`, `Left`, or `Right` buttons, **When** pointer down occurs, **Then** `OnDirectionRequested` dispatches the direction command immediately.

**Technical Tasks:**
1. Create UI D-Pad prefab layout with directional button triggers.
2. Implement `ButtonInputHandler.cs` implementing `ISnakeInputProvider`.
3. Provide seamless runtime switching between `SwipeInputHandler` and `ButtonInputHandler`.

---

### EPIC 03: Food Spawning, Scoring & Anti-Tamper Security Persistence
**Epic Objective:** Implement random valid food generation, dynamic score calculation, encrypted save persistence, and HMAC-SHA256 checksum validation against save file editing.  
**SRS Traceability:** FR-07, FR-08, FR-11, FR-12, NFR-04, NFR-09  
**SDD Traceability:** SDD Sections 3.2, 4.1, 6.1, 6.2  

---

#### US-301: Valid Food Spawner & Consumption Mechanics
- **Sprint:** Sprint 1
- **Story Points:** 3 Points
- **SRS Reference:** FR-07 (Food Generation), FR-08 (Food Consumption)
- **SDD Reference:** SDD Section 3.2 (`FoodManager.cs`)

**User Story:**  
*As a player, I want food items to spawn in valid unoccupied grid positions and reward me with score and snake growth upon collection.*

**Acceptance Criteria:**
- **Given** food generation request, **When** `FoodManager.SpawnFood()` runs, **Then** the target cell is chosen randomly from grid coordinates not occupied by the snake body or obstacles.
- **Given** snake head position matches food position, **When** tick executes, **Then** score increases, snake flags growth for next step, sound/haptics fire, and new food spawns.

**Technical Tasks:**
1. Implement `FoodManager.cs` tracking active food grid coordinates.
2. Write `TryGetRandomUnoccupiedPosition()` querying occupied grid positions.
3. Fire `OnFoodEaten` event with point payload.

---

#### US-302: Score Engine & Multiplier Calculation
- **Sprint:** Sprint 1
- **Story Points:** 2 Points
- **SRS Reference:** FR-11 (Score Calculation)
- **SDD Reference:** SDD Section 3.2 (`ScoreModel.cs`, `ScorePresenter.cs`)

**User Story:**  
*As a player, I want my score to update live on screen during gameplay and track my best performance accurately.*

**Acceptance Criteria:**
- **Given** food consumption, **When** `ScoreModel.AddScore(points)` is called, **Then** current score updates and notifies `ScorePresenter`.
- **Given** new game session, **When** gameplay starts, **Then** current score resets to 0 while high score is preserved.

**Technical Tasks:**
1. Write `ScoreModel.cs` storing current score and mode high score.
2. Write `ScorePresenter.cs` binding score model updates to UI Text elements.

---

#### US-303: Encrypted Save System & Anti-Tamper Security Hash
- **Sprint:** Sprint 1
- **Story Points:** 5 Points
- **SRS Reference:** FR-12 (High Score Storage), NFR-04 (Reliability), NFR-09 (Security & Privacy)
- **SDD Reference:** SDD Section 6.1, 6.2 (`SaveData.cs`, `SaveSystem.cs`)

**User Story:**  
*As a software engineer, I want local high scores encrypted with an HMAC-SHA256 checksum, so that player save files cannot be manually altered or cheated.*

**Acceptance Criteria:**
- **Given** game completion, **When** `SaveSystem.SaveData()` runs, **Then** `SaveData` JSON is stored in `PlayerPrefs` alongside an HMAC-SHA256 security hash calculated from scores, device ID, and secret salt.
- **Given** game startup, **When** `SaveSystem.LoadData()` executes, **If** computed hash matches stored `SecurityHash`, **Then** data loads; **Else** if mismatch is detected, high scores reset to 0 fallback.

**Technical Tasks:**
1. Define `SaveData` DTO model.
2. Implement `SaveSystem.cs` using `System.Security.Cryptography.HMACSHA256`.
3. Conduct tamper verification test (injecting corrupted PlayerPrefs strings).

---

### EPIC 04: Game Modes Subsystem (Classic & Time Attack)
**Epic Objective:** Implement the polymorphic `IGameMode` framework and deliver the core MVP game modes: endless Classic Mode and 60-second Time Attack Mode.  
**SRS Traceability:** FR-13, FR-14, FR-15, FR-16  
**SDD Traceability:** SDD Section 3.3 (`GameModeManager`, `ClassicGameMode`, `TimeAttackGameMode`)  

---

#### US-401: Polymorphic Game Mode Framework
- **Sprint:** Sprint 2
- **Story Points:** 3 Points
- **SRS Reference:** NFR-06 (Maintainability), NFR-07 (Scalability)
- **SDD Reference:** SDD Section 4.1 (`IGameMode.cs`), Section 3.3 (`GameModeManager.cs`)

**User Story:**  
*As a developer, I want a unified `IGameMode` interface, so that Classic, Time Attack, Level, and Ghost modes can be loaded modularly without altering core loop logic.*

**Acceptance Criteria:**
- **Given** mode selection in main menu, **When** player chooses a mode, **Then** `GameModeManager` initializes the selected `IGameMode` implementation (`InitializeMode()`).
- **Given** active game tick, **When** frame update runs, **Then** `GameModeManager` delegates execution to `activeMode.OnTick(deltaTime)`.

**Technical Tasks:**
1. Declare `IGameMode` interface (`InitializeMode`, `OnTick`, `OnFoodEaten`, `CheckGameOverCondition`, `TeardownMode`).
2. Implement `GameModeManager.cs` orchestrating mode lifecycles.

---

#### US-402: Classic Mode with Progressive Speed Ramping
- **Sprint:** Sprint 2
- **Story Points:** 3 Points
- **SRS Reference:** FR-13 (Classic Mode)
- **SDD Reference:** SDD Section 3.3 (`ClassicGameMode.cs`)

**User Story:**  
*As a player, I want to play endless Classic Mode where the snake speed gradually increases as my score gets higher, so that gameplay becomes progressively challenging.*

**Acceptance Criteria:**
- **Given** Classic Mode start, **When** game begins, **Then** movement tick rate starts at base interval (e.g., 0.20s).
- **Given** increasing score, **When** food is consumed, **Then** tick interval decreases according to $\text{Speed} = \text{BaseSpeed} \times \gamma^{\text{Score}}$ down to minimum cap (0.06s).

**Technical Tasks:**
1. Implement `ClassicGameMode.cs` implementing `IGameMode`.
2. Add dynamic speed decay algorithm on `OnFoodEaten()`.
3. Handle endless game over state on wall/self collision.

---

#### US-403: Time Attack Mode with Fixed 60-Second Countdown Timer
- **Sprint:** Sprint 2
- **Story Points:** 3 Points
- **SRS Reference:** FR-14 (Time Attack Mode)
- **SDD Reference:** SDD Section 3.3 (`TimeAttackGameMode.cs`)

**User Story:**  
*As a player, I want to play Time Attack Mode with a 60-second countdown timer to score as many points as possible before time runs out.*

**Acceptance Criteria:**
- **Given** Time Attack selection, **When** gameplay begins, **Then** a 60.0-second timer displays on screen.
- **Given** active gameplay, **When** timer reaches `0.0` seconds, **Then** game over triggers with Time Attack high score evaluation.
- **Given** collision before 60s, **When** impact occurs, **Then** game ends immediately.

**Technical Tasks:**
1. Implement `TimeAttackGameMode.cs` implementing `IGameMode`.
2. Manage 60-second countdown float tracking in `OnTick(float deltaTime)`.
3. Bind timer updates to UI view overlay.

---

#### US-404: Extensibility Hooks for Level Mode & Ghost Mode (Modular Stubs)
- **Sprint:** Sprint 2
- **Story Points:** 2 Points
- **SRS Reference:** FR-15 (Level Mode), FR-16 (Ghost Mode), NFR-07 (Scalability)
- **SDD Reference:** SDD Section 3.3, Section 6.1 (`GhostData.cs`, `GhostRecording`)

**User Story:**  
*As a lead architect, I want data structures and interface stubs prepared for Level Mode and Ghost Mode, so that future release features require zero core code refactoring.*

**Acceptance Criteria:**
- **Given** `GhostRecording` data structure, **When** serialized, **Then** arrays of `GhostFrame` positions export cleanly to JSON.
- **Given** `IGameMode`, **When** `LevelGameMode` stub is compiled, **Then** it integrates into `GameModeManager`.

**Technical Tasks:**
1. Define `GhostFrame` and `GhostRecording` serialization models in `NeonSnake.Core`.
2. Create modular stub classes `LevelGameMode.cs` and `GhostGameMode.cs`.

---

### EPIC 05: UI/UX Presentation, Dynamic Themes & Skin Customization
**Epic Objective:** Implement responsive Canvas user interface views (Main Menu, Gameplay, Game Over, Settings), Light/Dark dynamic themes, and 5 Snake Skins customization system.  
**SRS Traceability:** FR-02, FR-17, FR-18, NFR-03, NFR-08  
**SDD Traceability:** SDD Section 2, Section 4.1 (`MainMenuView`, `GameplayView`, `GameOverView`), Section 6.1  

---

#### US-501: Main Menu & Stack Navigation Router Setup
- **Sprint:** Sprint 2
- **Story Points:** 3 Points
- **SRS Reference:** FR-02 (Main Menu Navigation), NFR-03 (Usability)
- **SDD Reference:** SDD Section 4.1 (`NavigationRouter.cs`, `MainMenuView.cs`)

**User Story:**  
*As a player, I want a clean main menu with clear navigation buttons (Play, Modes, Skins, High Scores, Settings, Share), so that I can easily navigate the game.*

**Acceptance Criteria:**
- **Given** Main Menu screen, **When** tapping "Play", **Then** the view transitions seamlessly to mode selection or active gameplay.
- **Given** sub-menu screens, **When** back button is pressed, **Then** `NavigationRouter` returns to the previous menu view cleanly.

**Technical Tasks:**
1. Build `MainMenuView.cs` and UI Canvas layout.
2. Implement `NavigationRouter.cs` using a stack-based view management model.

---

#### US-502: Dynamic Light & Dark Theme Manager
- **Sprint:** Sprint 2
- **Story Points:** 3 Points
- **SRS Reference:** FR-18 (Theme Selection)
- **SDD Reference:** SDD Section 6.1 (`ThemeManager.cs`)

**User Story:**  
*As a player, I want to toggle between Dark Theme (Neon glow on dark background) and Light Theme (Clean bright aesthetic), so that I can play comfortably in any lighting condition.*

**Acceptance Criteria:**
- **Given** settings menu, **When** theme is toggled from `Dark` to `Light`, **Then** background colors, grid line renders, and UI text update instantly.
- **Given** application restart, **When** game boots, **Then** saved theme preference loads and applies automatically.

**Technical Tasks:**
1. Create `ThemeData` ScriptableObjects for Dark and Light color palettes.
2. Implement `ThemeManager.cs` broadcasting `OnThemeChanged` events to UI & grid renderers.

---

#### US-503: Snake Skin Selection System
- **Sprint:** Sprint 2
- **Story Points:** 3 Points
- **SRS Reference:** FR-17 (Skin Selection)
- **SDD Reference:** SDD Section 6.1 (`SkinManager.cs`)

**User Story:**  
*As a player, I want to choose from at least 5 Snake skins in the skin picker screen, so that I can customize my visual appearance.*

**Acceptance Criteria:**
- **Given** Skin Selection screen, **When** viewing skins, **Then** 5 distinct skin styles (Default Neon Green, Cyan Cyber, Magenta Pink, Solar Yellow, Rainbow Pulse) are displayed.
- **Given** skin selection, **When** player selects a skin, **Then** active skin ID saves to `SaveData` and updates gameplay segment sprites.

**Technical Tasks:**
1. Create 5 sprite/color material profiles for snake head and body segments.
2. Implement `SkinManager.cs` managing skin selection and preview rendering.

---

### EPIC 06: Audio, Haptic Feedback & Native Android Sharing
**Epic Objective:** Provide sound effect playback pooling, Android device haptic vibration feedback, and native Android intent bridge for score sharing.  
**SRS Traceability:** FR-19, FR-20, FR-21  
**SDD Traceability:** SDD Section 3.4 (`AudioManager`, `HapticsManager`, `ShareService`)  

---

#### US-601: Audio Manager & Sound Effect Pool
- **Sprint:** Sprint 2
- **Story Points:** 2 Points
- **SRS Reference:** FR-19 (Sound Management)
- **SDD Reference:** SDD Section 3.4 (`AudioManager.cs`)

**User Story:**  
*As a player, I want audio feedback when eating food, clicking buttons, or crashing, with a toggle in settings.*

**Acceptance Criteria:**
- **Given** sound enabled, **When** food is eaten, **Then** `eat_sfx` audio clip plays via pre-allocated `AudioSource`.
- **Given** sound disabled in settings, **When** game events occur, **Then** audio playback is suppressed.

**Technical Tasks:**
1. Write `AudioManager.cs` managing `AudioSource` instance pooling.
2. Connect sound toggles to `SaveData.SoundEnabled`.

---

#### US-602: Device Haptic Vibration Feedback
- **Sprint:** Sprint 2
- **Story Points:** 2 Points
- **SRS Reference:** FR-20 (Vibration Management)
- **SDD Reference:** SDD Section 3.4 (`HapticsManager.cs`)

**User Story:**  
*As a player, I want subtle vibration haptic feedback when collecting food or crashing, with a toggle in settings.*

**Acceptance Criteria:**
- **Given** vibration enabled, **When** food is collected, **Then** a brief pulse vibration (30ms) triggers on device.
- **Given** vibration disabled, **When** crash occurs, **Then** vibration motor remains inactive.

**Technical Tasks:**
1. Implement `HapticsManager.cs` wrapping Android `Vibrator` API / Unity `Handheld.Vibrate()`.
2. Wire haptic execution to game event delegates.

---

#### US-603: Native Android Score Share Intent Bridge
- **Sprint:** Sprint 2
- **Story Points:** 3 Points
- **SRS Reference:** FR-21 (Score Sharing)
- **SDD Reference:** SDD Section 3.4 (`ShareService.cs`)

**User Story:**  
*As a player, I want to tap "Share" on Game Over to send my score text via WhatsApp, Twitter, or Android native share sheet.*

**Acceptance Criteria:**
- **Given** Game Over screen, **When** "Share" button is tapped, **Then** native Android `ACTION_SEND` intent sheet opens with score text (*"I just scored [Score] in Neon Snake: Light! Can you beat me?"*).
- **Given** non-Android/Editor environment, **When** Share is clicked, **Then** clean debug log fallback occurs.

**Technical Tasks:**
1. Write `ShareService.cs` using `AndroidJavaClass` and `AndroidJavaObject` bindings.
2. Format localized share message string.

---

### EPIC 07: Monetization & Google AdMob Integration
**Epic Objective:** Integrate Google Mobile Ads (AdMob) SDK for rewarded video ads on Game Over with offline fallback resiliency.  
**SRS Traceability:** FR-22, FR-23, FR-24  
**SDD Traceability:** SDD Section 3.4 (`AdManager`), Section 7.2 (Sequence Diagram)  

---

#### US-701: Google AdMob Bridge & SDK Initialization
- **Sprint:** Sprint 3
- **Story Points:** 3 Points
- **SRS Reference:** FR-22 (Advertisement Integration)
- **SDD Reference:** SDD Section 3.4 (`AdManager.cs`)

**User Story:**  
*As a developer, I want Google AdMob initialized asynchronously on boot without blocking main thread gameplay.*

**Acceptance Criteria:**
- **Given** app startup, **When** `BootState` runs, **Then** `AdManager` initializes AdMob SDK asynchronously.
- **Given** test environment, **When** requesting ads, **Then** official Google test ad unit IDs are used.

**Technical Tasks:**
1. Import Google Mobile Ads Unity Plugin.
2. Write `AdManager.cs` singleton wrapping SDK callbacks.

---

#### US-702: Rewarded Video "Continue Game" Flow
- **Sprint:** Sprint 3
- **Story Points:** 5 Points
- **SRS Reference:** FR-23 (Rewarded Continue)
- **SDD Reference:** SDD Section 7.2 (Rewarded Ad Continue Sequence)

**User Story:**  
*As a player on Game Over, I want the option to watch a rewarded video ad to revive and continue my game session once per run.*

**Acceptance Criteria:**
- **Given** Game Over screen, **When** ad is loaded and ready, **Then** "Watch Ad to Continue" button is active.
- **Given** video completed, **When** reward callback fires, **Then** snake revives, surrounding $3 \times 3$ grid cells clear of body segments, and gameplay resumes.
- **Given** user closes ad early, **When** callback fires, **Then** game remains on Game Over screen without revive.

**Technical Tasks:**
1. Implement `RewardedState` in FSM.
2. Wire `AdManager.ShowRewardedAd(OnUserEarnedRewardCallback)`.
3. Add safety revive clearance in `SnakeController` upon continue.

---

#### US-703: Offline Fallback Resiliency for Core Gameplay
- **Sprint:** Sprint 3
- **Story Points:** 2 Points
- **SRS Reference:** FR-24 (Offline Gameplay)
- **SDD Reference:** SDD Section 1.1, Section 7.2 (Ad Not Ready / Offline)

**User Story:**  
*As a player without internet connection, I want core gameplay to function completely offline without crash errors or hanging ad prompts.*

**Acceptance Criteria:**
- **Given** device in Airplane Mode (offline), **When** game executes, **Then** gameplay, local high scores, skins, and audio work 100% normally.
- **Given** offline Game Over, **When** ad check occurs, **Then** "Continue" button is hidden/disabled with a toast message *"Ad Unavailable Offline"*.

**Technical Tasks:**
1. Add network reachability check in `AdManager.cs`.
2. Guarantee zero network blocking calls exist in the core game loop.

---

### EPIC 08: Non-Functional Optimization, NUnit Testing & Release APK Build
**Epic Objective:** Perform performance profiling (30 FPS cap, zero GC tick), NUnit unit test suite execution, asset compression (<15MB APK), and automated release APK packaging.  
**SRS Traceability:** NFR-01, NFR-02, NFR-05, NFR-06  
**SDD Traceability:** SDD Section 8, Section 9  

---

#### US-801: Automated NUnit Unit Test Suite
- **Sprint:** Sprint 3
- **Story Points:** 3 Points
- **SRS Reference:** NFR-06 (Maintainability)
- **SDD Reference:** SDD Section 9.1 (`SnakeMovementTests.cs`)

**User Story:**  
*As a software engineer, I want automated unit tests covering core game domain logic, so that regressions are caught before build generation.*

**Acceptance Criteria:**
- **Given** Unity Test Runner, **When** tests execute, **Then** 100% of domain unit tests (`SnakeMovementTests`, `CollisionEngineTests`, `SaveSystemIntegrityTests`) pass cleanly.
- **Given** invalid 180-degree input or out-of-bounds position, **When** tested, **Then** assertions validate expected safe behavior.

**Technical Tasks:**
1. Create `NeonSnake.Tests` assembly definition.
2. Write unit tests for 180° turn prevention, wall collision, self collision, and score hash calculation.

---

#### US-802: Frame Rate Cap & Performance Profiling (30 FPS, Zero GC)
- **Sprint:** Sprint 3
- **Story Points:** 2 Points
- **SRS Reference:** NFR-01 (Performance)
- **SDD Reference:** SDD Section 8.2 (Performance & Battery Optimization)

**User Story:**  
*As a player on a low-end Android phone, I want smooth 30 FPS gameplay without phone overheating or severe battery drain.*

**Acceptance Criteria:**
- **Given** game startup, **When** graphics settings initialize, **Then** `Application.targetFrameRate` is set to `30` (with optional 60 FPS setting).
- **Given** Unity Profiler execution during gameplay, **When** inspecting main thread GC allocations per frame, **Then** `GC.Alloc` registers `0 Bytes` during active game ticks.

**Technical Tasks:**
1. Configure frame rate capping in `BootState.cs`.
2. Audit Unity Profiler to eliminate boxing or temporary array allocations inside `Update()`.

---

#### US-803: Asset Compression & Sub-15MB APK Package Optimization
- **Sprint:** Sprint 3
- **Story Points:** 3 Points
- **SRS Reference:** NFR-02 (Storage Size <15MB)
- **SDD Reference:** SDD Section 8.3 (Package Size Reduction Strategy)

**User Story:**  
*As a user downloading the game on mobile data, I want the APK size to be under 15 MB so that it downloads quickly.*

**Acceptance Criteria:**
- **Given** Android release build output, **When** APK file size is inspected, **Then** total size is $\le 15.0\text{ MB}$.
- **Given** texture assets, **When** compressed, **Then** ASTC 6x6 / 8x8 compression is applied to sprite atlases.

**Technical Tasks:**
1. Set Unity Managed Stripping Level to *High*.
2. Pack UI and gameplay graphics into sprite atlases with ASTC compression.
3. Compress audio SFX to mono OGG format at 22.050 kHz.

---

#### US-804: Android APK Build Generation & Device Matrix Verification
- **Sprint:** Sprint 3
- **Story Points:** 3 Points
- **SRS Reference:** NFR-05 (Compatibility)
- **SDD Reference:** SDD Section 9.2 (Device Hardware Compatibility Test Matrix)

**User Story:**  
*As a QA engineer, I want an ARM64/ARMv7 signed Android APK built and verified across standard device resolutions.*

**Acceptance Criteria:**
- **Given** Unity Android Build Pipeline, **When** build finishes, **Then** release APK compiles without warnings or errors.
- **Given** APK installation on Android test devices (16:9 and 19.5:9 portrait), **When** launched, **Then** gameplay UI scales seamlessly.

**Technical Tasks:**
1. Configure Android Player Settings (Minimum API Level 24, Target API Level 34+).
2. Generate production release APK binary.

---

## 3. SRS & SDD Traceability Matrix

| SRS Requirement ID | SRS Feature Description | Architectural Module (SDD) | User Story ID | Sprint Allocation | Story Points |
|---|---|---|---|---|---|
| **FR-01** | Application Launch | FSM (`BootState`, `MainMenuPresenter`) | **US-101** | Sprint 1 | 3 |
| **FR-03** | Snake Movement | Domain (`SnakeController`, `GridManager`) | **US-102, US-103** | Sprint 1 | 8 |
| **FR-04** | Direction Validation (180° Prevention) | Domain (`SnakeController.IsOppositeDirection`) | **US-103** | Sprint 1 | (Included) |
| **FR-05** | Swipe Controls | Input (`SwipeInputHandler`) | **US-201** | Sprint 1 | 3 |
| **FR-06** | Touch Button Controls | Input (`ButtonInputHandler`) | **US-202** | Sprint 1 | 2 |
| **FR-07** | Food Generation | Domain (`FoodManager`, `GridManager`) | **US-301** | Sprint 1 | 3 |
| **FR-08** | Food Consumption & Growth | Domain (`SnakeController`, `ScoreModel`) | **US-301** | Sprint 1 | (Included) |
| **FR-09** | Collision Detection | Physics (`CollisionEngine`) | **US-104** | Sprint 1 | 3 |
| **FR-10** | Game Over Handling | FSM (`GameLoopManager`, `GameOverPresenter`) | **US-104, US-501** | Sprint 1/2 | 3 |
| **FR-11** | Score Calculation | Domain (`ScoreModel`, `ScorePresenter`) | **US-302** | Sprint 1 | 2 |
| **FR-12** | High Score Storage | Persistence (`SaveSystem`, `SaveData`) | **US-303** | Sprint 1 | 5 |
| **FR-13** | Classic Mode | Game Modes (`ClassicGameMode`) | **US-401, US-402** | Sprint 2 | 6 |
| **FR-14** | Time Attack Mode | Game Modes (`TimeAttackGameMode`) | **US-403** | Sprint 2 | 3 |
| **FR-15** | Level Mode (Modular) | Game Modes (`LevelGameMode` Stub) | **US-404** | Sprint 2 | 2 |
| **FR-16** | Ghost Mode (Modular) | Game Modes (`GhostRecording`) | **US-404** | Sprint 2 | (Included) |
| **FR-17** | Skin Selection | Customization (`SkinManager`) | **US-503** | Sprint 2 | 3 |
| **FR-18** | Theme Selection (Dark/Light) | Customization (`ThemeManager`) | **US-502** | Sprint 2 | 3 |
| **FR-19** | Sound Management | Services (`AudioManager`) | **US-601** | Sprint 2 | 2 |
| **FR-20** | Vibration Management | Services (`HapticsManager`) | **US-602** | Sprint 2 | 2 |
| **FR-21** | Score Sharing | Services (`ShareService` Android Native) | **US-603** | Sprint 2 | 3 |
| **FR-22** | AdMob Integration | Monetization (`AdManager`) | **US-701** | Sprint 3 | 3 |
| **FR-23** | Rewarded Continue | Monetization (`AdManager`, `RewardedState`) | **US-702** | Sprint 3 | 5 |
| **FR-24** | Offline Gameplay | Fallback Logic (`AdManager`, Core) | **US-703** | Sprint 3 | 2 |
| **NFR-01** | Performance (30 FPS, Zero GC)| Core & Profiler Settings | **US-105, US-802** | Sprint 1/3 | 5 |
| **NFR-02** | Storage Footprint (<15MB APK) | Asset Stripping & Compression | **US-803** | Sprint 3 | 3 |
| **NFR-04** | Data Reliability & Integrity | Encrypted `SaveSystem` HMAC Hash | **US-303** | Sprint 1 | (Included) |
| **NFR-05** | Compatibility & Build Matrix | Build Pipeline & Device Matrix | **US-804** | Sprint 3 | 3 |
| **NFR-06** | Maintainability & Unit Testing | NUnit Test Runner Framework | **US-801** | Sprint 3 | 3 |

**Total Estimated Backlog:** **76 Story Points** across 3 Sprints.

---
*End of Development Epics & Scrum Backlog Specification for Neon Snake: Light.*
