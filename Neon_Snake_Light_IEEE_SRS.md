# Software Requirements Specification (SRS)
## Neon Snake: Light

**Document Version:** 1.0  
**Prepared For:** Academic / Software Project Documentation  
**Platform:** Android  
**Development Engine:** Unity  
**Programming Language:** C#  
**Date:** 24 August 2026

---

## Table of Contents

1. Introduction
2. Overall Description
3. Specific Requirements
4. External Interface Requirements
5. Functional Requirements
6. Non-Functional Requirements
7. System Features
8. Use Cases
9. Data Requirements
10. System Constraints
11. Assumptions and Dependencies
12. Acceptance Criteria
13. Development Roadmap
14. Future Enhancements
15. Appendix

---

# 1. Introduction

## 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for **Neon Snake: Light**, a lightweight Android mobile game inspired by the classic Snake gameplay experience.

The purpose of this document is to provide a clear and structured description of the system requirements for developers, testers, project supervisors, and other stakeholders.

## 1.2 Scope

Neon Snake: Light is a mobile Snake game designed to combine classic gameplay with modern features.

The system will provide:

- Classic Snake gameplay
- Time Attack mode
- Level mode
- Ghost mode
- Snake skins
- High-score tracking
- Swipe and directional-button controls
- Sound effects
- Vibration feedback
- Dark and light themes
- Offline core gameplay
- Score sharing
- Optional advertisements
- Rewarded video for continuing after Game Over

The Minimum Viable Product (MVP) will initially focus on **Classic Mode and Time Attack Mode**. Additional features will be added in subsequent versions.

## 1.3 Intended Audience

The target users include:

- Casual mobile gamers
- Users familiar with classic Snake games
- Players approximately 8–30 years old
- Users who prefer lightweight mobile games
- Users with low- and mid-range Android smartphones

## 1.4 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| SRS | Software Requirements Specification |
| MVP | Minimum Viable Product |
| UI | User Interface |
| UX | User Experience |
| FPS | Frames Per Second |
| APK | Android Application Package |
| AdMob | Google Mobile Advertising Platform |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| Ghost Mode | Mode in which a previous performance is represented by a ghost |
| Time Attack | Mode based on achieving the highest score within a fixed time |

## 1.5 References

The project structure follows commonly used IEEE-style SRS practices, particularly the organization associated with software requirements specifications.

---

# 2. Overall Description

## 2.1 Product Perspective

Neon Snake: Light will be a standalone Android application developed using Unity and C#.

The application will primarily operate locally. Internet connectivity will not be required for the core game, although advertising and future online services may require an internet connection.

## 2.2 Product Functions

The major functions of the system are:

1. Launch and main-menu navigation
2. Game-mode selection
3. Snake movement
4. Food generation
5. Collision detection
6. Score calculation
7. High-score storage
8. Classic Mode
9. Time Attack Mode
10. Level Mode
11. Ghost Mode
12. Skin selection
13. Sound control
14. Vibration control
15. Theme selection
16. Score sharing
17. Advertisement display
18. Rewarded Continue
19. Local settings storage

## 2.3 User Classes and Characteristics

### 2.3.1 Casual Player

A user who wants a simple game for short play sessions.

### 2.3.2 Regular Player

A user who repeatedly plays the game to improve their high score.

### 2.3.3 Competitive Player

A user interested in Time Attack, Ghost Mode, and high-score challenges.

## 2.4 Operating Environment

The application shall operate on:

- Android smartphones
- Touchscreen devices
- Low-, mid-, and selected high-range Android hardware
- Multiple screen resolutions and aspect ratios

The development environment shall use:

- Unity
- C#
- Android SDK
- Google AdMob SDK

## 2.5 Design and Implementation Constraints

The system shall be designed with the following constraints:

- The core game should remain lightweight.
- The target application size should be less than approximately 15 MB where practical.
- Core gameplay should work offline.
- The application should be optimized for low- and mid-range devices.
- The game should avoid unnecessary graphics complexity.
- Immediate 180-degree Snake turns shall not be allowed.
- Advertisements shall not unnecessarily interrupt active gameplay.

## 2.6 User Documentation

The application should provide simple in-game instructions explaining:

- How to move the Snake
- How to collect food
- How scoring works
- How each game mode works
- How to use the settings
- How rewarded Continue works

## 2.7 Assumptions and Dependencies

The project assumes:

- The user owns an Android-compatible touchscreen device.
- The device supports basic audio and vibration features.
- Unity and required Android development tools are available to the development team.
- AdMob services are available when advertisements are enabled.
- Internet connectivity is available for advertisements when required.

---

# 3. Specific Requirements

## 3.1 General Requirement Identification

Each requirement shall have a unique identifier.

Functional requirements use the prefix `FR`.

Non-functional requirements use the prefix `NFR`.

---

# 4. External Interface Requirements

## 4.1 User Interface Requirements

### 4.1.1 Main Menu

The main menu shall provide access to:

- Play
- Game Modes
- Skins
- High Score
- Settings
- Share

### 4.1.2 Gameplay Screen

The gameplay screen shall display:

- Snake
- Food
- Current score
- Timer when applicable
- Pause control
- Direction controls when enabled

### 4.1.3 Game Over Screen

The Game Over screen shall display:

- Final score
- High score
- Retry option
- Main Menu option
- Share option
- Rewarded Continue option when available

## 4.2 Hardware Interfaces

The application may interact with:

- Touchscreen
- Device vibration motor
- Device audio output

No external hardware shall be required.

## 4.3 Software Interfaces

| Software | Purpose |
|---|---|
| Unity | Game development engine |
| C# | Application programming |
| Android SDK | Android build and deployment |
| Google AdMob SDK | Advertisement integration |
| Unity PlayerPrefs or equivalent | Local settings and score storage |

## 4.4 Communication Interfaces

Core gameplay shall not require network communication.

Internet connectivity may be used for:

- Loading advertisements
- Rewarded advertisements
- Future online services

---

# 5. Functional Requirements

## FR-01: Application Launch

The system shall launch the main menu when the application starts successfully.

## FR-02: Main Menu Navigation

The system shall allow the user to navigate between the main menu, game modes, skins, settings, and gameplay screens.

## FR-03: Snake Movement

The system shall continuously move the Snake in the selected direction.

The available directions shall be:

- Up
- Down
- Left
- Right

## FR-04: Direction Validation

The system shall prevent an immediate 180-degree change of direction.

For example, a Snake moving right shall not immediately move left.

## FR-05: Swipe Control

The system shall support swipe gestures for changing the Snake's direction.

## FR-06: Button Control

The system shall provide optional on-screen directional buttons.

## FR-07: Food Generation

The system shall generate food at valid random positions that do not overlap with the Snake or invalid obstacles.

## FR-08: Food Consumption

When the Snake consumes food, the system shall:

1. Increase the player's score.
2. Increase the Snake's length.
3. Generate new food.
4. Play an eating sound when sound is enabled.
5. Trigger vibration when vibration is enabled.

## FR-09: Collision Detection

The system shall detect collisions between the Snake and:

- Game boundaries
- Its own body
- Level obstacles, where applicable

## FR-10: Game Over

The system shall end the current game when a Game Over condition occurs.

## FR-11: Score Calculation

The system shall calculate and display the player's current score during gameplay.

## FR-12: High Score Storage

The system shall save the highest score locally.

The saved high score shall remain available after application restart.

## FR-13: Classic Mode

Classic Mode shall provide an endless Snake experience.

The difficulty shall increase progressively, including gradual speed increases.

## FR-14: Time Attack Mode

Time Attack Mode shall provide a fixed-duration challenge.

The default duration shall be 60 seconds.

The player shall attempt to achieve the highest possible score before the timer expires.

## FR-15: Level Mode

The full version shall support approximately 30 levels.

Levels may introduce:

- New maps
- Obstacles
- Increased speed
- Increased difficulty
- Different layouts

## FR-16: Ghost Mode

Ghost Mode shall allow the player to compete against a previous recorded performance.

The previous performance shall be represented visually as a ghost where technically feasible.

## FR-17: Skin Selection

The system shall provide at least five Snake skins in the full version.

The selected skin shall be stored locally.

## FR-18: Theme Selection

The system shall support:

- Dark Theme
- Light Theme

The selected theme shall be saved locally.

## FR-19: Sound Management

The system shall provide sound effects for important game events.

The user shall be able to enable or disable sound.

## FR-20: Vibration Management

The system shall provide optional vibration feedback.

The user shall be able to enable or disable vibration.

## FR-21: Score Sharing

The system shall provide an Android share function that allows the user to share their score through supported applications.

## FR-22: Advertisement Integration

The system shall support Google AdMob.

The application may display banner advertisements and rewarded advertisements.

## FR-23: Rewarded Continue

After Game Over, the system may allow the user to watch a rewarded advertisement to continue the game.

The user shall not be forced to watch an advertisement.

## FR-24: Offline Gameplay

The core game shall remain playable without an internet connection.

---

# 6. Non-Functional Requirements

## NFR-01: Performance

The application shall provide smooth gameplay on supported Android devices.

The initial target shall be approximately 30 FPS to balance performance and battery usage.

## NFR-02: Storage

The application should target a package size of less than approximately 15 MB for the MVP where practical.

## NFR-03: Usability

The system shall provide simple and understandable controls.

A new user should be able to start playing with minimal instruction.

## NFR-04: Reliability

The application shall preserve locally stored settings and high scores during normal application closure and restart.

## NFR-05: Compatibility

The application shall support a suitable range of Android smartphones and different screen resolutions.

## NFR-06: Maintainability

The source code shall be organized into modular components so that future features can be added without unnecessary changes to existing systems.

## NFR-07: Scalability

The architecture should allow additional:

- Game modes
- Skins
- Levels
- Maps
- Achievements
- Challenges

to be added in future versions.

## NFR-08: Accessibility

The application should use readable text, clearly distinguishable controls, and sufficient touch-target sizes for mobile interaction.

## NFR-09: Security and Privacy

The application shall avoid collecting unnecessary personal information.

The game shall not require an account for basic offline gameplay.

---

# 7. System Features

## 7.1 Classic Mode

**Description:** Endless traditional Snake gameplay.

**Inputs:**
- Swipe
- Direction buttons

**Outputs:**
- Score
- Snake growth
- Game Over

**Priority:** High

## 7.2 Time Attack Mode

**Description:** Score as much as possible within 60 seconds.

**Inputs:**
- Player movement controls

**Outputs:**
- Timer
- Score
- Final score

**Priority:** High

## 7.3 Level Mode

**Description:** Structured levels with increasing difficulty.

**Priority:** Medium

## 7.4 Ghost Mode

**Description:** Compete against a previous recorded performance.

**Priority:** Medium

## 7.5 Customization

The user shall be able to select:

- Snake skin
- Theme
- Sound preference
- Vibration preference
- Control preference

---

# 8. Use Cases

## UC-01: Start Game

**Actor:** Player

**Precondition:** Application is installed and launched.

**Main Flow:**
1. Player opens the application.
2. Main menu is displayed.
3. Player selects Play.
4. Player selects a game mode.
5. Game starts.

**Postcondition:** Gameplay is active.

## UC-02: Eat Food

**Actor:** Player

**Precondition:** Gameplay is active.

**Main Flow:**
1. Snake moves toward food.
2. Snake reaches the food.
3. System detects collision with food.
4. Score increases.
5. Snake length increases.
6. New food is generated.

**Postcondition:** Updated score and Snake length are displayed.

## UC-03: Game Over

**Actor:** Player

**Precondition:** Gameplay is active.

**Main Flow:**
1. Snake collides with a boundary, itself, or obstacle.
2. System detects the collision.
3. Gameplay stops.
4. Final score is calculated.
5. High score is updated if necessary.
6. Game Over screen is displayed.

## UC-04: Continue Using Rewarded Advertisement

**Actor:** Player

**Precondition:** Game Over occurs and a rewarded advertisement is available.

**Main Flow:**
1. Player selects Continue.
2. System displays a rewarded advertisement.
3. Player completes the required advertisement.
4. System resumes the game according to the configured Continue rules.

**Alternative Flow:**
- Player declines the advertisement.
- Game remains on the Game Over screen.

## UC-05: Share Score

**Actor:** Player

**Precondition:** A score is available.

**Main Flow:**
1. Player selects Share.
2. Android share interface opens.
3. Player selects a supported application.
4. Score message is shared.

---

# 9. Data Requirements

The following data shall be stored locally where required:

| Data | Storage | Purpose |
|---|---|---|
| High Score | Local Storage | Preserve best score |
| Selected Skin | Local Storage | Preserve customization |
| Theme | Local Storage | Preserve appearance |
| Sound Setting | Local Storage | Preserve sound preference |
| Vibration Setting | Local Storage | Preserve vibration preference |
| Control Setting | Local Storage | Preserve control preference |
| Ghost Data | Local Storage | Store previous performance |

The application shall not require a database server for the MVP.

---

# 10. System Constraints

The following constraints apply:

1. The application is primarily designed for Android.
2. Unity and C# will be used for development.
3. Core gameplay should work offline.
4. The game should remain lightweight.
5. The user interface must support mobile screens.
6. The Snake shall not be allowed to reverse direction instantly.
7. Advertising must not unnecessarily disrupt active gameplay.
8. Future features should be implementable without redesigning the complete application.

---

# 11. Assumptions and Dependencies

## 11.1 Assumptions

- Users have Android touchscreen devices.
- Users understand basic mobile touch interaction.
- The device supports vibration if vibration is enabled.
- The device supports audio playback if sound is enabled.

## 11.2 Dependencies

The project may depend on:

- Unity development tools
- Android SDK
- Google AdMob SDK
- Android operating system
- Internet connectivity for advertisements

---

# 12. Acceptance Criteria

The MVP shall be accepted when all high-priority requirements are successfully implemented and tested.

The following conditions shall be satisfied:

1. Snake movement works correctly.
2. Immediate 180-degree turns are prevented.
3. Food is generated correctly.
4. Snake grows after eating food.
5. Score increases correctly.
6. Collision detection works correctly.
7. Game Over works correctly.
8. High Score is saved after restarting the application.
9. Classic Mode works correctly.
10. Time Attack Mode works for the configured duration.
11. Swipe controls work correctly.
12. Direction buttons work correctly.
13. Sound and vibration settings work correctly.
14. Score sharing works on supported Android devices.
15. Advertisement integration does not break gameplay.
16. Core gameplay works without an internet connection.
17. The APK installs and launches successfully on supported test devices.

---

# 13. Development Roadmap

## Phase 1: Core Gameplay — Days 1–3

- Unity project setup
- Game board
- Snake movement
- Food system
- Collision detection
- Game Over

## Phase 2: Controls and Scoring — Days 4–5

- Swipe controls
- Direction buttons
- Score system
- High-score storage

## Phase 3: MVP Game Modes — Days 6–7

- Classic Mode
- Time Attack Mode
- Timer
- Difficulty progression

## Phase 4: Customization and Monetization — Days 8–9

- Snake skins
- Sound
- Vibration
- Score sharing
- AdMob
- Rewarded Continue

## Phase 5: Testing and Build — Day 10

- Functional testing
- Device testing
- Performance optimization
- Bug fixing
- Android APK generation

---

# 14. Future Enhancements

Future releases may include:

- Complete 30-level campaign
- Advanced Ghost Mode
- Online leaderboards
- Achievements
- Daily challenges
- Additional Snake skins
- Cosmetic store
- More maps
- Seasonal events
- Cloud save
- Online competitions

---

# 15. Appendix

## Appendix A: MVP Feature Priority

| Feature | Priority | Release |
|---|---|---|
| Snake Movement | High | MVP |
| Food System | High | MVP |
| Collision | High | MVP |
| Score | High | MVP |
| High Score | High | MVP |
| Classic Mode | High | MVP |
| Time Attack | High | MVP |
| Swipe Controls | High | MVP |
| Button Controls | High | MVP |
| Sound | Medium | MVP |
| Vibration | Medium | MVP |
| Skins | Medium | MVP |
| AdMob | Medium | MVP |
| Share Score | Medium | MVP |
| Level Mode | Medium | Future |
| Ghost Mode | Medium | Future |
| Online Leaderboard | Low | Future |

## Appendix B: Recommended Technology Stack

| Component | Technology |
|---|---|
| Game Engine | Unity |
| Programming Language | C# |
| Platform | Android |
| Local Storage | PlayerPrefs / Equivalent |
| Advertising | Google AdMob |
| Graphics | 2D Lightweight Assets |
| Audio | Lightweight Sound Assets |
| Version Control | Git / GitHub |

## Appendix C: Project Success Goals

The project should aim to achieve:

- Simple and responsive gameplay
- Fast startup
- Low storage consumption
- Offline core functionality
- Good performance on low-end devices
- Easy-to-use controls
- Strong replay value
- Non-intrusive monetization
- Modular architecture for future updates
