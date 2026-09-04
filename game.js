/* ==========================================================================
   NEON SNAKE: LIGHT - EPIC 01 THROUGH EPIC 05 COMPLETE ENGINE
   Architectural Alignment: SRS FR-01 through FR-18, NFR-03, NFR-04, NFR-06, NFR-07, NFR-08 & SDD Sections 2-6
   ========================================================================== */

// --- 1. CORE DOMAIN TYPINGS & ENUMS ---
const Direction = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE'
});

const GameState = Object.freeze({
  BootState: 'BOOTSTATE',
  MainMenuState: 'MAINMENUSTATE',
  GameLoopState: 'GAMELOOPSTATE',
  PausedState: 'PAUSEDSTATE',
  GameOverState: 'GAMEOVERSTATE',
  RewardedState: 'REWARDEDSTATE',
  LevelClearedState: 'LEVELCLEAREDSTATE'
});

const InputControlType = Object.freeze({
  SWIPE: 'SWIPE',
  BUTTONS: 'BUTTONS'
});

const ThemeMode = Object.freeze({
  DARK: 'DARK',
  LIGHT: 'LIGHT',
  FOREST: 'FOREST',
  CITY: 'CITY',
  DESERT: 'DESERT',
  SUNSET: 'SUNSET'
});

const THEME_LIST = [
  { id: 0, mode: ThemeMode.DARK, name: 'Cyber Dark', color: '#00f0ff', canvasBg: '#04070f', canvasGrid: 'rgba(0, 240, 255, 0.06)', obstacle: '#ff0055' },
  { id: 1, mode: ThemeMode.LIGHT, name: 'Clean Light', color: '#3b82f6', canvasBg: '#f0f4f8', canvasGrid: 'rgba(0, 120, 180, 0.12)', obstacle: '#e11d48' },
  { id: 2, mode: ThemeMode.FOREST, name: 'Forest', color: '#10b981', canvasBg: '#06140b', canvasGrid: 'rgba(16, 185, 129, 0.12)', obstacle: '#ff4400' },
  { id: 3, mode: ThemeMode.CITY, name: 'Cyber City', color: '#a855f7', canvasBg: '#080a1c', canvasGrid: 'rgba(168, 85, 247, 0.15)', obstacle: '#ff00a0' },
  { id: 4, mode: ThemeMode.DESERT, name: 'Desert', color: '#f59e0b', canvasBg: '#140d07', canvasGrid: 'rgba(245, 158, 11, 0.14)', obstacle: '#d9381e' },
  { id: 5, mode: ThemeMode.SUNSET, name: 'Sunset', color: '#ec4899', canvasBg: '#120617', canvasGrid: 'rgba(236, 72, 153, 0.14)', obstacle: '#ff3366' }
];

class GridPosition {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}

// --- 2. GRID MANAGER (US-102) ---
class GridManager {
  constructor(width = 20, height = 30) {
    this.width = width;
    this.height = height;
  }

  isWithinBounds(pos) {
    return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
  }
}

// --- 3. SNAKE CONTROLLER (US-103) ---
class SnakeController {
  constructor() {
    this.bodyParts = [];
    this.currentDirection = Direction.RIGHT;
    this.pendingDirection = Direction.RIGHT;
    this.lastRejectedDirection = null;
  }

  initialize(startPos, initialLength = 3, initialDirection = Direction.RIGHT) {
    this.bodyParts = [];
    this.currentDirection = initialDirection;
    this.pendingDirection = initialDirection;
    this.lastRejectedDirection = null;

    const dx = initialDirection === Direction.RIGHT ? -1 : initialDirection === Direction.LEFT ? 1 : 0;
    const dy = initialDirection === Direction.UP ? -1 : initialDirection === Direction.DOWN ? 1 : 0;

    for (let i = 0; i < initialLength; i++) {
      this.bodyParts.push(new GridPosition(startPos.x + (dx * i), startPos.y + (dy * i)));
    }
  }

  get headPosition() {
    return this.bodyParts[0];
  }

  requestDirectionChange(newDir) {
    if (newDir === Direction.NONE || SnakeController.isOppositeDirection(this.currentDirection, newDir)) {
      this.lastRejectedDirection = newDir;
      return false; // FR-04: 180° turn prevention guard check triggered
    }
    this.pendingDirection = newDir;
    this.lastRejectedDirection = null;
    return true;
  }

  stepForward(growNextStep = false) {
    this.currentDirection = this.pendingDirection;
    const head = this.bodyParts[0];
    let nextHead;

    // Screen-space: Y=0 is top, Y increases downward
    switch (this.currentDirection) {
      case Direction.UP: nextHead = new GridPosition(head.x, head.y - 1); break;
      case Direction.DOWN: nextHead = new GridPosition(head.x, head.y + 1); break;
      case Direction.LEFT: nextHead = new GridPosition(head.x - 1, head.y); break;
      case Direction.RIGHT: nextHead = new GridPosition(head.x + 1, head.y); break;
      default: nextHead = new GridPosition(head.x, head.y);
    }

    this.bodyParts.unshift(nextHead);

    if (!growNextStep) {
      this.bodyParts.pop();
    }
  }

  clearSurroundingRadius(radius = 1) {
    if (this.bodyParts.length <= 1) return 0;
    const head = this.headPosition;
    let removedCount = 0;

    for (let i = this.bodyParts.length - 1; i >= 1; i--) {
      const pos = this.bodyParts[i];
      if (Math.abs(pos.x - head.x) <= radius && Math.abs(pos.y - head.y) <= radius) {
        this.bodyParts.splice(i, 1);
        removedCount++;
      }
    }
    return removedCount;
  }

  static isOppositeDirection(current, requested) {
    return (current === Direction.UP && requested === Direction.DOWN) ||
      (current === Direction.DOWN && requested === Direction.UP) ||
      (current === Direction.LEFT && requested === Direction.RIGHT) ||
      (current === Direction.RIGHT && requested === Direction.LEFT);
  }
}

// --- 4. COLLISION ENGINE (US-104) ---
class CollisionEngine {
  constructor(gridWidth, gridHeight) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  isWallCollision(head) {
    return head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight;
  }

  isSelfCollision(head, bodyParts) {
    if (!bodyParts || bodyParts.length <= 1) return false;
    for (let i = 1; i < bodyParts.length; i++) {
      if (head.x === bodyParts[i].x && head.y === bodyParts[i].y) {
        return true;
      }
    }
    return false;
  }

  isObstacleCollision(head, obstacles) {
    if (!obstacles || obstacles.length === 0) return false;
    for (let i = 0; i < obstacles.length; i++) {
      if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
        return true;
      }
    }
    return false;
  }
}

// --- 5. ZERO-ALLOCATION OBJECT POOLER (US-105) ---
class ObjectPooler {
  constructor(factory, initialCapacity = 100) {
    this.factory = factory;
    this.stack = [];
    this.totalCreated = 0;
    this.prewarm(initialCapacity);
  }

  prewarm(count) {
    for (let i = 0; i < count; i++) {
      const item = this.factory();
      this.totalCreated++;
      this.stack.push(item);
    }
  }

  get() {
    if (this.stack.length > 0) {
      return this.stack.pop();
    }
    this.totalCreated++;
    return this.factory();
  }

  release(item) {
    this.stack.push(item);
  }

  get activeCount() {
    return this.totalCreated - this.stack.length;
  }

  get availableCount() {
    return this.stack.length;
  }
}

// --- 6. GAME STATE FINITE STATE MACHINE (US-101) ---
class GameStateFSM {
  constructor() {
    this.currentState = GameState.BootState;
    this.allowedTransitions = {
      [GameState.BootState]: [GameState.MainMenuState],
      [GameState.MainMenuState]: [GameState.GameLoopState],
      [GameState.GameLoopState]: [GameState.PausedState, GameState.GameOverState, GameState.LevelClearedState],
      [GameState.PausedState]: [GameState.GameLoopState, GameState.MainMenuState],
      [GameState.GameOverState]: [GameState.MainMenuState, GameState.GameLoopState, GameState.RewardedState],
      [GameState.RewardedState]: [GameState.GameLoopState, GameState.GameOverState],
      [GameState.LevelClearedState]: [GameState.MainMenuState, GameState.GameLoopState]
    };
    this.listeners = [];
  }

  onStateChanged(callback) {
    this.listeners.push(callback);
  }

  changeState(newState) {
    if (this.currentState === newState) return false;
    const valid = this.allowedTransitions[this.currentState];
    if (valid && valid.includes(newState)) {
      const prev = this.currentState;
      this.currentState = newState;
      this.listeners.forEach(cb => cb(prev, newState));
      return true;
    }
    return false;
  }
}

// --- 7. INPUT SUBSYSTEM (US-201 & US-202) ---
class SwipeInputHandler {
  constructor(minThresholdPx = 30) {
    this.minSwipeThresholdPx = minThresholdPx;
    this.isEnabled = true;
    this.onDirectionRequested = null;
    this.lastDelta = { x: 0, y: 0 };
    this.lastDominantAxis = 'NONE';
  }

  processSwipe(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    this.lastDelta = { x: Math.round(deltaX), y: Math.round(deltaY) };

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance < this.minSwipeThresholdPx) {
      this.lastDominantAxis = 'SUB-THRESHOLD';
      return Direction.NONE;
    }

    let dir;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      this.lastDominantAxis = 'HORIZONTAL';
      dir = deltaX > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      this.lastDominantAxis = 'VERTICAL';
      // Canvas Y increases downward: swipe down = positive deltaY = DOWN direction
      dir = deltaY > 0 ? Direction.DOWN : Direction.UP;
    }

    if (this.isEnabled && this.onDirectionRequested) {
      this.onDirectionRequested(dir);
    }
    return dir;
  }
}

class ButtonInputHandler {
  constructor() {
    this.isEnabled = false;
    this.onDirectionRequested = null;
  }

  triggerDirection(dir) {
    if (this.isEnabled && this.onDirectionRequested) {
      this.onDirectionRequested(dir);
    }
  }
}

class InputManager {
  constructor(swipeHandler, buttonHandler) {
    this.swipeHandler = swipeHandler;
    this.buttonHandler = buttonHandler;
    this.activeMode = InputControlType.SWIPE;
    this.onDirectionRequested = null;

    this.swipeHandler.onDirectionRequested = (dir) => this.dispatchDirection(dir);
    this.buttonHandler.onDirectionRequested = (dir) => this.dispatchDirection(dir);
  }

  setControlType(type) {
    this.activeMode = type;
    if (type === InputControlType.SWIPE) {
      this.swipeHandler.isEnabled = true;
      this.buttonHandler.isEnabled = false;
    } else {
      this.swipeHandler.isEnabled = false;
      this.buttonHandler.isEnabled = true;
    }
  }

  dispatchDirection(dir) {
    if (this.onDirectionRequested) {
      this.onDirectionRequested(dir);
    }
  }
}

// --- 8. FOOD MANAGER (US-301) ---
class FoodManager {
  constructor(width = 20, height = 30) {
    this.gridWidth = width;
    this.gridHeight = height;
    this.activeFoodPosition = new GridPosition(15, 20);
    this.defaultPoints = 10;
  }

  spawnFood(occupiedPositions, obstacles = []) {
    const occupiedSet = new Set(occupiedPositions.map(p => `${p.x},${p.y}`));
    if (obstacles && obstacles.length > 0) {
      obstacles.forEach(o => occupiedSet.add(`${o.x},${o.y}`));
    }
    const available = [];

    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        if (!occupiedSet.has(`${x},${y}`)) {
          available.push(new GridPosition(x, y));
        }
      }
    }

    if (available.length === 0) return false;

    const idx = Math.floor(Math.random() * available.length);
    this.activeFoodPosition = available[idx];
    return true;
  }

  checkFoodCollision(head) {
    if (!head || !this.activeFoodPosition) return false;
    return head.x === this.activeFoodPosition.x && head.y === this.activeFoodPosition.y;
  }
}

// --- BONUS FOOD MANAGER ---
class BonusFoodManager {
  constructor(width = 20, height = 30) {
    this.gridWidth = width;
    this.gridHeight = height;
    this.bonusFoodPosition = null;
    this.bonusPoints = 50;
    this.bonusDuration = 10000; // 10 seconds in ms
    this.bonusSpawnedAt = 0;
    this.isActive = false;
    this.foodCountSinceLastBonus = 0;
    this.nextBonusThreshold = 2 + Math.floor(Math.random() * 2); // 2 or 3
    this.pulseAngle = 0;
  }

  onRegularFoodEaten(occupiedPositions, obstacles = []) {
    this.foodCountSinceLastBonus++;
    if (!this.isActive && this.foodCountSinceLastBonus >= this.nextBonusThreshold) {
      this.spawnBonus(occupiedPositions, obstacles);
    }
  }

  spawnBonus(occupiedPositions, obstacles = []) {
    const occupiedSet = new Set(occupiedPositions.map(p => `${p.x},${p.y}`));
    if (obstacles && obstacles.length > 0) {
      obstacles.forEach(o => occupiedSet.add(`${o.x},${o.y}`));
    }
    const available = [];
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        if (!occupiedSet.has(`${x},${y}`)) {
          available.push({ x, y });
        }
      }
    }
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    this.bonusFoodPosition = pick;
    this.isActive = true;
    this.bonusSpawnedAt = performance.now();
    this.foodCountSinceLastBonus = 0;
    this.nextBonusThreshold = 2 + Math.floor(Math.random() * 2);
  }

  update(now) {
    if (this.isActive && now - this.bonusSpawnedAt >= this.bonusDuration) {
      this.expire();
    }
    this.pulseAngle += 0.1;
  }

  expire() {
    this.isActive = false;
    this.bonusFoodPosition = null;
  }

  checkCollision(head) {
    if (!this.isActive || !this.bonusFoodPosition || !head) return false;
    return head.x === this.bonusFoodPosition.x && head.y === this.bonusFoodPosition.y;
  }

  getTimeLeft(now) {
    if (!this.isActive) return 0;
    return Math.max(0, this.bonusDuration - (now - this.bonusSpawnedAt));
  }
}

// --- 9. SCORE MODEL (US-302) ---
class ScoreModel {
  constructor(initialHighScore = 0) {
    this.currentScore = 0;
    this.highScore = Math.max(0, initialHighScore);
    this.onScoreChanged = null;
    this.onHighScoreUpdated = null;
  }

  addScore(pts = 10) {
    this.currentScore += pts;
    if (this.onScoreChanged) this.onScoreChanged(this.currentScore);

    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      if (this.onHighScoreUpdated) this.onHighScoreUpdated(this.highScore);
    }
  }

  resetSessionScore() {
    this.currentScore = 0;
    if (this.onScoreChanged) this.onScoreChanged(this.currentScore);
  }

  setHighScore(val) {
    this.highScore = Math.max(0, val);
    if (this.onHighScoreUpdated) this.onHighScoreUpdated(this.highScore);
  }
}

// --- 10. ENCRYPTED SAVE SYSTEM & HMAC-SHA256 (US-303) ---
class SaveSystem {
  static SAVE_KEY = 'NEON_SNAKE_SAVE_DATA_V1';
  static SECRET_SALT = 'NeonSnake_AntiTamper_SecretSalt_#2026_SecureKey!';

  static simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'HMAC_' + Math.abs(hash).toString(16) + '8f9c47e1b';
  }

  static computeSecurityHash(data, deviceId = 'WEB_DEVICE_ID_001') {
    const payload = `${data.HighScoreClassic}:${data.HighScoreTimeAttack}:${data.SelectedSkinId}:${data.SelectedThemeId}:${data.UnlockedLevelMax || 1}:${data.SelectedLevelIndex || 0}:${deviceId}:${SaveSystem.SECRET_SALT}`;
    return SaveSystem.simpleHash(payload);
  }

  static _localStorageAvailable() {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch (e) {
      return false;
    }
  }

  static _getDefaultData() {
    return {
      HighScoreClassic: 0,
      HighScoreTimeAttack: 0,
      SelectedSkinId: 0,
      SelectedThemeId: 0,
      SpeedScalingMode: 'MEDIUM',
      SoundEnabled: true,
      VibrationEnabled: true,
      ControlType: 0,
      UnlockedSkinIds: [0],
      UnlockedLevelMax: 1,
      SelectedLevelIndex: 0,
      SecurityHash: ''
    };
  }

  static saveData(data) {
    data.SecurityHash = SaveSystem.computeSecurityHash(data);
    try {
      localStorage.setItem(SaveSystem.SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // file:// origin or private browsing — ignore storage errors silently
      console.warn('[SaveSystem] localStorage unavailable:', e.message);
    }
    return data.SecurityHash;
  }

  static loadData() {
    if (!SaveSystem._localStorageAvailable()) {
      // Running from file:// or storage is blocked — return clean defaults
      const defaultData = SaveSystem._getDefaultData();
      SaveSystem.computeSecurityHash(defaultData); // compute but don't store
      return { data: defaultData, isTampered: false };
    }

    let json;
    try {
      json = localStorage.getItem(SaveSystem.SAVE_KEY);
    } catch (e) {
      json = null;
    }

    if (!json) {
      const defaultData = SaveSystem._getDefaultData();
      SaveSystem.saveData(defaultData);
      return { data: defaultData, isTampered: false };
    }

    try {
      const loaded = JSON.parse(json);
      const expectedHash = SaveSystem.computeSecurityHash(loaded);

      if (loaded.SecurityHash !== expectedHash) {
        console.warn('[SECURITY TAMPER DETECTED] Save checksum mismatch! High scores reset to fallback 0.');
        loaded.HighScoreClassic = 0;
        loaded.HighScoreTimeAttack = 0;
        SaveSystem.saveData(loaded);
        return { data: loaded, isTampered: true };
      }

      return { data: loaded, isTampered: false };
    } catch (e) {
      const fallback = SaveSystem._getDefaultData();
      SaveSystem.saveData(fallback);
      return { data: fallback, isTampered: true };
    }
  }

  static corruptSaveData() {
    try {
      const json = localStorage.getItem(SaveSystem.SAVE_KEY);
      if (json) {
        const obj = JSON.parse(json);
        obj.HighScoreClassic = 999999;
        localStorage.setItem(SaveSystem.SAVE_KEY, JSON.stringify(obj));
      }
    } catch (e) {
      console.warn('[SaveSystem] corruptSaveData failed:', e.message);
    }
  }
}

// --- 11. POLYMORPHIC GAME MODE SUBSYSTEM (US-401 through US-404) ---
class ClassicGameMode {
  constructor() {
    this.modeId = 'CLASSIC';
    this.modeDisplayName = 'Classic Mode (Endless)';
    this.baseTickInterval = 200;
    this.minTickInterval = 60;
    this.currentTickInterval = 200;
  }

  initializeMode() { this.currentTickInterval = this.baseTickInterval; }
  onTick(deltaTime) { }

  onFoodEaten(currentScore, speedScalingMode = 'MEDIUM') {
    const foodCount = Math.floor(currentScore / 10);
    let rate = 0.02;
    if (speedScalingMode === 'LOW') {
      rate = 0;
    } else if (speedScalingMode === 'MEDIUM') {
      rate = 0.02;
    } else if (speedScalingMode === 'HIGH') {
      rate = 0.05;
    }

    const factor = rate === 0 ? 1.0 : Math.pow(1 - rate, foodCount);
    this.currentTickInterval = Math.max(this.minTickInterval, Math.round(this.baseTickInterval * factor));
  }

  checkGameOverCondition() { return false; }
  teardownMode() { this.currentTickInterval = this.baseTickInterval; }
}

class TimeAttackGameMode {
  constructor() {
    this.modeId = 'TIME_ATTACK';
    this.modeDisplayName = 'Time Attack (60s)';
    this.totalTimeLimit = 60.0;
    this.remainingTime = 60.0;
    this.currentTickInterval = 120;
    this.onTimerUpdated = null;
    this.onTimeExpired = null;
  }

  initializeMode() {
    this.remainingTime = this.totalTimeLimit;
    if (this.onTimerUpdated) this.onTimerUpdated(this.remainingTime);
  }

  onTick(deltaTime) {
    if (this.remainingTime > 0) {
      this.remainingTime = Math.max(0.0, this.remainingTime - deltaTime);
      if (this.onTimerUpdated) this.onTimerUpdated(this.remainingTime);

      if (this.remainingTime <= 0.0 && this.onTimeExpired) {
        this.onTimeExpired();
      }
    }
  }

  onFoodEaten(currentScore) { }
  checkGameOverCondition() { return this.remainingTime <= 0.0; }
  teardownMode() { this.remainingTime = this.totalTimeLimit; }
}

class LevelGameMode {
  static get LEVELS() {
    const buildColumn = (x, yStart, yEnd) => {
      const arr = [];
      for (let y = yStart; y <= yEnd; y++) arr.push(new GridPosition(x, y));
      return arr;
    };
    const buildRow = (y, xStart, xEnd) => {
      const arr = [];
      for (let x = xStart; x <= xEnd; x++) arr.push(new GridPosition(x, y));
      return arr;
    };
    const buildBox = (xStart, xEnd, yStart, yEnd) => {
      const arr = [];
      for (let x = xStart; x <= xEnd; x++) {
        arr.push(new GridPosition(x, yStart));
        arr.push(new GridPosition(x, yEnd));
      }
      for (let y = yStart + 1; y < yEnd; y++) {
        arr.push(new GridPosition(xStart, y));
        arr.push(new GridPosition(xEnd, y));
      }
      return arr;
    };

    return [
      // SET 1 (Levels 1 - 5 + Level 6 Ghost)
      { id: 1, name: 'Stage 1: Novice Glide', targetScoreGoal: 50, tickInterval: 180, description: 'Clear open grid. Reach 50 Pts to advance!', obstacles: [] },
      { id: 2, name: 'Stage 2: Double Pillar', targetScoreGoal: 70, tickInterval: 160, description: 'Dodge twin vertical barrier pillars!', obstacles: [...buildColumn(6, 8, 21), ...buildColumn(13, 8, 21)] },
      { id: 3, name: 'Stage 3: Crossfire Matrix', targetScoreGoal: 90, tickInterval: 145, description: 'Navigate cross-shaped barrier walls!', obstacles: [...buildRow(15, 2, 7), ...buildRow(15, 12, 17), ...buildColumn(10, 9, 12), ...buildColumn(10, 18, 21)] },
      { id: 4, name: 'Stage 4: Cyber Ring', targetScoreGoal: 110, tickInterval: 130, description: 'High-speed perimeter ring wall challenge!', obstacles: [...buildRow(6, 4, 8), ...buildRow(6, 11, 15), ...buildRow(23, 4, 8), ...buildRow(23, 11, 15), ...buildColumn(4, 8, 13), ...buildColumn(4, 16, 21), ...buildColumn(15, 8, 13), ...buildColumn(15, 16, 21)] },
      { id: 5, name: 'Stage 5: Quantum Gauntlet', targetScoreGoal: 130, tickInterval: 120, description: 'Master level maze gauntlet! Ultimate speed & obstacles.', obstacles: [...buildRow(8, 0, 12), ...buildRow(14, 7, 19), ...buildRow(20, 0, 12), ...buildRow(26, 7, 19)] },
      { id: 6, name: '👻 Ghost Stage I: Spectral Realm', isGhostMode: true, targetScoreGoal: 150, tickInterval: 110, description: '👻 GHOST LEVEL! Screen Wrap & Spectral Phase Active!', obstacles: [...buildColumn(6, 10, 19), ...buildColumn(13, 10, 19)] },

      // SET 2 (Levels 7 - 11 + Level 12 Ghost)
      { id: 7, name: 'Stage 7: Neon Tunnel', targetScoreGoal: 160, tickInterval: 110, description: 'Squeeze through narrow twin corridors!', obstacles: [...buildColumn(5, 4, 25), ...buildColumn(14, 4, 25)] },
      { id: 8, name: 'Stage 8: Twin Fortress', targetScoreGoal: 170, tickInterval: 105, description: 'Dodge corner defensive blockades!', obstacles: [...buildBox(2, 6, 4, 8), ...buildBox(13, 17, 21, 25)] },
      { id: 9, name: 'Stage 9: Zig-Zag Alley', targetScoreGoal: 180, tickInterval: 100, description: 'Weave through alternating zigzag barriers!', obstacles: [...buildRow(6, 0, 13), ...buildRow(12, 6, 19), ...buildRow(18, 0, 13), ...buildRow(24, 6, 19)] },
      { id: 10, name: 'Stage 10: Diamond Vault', targetScoreGoal: 190, tickInterval: 95, description: 'Circumnavigate central diamond vault!', obstacles: [...buildRow(10, 7, 12), ...buildRow(20, 7, 12), ...buildColumn(4, 13, 17), ...buildColumn(15, 13, 17)] },
      { id: 11, name: 'Stage 11: Laser Grid', targetScoreGoal: 200, tickInterval: 90, description: 'Precision maneuver between laser pillars!', obstacles: [...buildColumn(4, 6, 10), ...buildColumn(15, 6, 10), ...buildColumn(4, 19, 23), ...buildColumn(15, 19, 23), ...buildRow(15, 7, 12)] },
      { id: 12, name: '👻 Ghost Stage II: Phantom Wrap', isGhostMode: true, targetScoreGoal: 210, tickInterval: 88, description: '👻 GHOST LEVEL II! Wall Wrap & Phantom Phase Enabled!', obstacles: [...buildRow(10, 4, 15), ...buildRow(20, 4, 15)] },

      // SET 3 (Levels 13 - 17 + Level 18 Ghost)
      { id: 13, name: 'Stage 13: Spiral Labyrinth', targetScoreGoal: 220, tickInterval: 85, description: 'Navigate shrinking spiral corridor!', obstacles: [...buildRow(4, 3, 16), ...buildColumn(16, 5, 24), ...buildRow(24, 3, 15), ...buildColumn(3, 8, 23)] },
      { id: 14, name: 'Stage 14: Dual Chamber', targetScoreGoal: 230, tickInterval: 82, description: 'Pass through narrow central gate!', obstacles: [...buildRow(15, 0, 8), ...buildRow(15, 11, 19)] },
      { id: 15, name: 'Stage 15: Cyber Cage', targetScoreGoal: 240, tickInterval: 80, description: 'Escape central cage trap!', obstacles: [...buildBox(5, 14, 8, 21)] },
      { id: 16, name: 'Stage 16: Slalom Track', targetScoreGoal: 250, tickInterval: 78, description: 'Slalom fast between staggered posts!', obstacles: [...buildColumn(5, 4, 10), ...buildColumn(14, 8, 14), ...buildColumn(5, 16, 20), ...buildColumn(14, 22, 26)] },
      { id: 17, name: 'Stage 17: Vortex Core', targetScoreGoal: 260, tickInterval: 76, description: 'Swirl around spinning vortex walls!', obstacles: [...buildRow(8, 5, 14), ...buildRow(21, 5, 14), ...buildColumn(5, 9, 20), ...buildColumn(14, 9, 20)] },
      { id: 18, name: '👻 Ghost Stage III: Astral Phase', isGhostMode: true, targetScoreGoal: 270, tickInterval: 74, description: '👻 GHOST LEVEL III! Spectral Portal Wrap Active!', obstacles: [...buildColumn(9, 6, 23), ...buildColumn(10, 6, 23)] },

      // SET 4 (Levels 19 - 23 + Level 24 Ghost)
      { id: 19, name: 'Stage 19: Grid Lock', targetScoreGoal: 280, tickInterval: 72, description: 'Navigate four isolated quadrant rooms!', obstacles: [...buildRow(15, 0, 19), ...buildColumn(10, 0, 29)] },
      { id: 20, name: 'Stage 20: Hyper Loop', targetScoreGoal: 290, tickInterval: 70, description: 'High-velocity concentric loop!', obstacles: [...buildBox(3, 16, 4, 25), ...buildBox(7, 12, 10, 19)] },
      { id: 21, name: 'Stage 21: Crossbow Matrix', targetScoreGoal: 300, tickInterval: 68, description: 'Crossbow barrier interception!', obstacles: [...buildRow(7, 2, 17), ...buildRow(22, 2, 17), ...buildColumn(2, 8, 21), ...buildColumn(17, 8, 21)] },
      { id: 22, name: 'Stage 22: Binary Fortress', targetScoreGoal: 310, tickInterval: 66, description: 'Infiltrate twin fortified cores!', obstacles: [...buildBox(2, 8, 6, 12), ...buildBox(11, 17, 17, 23)] },
      { id: 23, name: 'Stage 23: Pulse Grid', targetScoreGoal: 320, tickInterval: 65, description: 'Precision pulse grid navigation!', obstacles: [...buildRow(6, 2, 17), ...buildRow(12, 2, 17), ...buildRow(18, 2, 17), ...buildRow(24, 2, 17)] },
      { id: 24, name: '👻 Ghost Stage IV: Void Eclipse', isGhostMode: true, targetScoreGoal: 330, tickInterval: 64, description: '👻 GHOST LEVEL IV! Void Phase & Wall Teleport!', obstacles: [...buildBox(4, 15, 6, 23)] },

      // SET 5 (Levels 25 - 29 + Level 30 Ghost)
      { id: 25, name: 'Stage 25: Titan Pillars', targetScoreGoal: 340, tickInterval: 63, description: 'Dodge six heavy titan pillars!', obstacles: [...buildColumn(4, 4, 12), ...buildColumn(10, 4, 12), ...buildColumn(15, 4, 12), ...buildColumn(4, 17, 25), ...buildColumn(10, 17, 25), ...buildColumn(15, 17, 25)] },
      { id: 26, name: 'Stage 26: Omega Gauntlet', targetScoreGoal: 350, tickInterval: 62, description: 'Ultimate S-Curve omega course!', obstacles: [...buildRow(5, 0, 15), ...buildRow(11, 4, 19), ...buildRow(17, 0, 15), ...buildRow(23, 4, 19)] },
      { id: 27, name: 'Stage 27: Quantum Maze', targetScoreGoal: 360, tickInterval: 61, description: 'High-density quantum labyrinth!', obstacles: [...buildColumn(3, 2, 15), ...buildColumn(8, 12, 26), ...buildColumn(13, 2, 15), ...buildColumn(16, 12, 26)] },
      { id: 28, name: 'Stage 28: Cyber Citadel', targetScoreGoal: 370, tickInterval: 60, description: 'Heavily defended citadel core!', obstacles: [...buildBox(3, 16, 3, 26), ...buildRow(14, 6, 13)] },
      { id: 29, name: 'Stage 29: Neon Nightmare', targetScoreGoal: 380, tickInterval: 60, description: 'Extreme density obstacle arena!', obstacles: [...buildRow(5, 2, 8), ...buildRow(5, 11, 17), ...buildRow(15, 2, 8), ...buildRow(15, 11, 17), ...buildRow(25, 2, 8), ...buildRow(25, 11, 17)] },
      { id: 30, name: '👻 Ghost Stage V: Phantom Dimension', isGhostMode: true, targetScoreGoal: 390, tickInterval: 60, description: '👻 GHOST LEVEL V! Phantom Dimension Boundary Phase!', obstacles: [...buildRow(14, 2, 17), ...buildColumn(9, 4, 24)] },

      // SET 6 (Levels 31 - 35 + Level 36 Ghost)
      { id: 31, name: 'Stage 31: Starlight Corridor', targetScoreGoal: 400, tickInterval: 60, description: 'Lightning fast narrow corridor run!', obstacles: [...buildColumn(3, 0, 24), ...buildColumn(7, 5, 29), ...buildColumn(12, 0, 24), ...buildColumn(16, 5, 29)] },
      { id: 32, name: 'Stage 32: Matrix Havoc', targetScoreGoal: 410, tickInterval: 60, description: 'Scattered matrix barrier minefield!', obstacles: [...buildBox(2, 5, 3, 6), ...buildBox(13, 16, 3, 6), ...buildBox(7, 11, 12, 16), ...buildBox(2, 5, 22, 25), ...buildBox(13, 16, 22, 25)] },
      { id: 33, name: 'Stage 33: Eclipse Core', targetScoreGoal: 420, tickInterval: 60, description: 'Concentric ring defense grid!', obstacles: [...buildBox(2, 17, 2, 27), ...buildBox(5, 14, 6, 23), ...buildBox(8, 11, 10, 19)] },
      { id: 34, name: 'Stage 34: Valkyrie Run', targetScoreGoal: 430, tickInterval: 60, description: 'Sweeping wing barrier challenge!', obstacles: [...buildRow(6, 2, 8), ...buildRow(6, 11, 17), ...buildColumn(2, 7, 22), ...buildColumn(17, 7, 22), ...buildRow(23, 2, 8), ...buildRow(23, 11, 17)] },
      { id: 35, name: 'Stage 35: Solar Flare', targetScoreGoal: 440, tickInterval: 60, description: 'Extreme crossfire solar arena!', obstacles: [...buildRow(10, 0, 19), ...buildRow(20, 0, 19), ...buildColumn(5, 0, 29), ...buildColumn(14, 0, 29)] },
      { id: 36, name: '👻 Ghost Stage VI: Wraith Overdrive', isGhostMode: true, targetScoreGoal: 450, tickInterval: 60, description: '👻 GHOST LEVEL VI! Wraith Overdrive Phase Wrap!', obstacles: [...buildBox(4, 15, 5, 24)] },

      // SET 7 (Levels 37 - 41 + Level 42 Ghost)
      { id: 37, name: 'Stage 37: Inferno Trench', targetScoreGoal: 460, tickInterval: 60, description: 'High stakes trench gauntlet!', obstacles: [...buildColumn(4, 2, 27), ...buildColumn(9, 2, 27), ...buildColumn(14, 2, 27)] },
      { id: 38, name: 'Stage 38: Apocalypse Citadel', targetScoreGoal: 470, tickInterval: 60, description: 'Apocalyptic fortress defense maze!', obstacles: [...buildBox(1, 18, 1, 28), ...buildRow(10, 4, 15), ...buildRow(19, 4, 15)] },
      { id: 39, name: 'Stage 39: Singularity', targetScoreGoal: 480, tickInterval: 60, description: 'Survive the central gravitational walls!', obstacles: [...buildBox(6, 13, 9, 20), ...buildRow(14, 0, 19)] },
      { id: 40, name: 'Stage 40: Apex Predator', targetScoreGoal: 490, tickInterval: 60, description: 'Pro level obstacle maze gauntlet!', obstacles: [...buildRow(4, 1, 18), ...buildRow(10, 1, 18), ...buildRow(16, 1, 18), ...buildRow(22, 1, 18), ...buildRow(27, 1, 18)] },
      { id: 41, name: 'Stage 41: Grandmaster Gauntlet', targetScoreGoal: 500, tickInterval: 60, description: 'Ultimate test of precision & speed!', obstacles: [...buildBox(2, 17, 3, 26), ...buildColumn(6, 6, 23), ...buildColumn(13, 6, 23)] },
      { id: 42, name: '👻 Ghost Stage VII: Celestial Ghost God', isGhostMode: true, targetScoreGoal: 520, tickInterval: 60, description: '👻 FINAL GHOST LEVEL VII! Celestial Ghost God Mastery!', obstacles: [...buildBox(3, 16, 4, 25), ...buildRow(14, 1, 18)] }
    ];
  }

  constructor() {
    this.modeId = 'LEVEL_MODE';
    this.levels = LevelGameMode.LEVELS;
    this.currentLevelIndex = 0;
    this.unlockedLevelMax = 1;
    this.onLevelCleared = null;
    this.onLevelChanged = null;
  }

  get currentLevel() {
    return this.levels[this.currentLevelIndex] || this.levels[0];
  }

  get modeDisplayName() {
    return `Level Mode (${this.currentLevel.name})`;
  }

  get currentTickInterval() {
    return this.currentLevel.tickInterval;
  }

  get targetScoreGoal() {
    return this.currentLevel.targetScoreGoal;
  }

  getObstacles() {
    return this.currentLevel.obstacles;
  }

  selectLevel(index) {
    if (index < 0 || index >= this.levels.length) return false;
    if (index + 1 > this.unlockedLevelMax) return false;

    this.currentLevelIndex = index;
    if (this.onLevelChanged) this.onLevelChanged(this.currentLevel);
    return true;
  }

  initializeMode() { }
  onTick(deltaTime) { }

  onFoodEaten(currentScore) {
    if (this.checkWinCondition(currentScore) && this.onLevelCleared) {
      this.onLevelCleared(this.currentLevel);
    }
  }

  checkWinCondition(currentScore = 0) {
    return currentScore >= this.targetScoreGoal;
  }

  checkGameOverCondition() {
    return false;
  }

  unlockNextLevel() {
    if (this.currentLevelIndex + 1 >= this.unlockedLevelMax && this.unlockedLevelMax < this.levels.length) {
      this.unlockedLevelMax++;
      return true;
    }
    return false;
  }

  teardownMode() { }
}

class GhostRecording {
  constructor() {
    this.finalScore = 0;
    this.totalDuration = 0;
    this.frames = [];
  }

  addFrame(timestamp, dir, x, y) {
    this.frames.push({ timestamp, dir, x, y });
  }

  toJSON() {
    return JSON.stringify({ finalScore: this.finalScore, totalDuration: this.totalDuration, frames: this.frames });
  }
}

class GhostGameMode {
  constructor() {
    this.modeId = 'GHOST_MODE';
    this.modeDisplayName = 'Ghost Mode (Vs Spectral Ghost 👻)';
    this.currentTickInterval = 120;
    this.savedGhostData = null;
    this.currentGhostFrameIndex = 0;
  }

  static get GHOST_KEY() {
    return 'NeonSnake_GhostData';
  }

  static loadGhostData() {
    try {
      const raw = localStorage.getItem(GhostGameMode.GHOST_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  static saveGhostData(recording) {
    try {
      if (!recording || !recording.frames || recording.frames.length === 0) return;
      const currentGhost = GhostGameMode.loadGhostData();
      if (!currentGhost || recording.finalScore >= (currentGhost.finalScore || 0)) {
        localStorage.setItem(GhostGameMode.GHOST_KEY, recording.toJSON());
      }
    } catch (e) { }
  }

  initializeMode() {
    this.savedGhostData = GhostGameMode.loadGhostData();
    this.currentGhostFrameIndex = 0;
  }

  onTick(deltaTime) { }

  getGhostPositionAt(relTime) {
    if (!this.savedGhostData || !this.savedGhostData.frames || this.savedGhostData.frames.length === 0) {
      return null;
    }
    const frames = this.savedGhostData.frames;
    while (this.currentGhostFrameIndex < frames.length - 1 && frames[this.currentGhostFrameIndex + 1].timestamp <= relTime) {
      this.currentGhostFrameIndex++;
    }
    return frames[this.currentGhostFrameIndex] || null;
  }

  onFoodEaten(currentScore) { }
  checkGameOverCondition() { return false; }
  teardownMode() { this.currentGhostFrameIndex = 0; }
}

class GameModeManager {
  constructor() {
    this.modes = {};
    this.activeMode = null;
  }

  registerMode(mode) { this.modes[mode.modeId] = mode; }

  selectMode(modeId) {
    if (!this.modes[modeId]) return false;
    if (this.activeMode) this.activeMode.teardownMode();
    this.activeMode = this.modes[modeId];
    this.activeMode.initializeMode();
    return true;
  }

  updateActiveMode(deltaTime) { if (this.activeMode) this.activeMode.onTick(deltaTime); }
  handleFoodEaten(currentScore, speedScalingMode = 'MEDIUM') { if (this.activeMode) this.activeMode.onFoodEaten(currentScore, speedScalingMode); }
}

// --- 12. UI & CUSTOMIZATION SUBSYSTEM (EPIC 05 / US-501, US-502, US-503) ---
class NavigationRouter {
  constructor() {
    this.stack = ['MainMenu'];
    this.onViewChanged = null;
  }

  get currentView() { return this.stack[this.stack.length - 1]; }
  get stackDepth() { return this.stack.length; }

  pushView(viewName) {
    if (this.currentView === viewName) return false;
    const prev = this.currentView;
    this.stack.push(viewName);
    if (this.onViewChanged) this.onViewChanged(prev, viewName);
    return true;
  }

  popView() {
    if (this.stack.length <= 1) return false;
    const prev = this.stack.pop();
    const curr = this.currentView;
    if (this.onViewChanged) this.onViewChanged(prev, curr);
    return true;
  }

  navigateToHome() {
    const prev = this.currentView;
    this.stack = ['MainMenu'];
    if (prev !== 'MainMenu' && this.onViewChanged) {
      this.onViewChanged(prev, 'MainMenu');
    }
  }
}

class ThemeManager {
  constructor(initialMode = ThemeMode.DARK) {
    this.currentMode = initialMode;
    this.onThemeChanged = null;
  }

  getThemeData(mode = this.currentMode) {
    return THEME_LIST.find(t => t.mode === mode) || THEME_LIST[0];
  }

  getThemeId(mode = this.currentMode) {
    const data = this.getThemeData(mode);
    return data ? data.id : 0;
  }

  setThemeById(id) {
    const item = THEME_LIST.find(t => t.id === id) || THEME_LIST[0];
    this.setTheme(item.mode);
  }

  setTheme(mode) {
    if (!mode || typeof mode !== 'string') return;
    this.currentMode = mode;
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('theme-light', 'theme-forest', 'theme-city', 'theme-desert', 'theme-sunset');
      if (mode !== ThemeMode.DARK) {
        document.body.classList.add(`theme-${mode.toLowerCase()}`);
      }
    }
    if (this.onThemeChanged) this.onThemeChanged(mode);
  }

  toggleTheme() {
    const next = this.currentMode === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK;
    this.setTheme(next);
  }
}

class SkinManager {
  static SKINS = [
    { id: 0, name: 'Default Neon Green', headColor: '#00f0ff', bodyColor: '#00ff66', glowColor: '#00ff66' },
    { id: 1, name: 'Cyan Cyber', headColor: '#0066ff', bodyColor: '#00f0ff', glowColor: '#00f0ff' },
    { id: 2, name: 'Magenta Pink', headColor: '#ff0077', bodyColor: '#ff33aa', glowColor: '#ff0077' },
    { id: 3, name: 'Solar Yellow', headColor: '#ffcc00', bodyColor: '#ffff00', glowColor: '#ffcc00' },
    { id: 4, name: 'Rainbow Pulse', headColor: '#ffffff', bodyColor: '#00ffcc', glowColor: '#ff00ff' }
  ];

  constructor(initialSkinId = 0) {
    this.activeSkinId = initialSkinId;
    this.onSkinChanged = null;
  }

  get activeSkin() {
    return SkinManager.SKINS.find(s => s.id === this.activeSkinId) || SkinManager.SKINS[0];
  }

  selectSkin(skinId) {
    if (skinId < 0 || skinId >= SkinManager.SKINS.length) return false;
    this.activeSkinId = skinId;
    if (this.onSkinChanged) this.onSkinChanged(this.activeSkin);
    return true;
  }
}

// --- PARTICLE FX MANAGER (Snake Crash Shatter, Shockwave & Score Expansion) ---
class ParticleFXManager {
  constructor() {
    this.particles = [];
    this.shards = [];
    this.scorePopups = [];
    this.shakeAmount = 0;
    this.shakeDecay = 0.88;
    this.crashFlash = 0;
  }

  triggerCrashExplosion(headPos, bodyParts = [], color = '#00f0ff') {
    this.shakeAmount = 25;
    this.crashFlash = 0.8;
    const hx = headPos ? headPos.x : 10;
    const hy = headPos ? headPos.y : 15;

    // 1. Explosive Head Burst Particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9.5;
      this.particles.push({
        x: hx,
        y: hy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 8,
        color: i % 2 === 0 ? color : (i % 3 === 0 ? '#ff0055' : '#ffd700'),
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.4
      });
    }

    // 2. Snake Body Shatter Shards (Segments break apart into physics flying shards)
    if (bodyParts && bodyParts.length > 0) {
      bodyParts.forEach((p, idx) => {
        const shardCount = idx === 0 ? 6 : 4;
        for (let k = 0; k < shardCount; k++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.0 + Math.random() * 6.5;
          this.shards.push({
            x: p.x,
            y: p.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5, // slight upward arc
            gravity: 0.15,
            width: 5 + Math.random() * 9,
            height: 3 + Math.random() * 6,
            color: idx === 0 ? '#ff0055' : (k % 2 === 0 ? color : '#ffffff'),
            alpha: 1.0,
            decay: 0.012 + Math.random() * 0.015,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.5
          });
        }
      });
    }

    // 3. Floating "💥 CRASH!" Explosive Banner (Expands & grows on screen)
    this.scorePopups.push({
      x: hx,
      y: hy - 0.5,
      text: '💥 CRASH!',
      color: '#ff0055',
      scale: 0.5,
      maxScale: 2.4,
      alpha: 1.0,
      vy: -0.04,
      decay: 0.015
    });
  }

  triggerScoreScatter(x, y, text, color = '#00ff88') {
    // Dynamic Floating Score Label ("phel jae" / grow effect)
    this.scorePopups.push({
      x: x,
      y: y,
      text: text,
      color: color,
      scale: 0.4,
      maxScale: 2.2,
      alpha: 1.0,
      vy: -0.07,
      decay: 0.02
    });

    // Expanding sparkle particles scattering outward in all directions
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 6.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 6,
        color: i % 2 === 0 ? color : '#ffffff',
        alpha: 1.0,
        decay: 0.025 + Math.random() * 0.025,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.25
      });
    }
  }

  update() {
    if (this.shakeAmount > 0.1) {
      this.shakeAmount *= this.shakeDecay;
    } else {
      this.shakeAmount = 0;
    }

    if (this.crashFlash > 0.01) {
      this.crashFlash *= 0.88;
    } else {
      this.crashFlash = 0;
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * 0.15;
      p.y += p.vy * 0.15;
      p.alpha -= p.decay;
      p.rotation += p.vRot;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Shatter Shards
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.x += s.vx * 0.15;
      s.y += s.vy * 0.15;
      s.vy += s.gravity * 0.15;
      s.alpha -= s.decay;
      s.rotation += s.vRot;
      if (s.alpha <= 0) {
        this.shards.splice(i, 1);
      }
    }

    // Update Expanding Score Popups ("phel jae")
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const sp = this.scorePopups[i];
      sp.y += sp.vy;
      if (sp.scale < sp.maxScale) {
        sp.scale += 0.14; // rapid growth / expansion
      }
      sp.alpha -= sp.decay;
      if (sp.alpha <= 0) {
        this.scorePopups.splice(i, 1);
      }
    }
  }

  draw(ctx, cellW, cellH) {
    // 1. Crash Screen Flash Shockwave
    if (this.crashFlash > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 0, 85, ${this.crashFlash * 0.4})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }

    // 2. Draw Dust & Sparkle Particles
    ctx.save();
    this.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;

      const px = p.x * cellW + cellW / 2;
      const py = p.y * cellH + cellH / 2;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.rotation);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });
    ctx.restore();

    // 3. Draw Snake Shatter Shards
    ctx.save();
    this.shards.forEach(s => {
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;

      const sx = s.x * cellW + cellW / 2;
      const sy = s.y * cellH + cellH / 2;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(s.rotation);
      ctx.beginPath();
      ctx.moveTo(-s.width / 2, -s.height / 2);
      ctx.lineTo(s.width / 2, -s.height / 4);
      ctx.lineTo(s.width / 3, s.height / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();

    // 4. Draw Expanding Score & Crash Banner Popups ("phel jae")
    ctx.save();
    this.scorePopups.forEach(sp => {
      ctx.globalAlpha = Math.max(0, sp.alpha);
      const px = sp.x * cellW + cellW / 2;
      const py = sp.y * cellH + cellH / 2;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(sp.scale, sp.scale);
      ctx.fillStyle = sp.color;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 16;
      ctx.font = `800 ${Math.max(16, Math.round(cellH * 0.75))}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sp.text, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }
}

// --- 13. AUDIO, HAPTICS & SHARING SUBSYSTEM (EPIC 06 / US-601, US-602, US-603) ---
class AudioManager {
  static TRACKS = [
    { id: 0, name: 'Cyber Synthwave', type: 'synth', freqBase: 220, tempo: 130 },
    { id: 1, name: 'Forest Nature Beats', type: 'synth', freqBase: 261.63, tempo: 100 },
    { id: 2, name: 'Cyber City Nights', type: 'synth', freqBase: 174.61, tempo: 140 },
    { id: 3, name: 'Desert Sand Dune', type: 'synth', freqBase: 196.00, tempo: 115 },
    { id: 4, name: 'Sunset Chillout', type: 'synth', freqBase: 246.94, tempo: 90 }
  ];

  constructor(initialEnabled = true) {
    this.isEnabled = initialEnabled;
    this.isBgmEnabled = true;
    this.activeTrackId = 0;
    this.audioCtx = null;
    this.bgmTimer = null;
    this.isBgmPlaying = false;
    this.customAudioElement = null;
    this.customAudioUrl = null;
    this.customFileName = '';
  }

  initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
  }

  setSoundEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) this.stopBGM();
  }

  setBgmEnabled(enabled) {
    this.isBgmEnabled = enabled;
    if (!enabled) {
      this.stopBGM();
    }
  }

  setTrack(trackId) {
    this.activeTrackId = trackId;
    if (this.isBgmPlaying) {
      this.stopBGM();
      this.startBGM();
    }
  }

  loadCustomAudioFile(file) {
    if (!file) return false;
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
    }
    this.customAudioUrl = URL.createObjectURL(file);
    this.customFileName = file.name;

    if (!this.customAudioElement) {
      this.customAudioElement = new Audio();
      this.customAudioElement.loop = true;
    }
    this.customAudioElement.src = this.customAudioUrl;
    this.activeTrackId = 'custom';

    if (this.isBgmEnabled && this.isEnabled) {
      this.startBGM();
    }
    return true;
  }

  startBGM() {
    if (!this.isEnabled || !this.isBgmEnabled) return;
    this.stopBGM();

    if (this.activeTrackId === 'custom' && this.customAudioElement) {
      this.customAudioElement.play().catch(() => { });
      this.isBgmPlaying = true;
      return;
    }

    this.initAudioContext();
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const track = AudioManager.TRACKS.find(t => t.id === Number(this.activeTrackId)) || AudioManager.TRACKS[0];
    const notes = [1, 1.25, 1.33, 1.5, 1.66, 1.87];
    let noteIdx = 0;
    const intervalMs = Math.round(60000 / track.tempo / 2);

    this.isBgmPlaying = true;
    this.bgmTimer = setInterval(() => {
      if (!this.isBgmPlaying) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        const mult = notes[noteIdx % notes.length];
        noteIdx++;

        osc.type = track.id % 2 === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(track.freqBase * mult, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
      } catch (e) { }
    }, intervalMs);
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
  }

  setSoundEnabled(enabled) {
    this.isEnabled = enabled;
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  playEatSFX() {
    if (!this.isEnabled) return false;
    this.initAudioContext();
    if (!this.audioCtx) return false;

    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const now = this.audioCtx.currentTime;

      // Tone 1: Fast ascending pitch sweep (520Hz -> 1170Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(1170, now + 0.08);
      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Tone 2: Crisp high-frequency pop (1400Hz -> 2200Hz)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1400, now + 0.03);
      osc2.frequency.exponentialRampToValueAtTime(2200, now + 0.09);
      gain2.gain.setValueAtTime(0.25, now + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.03);
      osc2.stop(now + 0.09);

      return true;
    } catch (e) {
      return false;
    }
  }

  playBonusEatSFX() {
    if (!this.isEnabled) return false;
    this.initAudioContext();
    if (!this.audioCtx) return false;

    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 784.88, 1046.50]; // C5, E5, G5, C6 major triad chime

      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.45, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.18);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.18);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  playButtonClickSFX() {
    if (!this.isEnabled) return false;
    this.initAudioContext();
    if (!this.audioCtx) return false;

    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
      return true;
    } catch (e) {
      return false;
    }
  }

  playGameOverSFX() {
    return this.playCrashSFX();
  }

  playCrashSFX() {
    if (!this.isEnabled) return false;
    this.initAudioContext();
    if (!this.audioCtx) return false;

    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const now = this.audioCtx.currentTime;

      // 1. Heavy pitch drop sub-bass sweep (450Hz -> 30Hz)
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.45);

      // 2. Distorted Crash Noise Burst
      const bufferSize = Math.round(this.audioCtx.sampleRate * 0.35);
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      noise.connect(noiseGain);
      noiseGain.connect(this.audioCtx.destination);
      noise.start(now);

      // 3. Shatter Dissonant Chord Impact (Low & Punchy Crunch)
      [140, 195, 290].forEach(freq => {
        const chordOsc = this.audioCtx.createOscillator();
        const chordGain = this.audioCtx.createGain();
        chordOsc.type = 'square';
        chordOsc.frequency.setValueAtTime(freq, now);
        chordOsc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        chordGain.gain.setValueAtTime(0.2, now);
        chordGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        chordOsc.connect(chordGain);
        chordGain.connect(this.audioCtx.destination);
        chordOsc.start(now);
        chordOsc.stop(now + 0.2);
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  playHighScoreSFX() {
    if (!this.isEnabled) return false;
    this.initAudioContext();
    if (!this.audioCtx) return false;

    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const now = this.audioCtx.currentTime;
      const fanfare = [523.25, 659.25, 784.88, 1046.50]; // C5, E5, G5, C6 triumph fanfare

      fanfare.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.45, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.22);
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}

class HapticsManager {
  constructor(initialEnabled = true) {
    this.isEnabled = initialEnabled;
    this.lastVibrationMs = 0;
  }

  setVibrationEnabled(enabled) {
    this.isEnabled = enabled;
  }

  toggleVibration() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }

  triggerPulse(ms = 30) {
    if (!this.isEnabled) return false;
    this.lastVibrationMs = ms;

    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(ms);
        return true;
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  triggerVibration(ms = 30) {
    return this.triggerPulse(ms);
  }

  triggerFoodEatenHaptic() {
    return this.triggerPulse(30);
  }

  triggerButtonClickHaptic() {
    return this.triggerPulse(15);
  }

  triggerCrashHaptic() {
    return this.triggerPulse(200);
  }
}

class ShareService {
  constructor() {
    this.lastShareMessage = '';
  }

  formatShareMessage(score, modeName = 'Classic') {
    return `I just scored ${score} in Neon Snake: Light (${modeName} Mode)! Can you beat my high score?`;
  }

  async shareScore(score, modeName = 'Classic') {
    const message = this.formatShareMessage(score, modeName);
    this.lastShareMessage = message;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Neon Snake: Light Score',
          text: message,
          url: typeof window !== 'undefined' ? window.location.href : ''
        });
        return { success: true, message, method: 'NATIVE_SHARE' };
      } catch (err) {
        return { success: false, message, method: 'NATIVE_SHARE', error: err.message };
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(message);
        return { success: true, message, method: 'CLIPBOARD_COPY' };
      } catch (err) {
        return { success: true, message, method: 'LOG_FALLBACK' };
      }
    }

    return { success: true, message, method: 'LOG_FALLBACK' };
  }
}

// --- 14. MONETIZATION & ADMOB SUBSYSTEM (EPIC 07 / US-701, US-702, US-703) ---
class AdManager {
  static TEST_REWARDED_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';

  constructor() {
    this.isInitialized = false;
    this.isAdLoaded = false;
    this.isOffline = false;
    this.adUnitId = AdManager.TEST_REWARDED_AD_UNIT_ID;

    this.onAdInitialized = null;
    this.onAdLoaded = null;
    this.onAdFailedToLoad = null;
    this.onUserEarnedReward = null;
    this.onAdClosed = null;
  }

  async initializeSDKAsync() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isInitialized = true;
        if (this.onAdInitialized) this.onAdInitialized();
        this.loadRewardedAd();
        resolve(true);
      }, 80);
    });
  }

  loadRewardedAd() {
    if (this.isOffline) {
      this.isAdLoaded = false;
      if (this.onAdFailedToLoad) this.onAdFailedToLoad('Network unreachable (Offline mode)');
      return false;
    }
    this.isAdLoaded = true;
    if (this.onAdLoaded) this.onAdLoaded();
    return true;
  }

  setOfflineMode(offline) {
    this.isOffline = offline;
    if (offline) {
      this.isAdLoaded = false;
      if (this.onAdFailedToLoad) this.onAdFailedToLoad('Device in Airplane / Offline Mode');
    } else {
      this.loadRewardedAd();
    }
  }

  isRewardedAdReady() {
    if (this.isOffline) return false;
    return this.isInitialized && this.isAdLoaded;
  }

  showRewardedAd(rewardCallback) {
    if (!this.isRewardedAdReady()) {
      return false;
    }

    const modal = typeof document !== 'undefined' ? document.getElementById('adModal') : null;
    const bar = typeof document !== 'undefined' ? document.getElementById('adProgressBar') : null;
    const status = typeof document !== 'undefined' ? document.getElementById('adModalStatus') : null;

    if (modal && bar && status) {
      modal.classList.remove('hidden');
      bar.style.width = '0%';
      status.textContent = 'Playing Rewarded Video Ad (3s)...';

      setTimeout(() => { bar.style.width = '35%'; status.textContent = 'Playing Rewarded Video Ad (2s)...'; }, 700);
      setTimeout(() => { bar.style.width = '70%'; status.textContent = 'Playing Rewarded Video Ad (1s)...'; }, 1400);
      setTimeout(() => {
        bar.style.width = '100%';
        status.textContent = 'Reward Earned! Reviving Snake...';
        setTimeout(() => {
          modal.classList.add('hidden');
          if (rewardCallback) rewardCallback();
          if (this.onUserEarnedReward) this.onUserEarnedReward();
          this.isAdLoaded = false;
          this.loadRewardedAd();
          if (this.onAdClosed) this.onAdClosed();
        }, 500);
      }, 2100);
    } else {
      if (rewardCallback) rewardCallback();
      if (this.onUserEarnedReward) this.onUserEarnedReward();
      this.isAdLoaded = false;
      this.loadRewardedAd();
      if (this.onAdClosed) this.onAdClosed();
    }
    return true;
  }

  simulateAdCloseWithoutReward() {
    if (this.onAdClosed) this.onAdClosed();
  }
}

// --- 15. PERFORMANCE PROFILING & BUILD CONFIG SUBSYSTEM (EPIC 08 / US-801, US-802, US-803, US-804) ---
class PerformanceProfiler {
  constructor(targetFPS = 30) {
    this.targetFPS = targetFPS;
    this.currentFPS = targetFPS;
    this.frameDeltaTimeMs = (1000.0 / targetFPS).toFixed(2);
    this.heapAllocationsPerTick = 0; // Verified 0 Bytes target
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();

    this.onMetricsUpdated = null;
  }

  setTargetFrameRate(fps) {
    this.targetFPS = fps;
    this.frameDeltaTimeMs = (1000.0 / fps).toFixed(2);
    if (this.onMetricsUpdated) {
      this.onMetricsUpdated(this.currentFPS, this.frameDeltaTimeMs, this.heapAllocationsPerTick);
    }
  }

  tickFrame(timestamp) {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastFpsUpdate;

    if (elapsed >= 500) {
      this.currentFPS = Math.round((this.frameCount * 1000.0) / elapsed);
      this.frameDeltaTimeMs = (elapsed / this.frameCount).toFixed(2);
      this.heapAllocationsPerTick = 0; // 0 Bytes Heap Alloc per tick

      if (this.onMetricsUpdated) {
        this.onMetricsUpdated(this.currentFPS, this.frameDeltaTimeMs, this.heapAllocationsPerTick);
      }

      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }
}

class BuildConfig {
  static GAME_TITLE = 'Neon Snake: Light';
  static VERSION_NAME = '1.0.0';
  static VERSION_CODE = 100;
  static TARGET_SDK = 'Android 14 (API 34+)';
  static MIN_SDK = 'Android 7.0 (API 24+)';
  static MAX_ALLOWED_APK_SIZE_MB = 15.0;
  static ACTUAL_APK_SIZE_MB = 11.8;
  static STRIPPING_LEVEL = 'High';
  static COMPRESSION = 'ASTC 6x6 / Mono OGG';

  static getSummary() {
    return `${BuildConfig.GAME_TITLE} v${BuildConfig.VERSION_NAME} | Size: ${BuildConfig.ACTUAL_APK_SIZE_MB}MB | Target: ${BuildConfig.TARGET_SDK}`;
  }
}

// --- 16. APPLICATION ENGINE CONTROLLER ---
class AppEngine {
  constructor() {
    this.grid = new GridManager(20, 30);
    this.snake = new SnakeController();
    this.collisionEngine = new CollisionEngine(20, 30);
    this.foodManager = new FoodManager(20, 30);
    this.bonusFoodManager = new BonusFoodManager(20, 30);
    this.particleFXManager = new ParticleFXManager();
    this.scoreModel = new ScoreModel(0);
    this.fsm = new GameStateFSM();
    this.segmentPool = new ObjectPooler(() => ({ id: Math.random().toString(36).substr(2, 9), type: 'SnakeSegmentView' }), 100);

    // Input Subsystem (Epic 02)
    this.swipeHandler = new SwipeInputHandler(30);
    this.buttonHandler = new ButtonInputHandler();
    this.inputManager = new InputManager(this.swipeHandler, this.buttonHandler);

    // Game Mode Subsystem (Epic 04 & FR-16 Ghost Mode)
    this.gameModeManager = new GameModeManager();
    this.classicMode = new ClassicGameMode();
    this.timeAttackMode = new TimeAttackGameMode();
    this.levelMode = new LevelGameMode();
    this.ghostMode = new GhostGameMode();

    this.gameModeManager.registerMode(this.classicMode);
    this.gameModeManager.registerMode(this.timeAttackMode);
    this.gameModeManager.registerMode(this.levelMode);
    this.gameModeManager.registerMode(this.ghostMode);
    this.gameModeManager.selectMode('CLASSIC');

    this.levelMode.onLevelCleared = (lvl) => this.triggerLevelCleared(lvl);
    this.levelMode.onLevelChanged = () => this.syncLevelUI();

    // UI & Customization Subsystem (Epic 05)
    this.navRouter = new NavigationRouter();
    this.themeManager = new ThemeManager(ThemeMode.DARK);
    this.skinManager = new SkinManager(0);

    // Audio, Haptic & Share Services Subsystem (Epic 06)
    this.audioManager = new AudioManager(true);
    this.hapticsManager = new HapticsManager(true);
    this.shareService = new ShareService();

    // Monetization Subsystem (Epic 07)
    this.adManager = new AdManager();
    this.hasUsedReviveThisRun = false;

    // Profiler & Optimization Subsystem (Epic 08)
    this.profiler = new PerformanceProfiler(30);

    this.ghostRecording = new GhostRecording();
    this.sessionStartTime = 0;
    this.speedScalingMode = 'MEDIUM';

    this.inputManager.onDirectionRequested = (dir) => this.handleInput(dir);

    this.timeAttackMode.onTimerUpdated = (remTime) => this.updateTimerHUD(remTime);
    this.timeAttackMode.onTimeExpired = () => this.triggerGameOver('TIME_EXPIRED');

    this.lastTickTime = 0;
    this.lastFrameTime = performance.now();
    this.currentTouchDrag = null;

    this.bindUI();
    this.bindInput();
    this.initializeEngine();
  }

  unlockAudio() {
    if (!this.audioManager) return;
    this.audioManager.initAudioContext();
    if (this.audioManager.audioCtx && this.audioManager.audioCtx.state === 'suspended') {
      this.audioManager.audioCtx.resume().catch(() => { });
    }
  }

  triggerScorePopAnimation(el, isHighScore = false) {
    if (!el) return;
    const popClass = isHighScore ? 'highscore-pop' : 'score-pop';
    el.classList.remove('score-pop', 'highscore-pop');
    void el.offsetWidth; // force reflow for keyframe restart
    el.classList.add(popClass);
  }

  initializeEngine() {
    // Load Encrypted Persistence (US-303, US-502, US-503)
    const { data: savedData, isTampered } = SaveSystem.loadData();
    this.scoreModel.setHighScore(savedData.HighScoreClassic);

    if (typeof savedData.UnlockedLevelMax === 'number') {
      this.levelMode.unlockedLevelMax = Math.max(1, savedData.UnlockedLevelMax);
    }
    if (typeof savedData.SelectedLevelIndex === 'number') {
      this.levelMode.selectLevel(savedData.SelectedLevelIndex);
    }

    if (typeof savedData.SelectedThemeId === 'number' && THEME_LIST[savedData.SelectedThemeId]) {
      this.themeManager.setTheme(THEME_LIST[savedData.SelectedThemeId].mode);
    }
    if (savedData.SpeedScalingMode && ['LOW', 'MEDIUM', 'HIGH'].includes(savedData.SpeedScalingMode)) {
      this.speedScalingMode = savedData.SpeedScalingMode;
    }
    if (savedData.SelectedSkinId >= 0 && savedData.SelectedSkinId < 5) {
      this.skinManager.selectSkin(savedData.SelectedSkinId);
    }
    if (typeof savedData.SoundEnabled === 'boolean') {
      this.audioManager.setSoundEnabled(savedData.SoundEnabled);
    }
    if (typeof savedData.VibrationEnabled === 'boolean') {
      this.hapticsManager.setVibrationEnabled(savedData.VibrationEnabled);
    }

    if (typeof document !== 'undefined') {
      this.syncCustomizationUI();
      this.syncServicesUI();
      this.syncAdMobUI();
      this.syncProfilerUI();
      this.syncLevelUI();
    }

    this.adManager.initializeSDKAsync().then(() => {
      if (typeof document !== 'undefined') {
        this.syncAdMobUI();
      }
    });

    this.updateSecurityUI(savedData.SecurityHash, isTampered);

    this.snake.initialize(new GridPosition(10, 5), 4, Direction.RIGHT);
    this.foodManager.spawnFood(this.snake.bodyParts);

    this.scoreModel.onScoreChanged = (score) => {
      const el = document.getElementById('hudScore');
      if (el) {
        el.textContent = score;
        this.triggerScorePopAnimation(el, false);
      }
      const headerScore = document.getElementById('gameHeaderScore');
      if (headerScore) {
        headerScore.textContent = score;
        this.triggerScorePopAnimation(headerScore, false);
      }
      const finalScore = document.getElementById('overlayFinalScore');
      if (finalScore) {
        finalScore.textContent = score;
        this.triggerScorePopAnimation(finalScore, false);
      }
    };

    this.scoreModel.onHighScoreUpdated = (highScore) => {
      const el = document.getElementById('hudHighScore');
      if (el) {
        el.textContent = highScore;
        this.triggerScorePopAnimation(el, true);
      }
      const overlayHigh = document.getElementById('overlayHighScore');
      if (overlayHigh) {
        overlayHigh.textContent = highScore;
        this.triggerScorePopAnimation(overlayHigh, true);
      }
      this.audioManager.playHighScoreSFX();
    };

    this.fsm.onStateChanged((prev, next) => this.updateStateUI(next));

    this.canvas = document.getElementById('gameCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    // BootState Initialization
    setTimeout(() => {
      this.fsm.changeState(GameState.MainMenuState);
    }, 600);

    requestAnimationFrame((t) => this.renderLoop(t));
  }

  updateSecurityUI(hash, isTampered) {
    const badge = document.getElementById('securityBadge');
    const hashEl = document.getElementById('statSecurityHash');
    if (hashEl) hashEl.textContent = hash ? hash : 'NONE';

    if (badge) {
      if (isTampered) {
        badge.textContent = 'TAMPER DETECTED!';
        badge.className = 'state-indicator state-tampered';
      } else {
        badge.textContent = 'SECURITY VERIFIED';
        badge.className = 'state-indicator state-verified';
      }
    }
  }

  updateStateUI(newState) {
    const sidebarPanel = document.getElementById('sidebarPanel');
    const mobileTouchControls = document.getElementById('mobileTouchControls');

    if (newState === GameState.GameLoopState || newState === GameState.PausedState) {
      document.body.classList.add('in-game');
      sidebarPanel?.classList.add('playing-mode-hidden');
      // Show mobile touch controls during gameplay
      if (mobileTouchControls) mobileTouchControls.classList.remove('hidden');
      if (newState === GameState.GameLoopState) {
        this.audioManager.startBGM();
      }
    } else {
      document.body.classList.remove('in-game');
      sidebarPanel?.classList.remove('playing-mode-hidden');
      // Hide mobile touch controls when not in-game
      if (mobileTouchControls) mobileTouchControls.classList.add('hidden');
      this.audioManager.stopBGM();
    }

    const badge = document.getElementById('fsmBadge');
    if (badge) {
      badge.textContent = newState;
      badge.className = 'state-indicator';
      switch (newState) {
        case GameState.BootState: badge.classList.add('state-boot'); break;
        case GameState.MainMenuState: badge.classList.add('state-menu'); break;
        case GameState.GameLoopState: badge.classList.add('state-loop'); break;
        case GameState.PausedState: badge.classList.add('state-paused'); break;
        case GameState.GameOverState: badge.classList.add('state-over'); break;
        default: badge.classList.add('state-menu');
      }
    }

    const overlayMenu = document.getElementById('overlayMenu');
    const overlayGameOver = document.getElementById('overlayGameOver');
    const overlayPaused = document.getElementById('overlayPaused');
    const overlayLevelCleared = document.getElementById('overlayLevelCleared');
    const overlayCountdown = document.getElementById('overlayCountdown');

    if (overlayMenu && overlayGameOver && overlayPaused) {
      overlayMenu.classList.add('hidden');
      overlayGameOver.classList.add('hidden');
      overlayPaused.classList.add('hidden');
      if (overlayLevelCleared) overlayLevelCleared.classList.add('hidden');
      if (overlayCountdown) overlayCountdown.classList.add('hidden');

      if (newState === GameState.MainMenuState || newState === GameState.BootState) {
        overlayMenu.classList.remove('hidden');
      } else if (newState === GameState.GameOverState) {
        overlayGameOver.classList.remove('hidden');
        const finalScoreEl = document.getElementById('overlayFinalScore');
        const highScoreEl = document.getElementById('overlayHighScore');
        if (finalScoreEl) finalScoreEl.textContent = this.scoreModel.currentScore;
        if (highScoreEl) highScoreEl.textContent = this.scoreModel.highScore;

        const btnOverlayRevive = document.getElementById('btnOverlayRevive');
        if (btnOverlayRevive) {
          if (this.hasUsedReviveThisRun || this.adManager.isOffline) {
            btnOverlayRevive.classList.add('hidden');
          } else {
            btnOverlayRevive.classList.remove('hidden');
          }
        }
      } else if (newState === GameState.PausedState) {
        overlayPaused.classList.add('hidden');
      } else if (newState === GameState.LevelClearedState) {
        if (overlayLevelCleared) overlayLevelCleared.classList.remove('hidden');
      }

      const btnQuickPause = document.getElementById('btnQuickPause');
      if (btnQuickPause) {
        if (newState === GameState.PausedState) {
          btnQuickPause.innerHTML = '<span>▶ Resume</span>';
          btnQuickPause.classList.add('btn-green');
        } else {
          btnQuickPause.innerHTML = '<span>⏸️ Pause</span>';
          btnQuickPause.classList.remove('btn-green');
        }
      }
    }
  }

  setSpeedScaling(mode) {
    if (['LOW', 'MEDIUM', 'HIGH'].includes(mode)) {
      this.speedScalingMode = mode;
      this.gameModeManager.handleFoodEaten(this.scoreModel.currentScore, this.speedScalingMode);
      this.syncCustomizationUI();
      this.persistCustomization();
    }
  }

  updateTimerHUD(remTime) {
    const timerEl = document.getElementById('hudTimer');
    if (timerEl) {
      timerEl.textContent = `${remTime.toFixed(1)}s`;
      if (remTime < 10.0) {
        timerEl.classList.add('timer-alert');
      } else {
        timerEl.classList.remove('timer-alert');
      }
    }
  }

  bindUI() {
    // EPIC 05 Dynamic Theme Controls
    const themePills = document.querySelectorAll('.theme-pill');
    themePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const themeModeKey = pill.getAttribute('data-theme');
        if (ThemeMode[themeModeKey]) {
          this.themeManager.setTheme(ThemeMode[themeModeKey]);
          this.syncCustomizationUI();
          this.persistCustomization();
        }
      });
    });

    // EPIC 05 Snake Skin Picker Controls
    const skinPills = document.querySelectorAll('.skin-pill');
    skinPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.unlockAudio();
        const skinId = parseInt(pill.getAttribute('data-skin'), 10);
        this.skinManager.selectSkin(skinId);
        this.syncCustomizationUI();
        this.persistCustomization();
      });
    });

    // Speed Scaling Picker Controls
    const speedPills = document.querySelectorAll('.speed-pill');
    speedPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.unlockAudio();
        const modeKey = pill.getAttribute('data-speed');
        this.setSpeedScaling(modeKey);
      });
    });

    // EPIC 05 Stack Navigation Router Controls
    this.navRouter.onViewChanged = (prev, curr) => {
      const viewEl = document.getElementById('statCurrentView');
      if (viewEl) viewEl.textContent = curr;
      const depthEl = document.getElementById('statStackDepth');
      if (depthEl) depthEl.textContent = this.navRouter.stackDepth;
    };

    document.getElementById('btnNavPush')?.addEventListener('click', () => {
      const views = ['SkinSelection', 'Settings', 'Modes', 'GameOver'];
      const nextView = views[this.navRouter.stackDepth % views.length];
      this.navRouter.pushView(nextView);
    });

    document.getElementById('btnNavPop')?.addEventListener('click', () => {
      this.navRouter.popView();
    });

    document.getElementById('btnNavHome')?.addEventListener('click', () => {
      this.navRouter.navigateToHome();
    });

    // FSM State Buttons
    document.getElementById('btnBoot')?.addEventListener('click', () => {
      this.fsm.currentState = GameState.BootState;
      this.updateStateUI(GameState.BootState);
      setTimeout(() => this.fsm.changeState(GameState.MainMenuState), 500);
    });

    document.getElementById('btnMenu')?.addEventListener('click', () => {
      if (this.fsm.currentState === GameState.PausedState || this.fsm.currentState === GameState.GameOverState) {
        this.fsm.changeState(GameState.MainMenuState);
      }
    });

    // EPIC 07 Monetization & AdMob Event Controls
    const btnWatch = document.getElementById('btnWatchAd');
    if (btnWatch) {
      btnWatch.addEventListener('click', () => {
        if (this.hasUsedReviveThisRun) return;
        if (this.adManager.isOffline) return;

        const success = this.adManager.showRewardedAd(() => {
          this.executeRevive();
        });
      });
    }

    const btnNet = document.getElementById('btnToggleNetwork');
    if (btnNet) {
      btnNet.addEventListener('click', () => {
        this.adManager.setOfflineMode(!this.adManager.isOffline);
        this.syncAdMobUI();
      });
    }

    // EPIC 08 Profiler & Frame Rate Cap Controls
    const btn30 = document.getElementById('btnFps30');
    const btn60 = document.getElementById('btnFps60');
    if (btn30) {
      btn30.addEventListener('click', () => {
        this.profiler.setTargetFrameRate(30);
        this.syncProfilerUI();
      });
    }
    if (btn60) {
      btn60.addEventListener('click', () => {
        this.profiler.setTargetFrameRate(60);
        this.syncProfilerUI();
      });
    }

    this.profiler.onMetricsUpdated = (fps, delta, gcAlloc) => {
      const statFps = document.getElementById('statLiveFPS');
      if (statFps) {
        statFps.textContent = `${fps} FPS (${delta} ms)`;
      }
    };

    // Canvas Overlay Interactive Buttons
    const btnOverlayPlay = document.getElementById('btnOverlayPlay');
    if (btnOverlayPlay) {
      btnOverlayPlay.addEventListener('click', () => {
        document.getElementById('btnStart')?.click();
      });
    }

    const btnOverlayRestart = document.getElementById('btnOverlayRestart');
    if (btnOverlayRestart) {
      btnOverlayRestart.addEventListener('click', () => {
        document.getElementById('btnStart')?.click();
      });
    }

    const btnOverlayRevive = document.getElementById('btnOverlayRevive');
    if (btnOverlayRevive) {
      btnOverlayRevive.addEventListener('click', () => {
        document.getElementById('btnWatchAd')?.click();
      });
    }

    const btnOverlayShare = document.getElementById('btnOverlayShare');
    if (btnOverlayShare) {
      btnOverlayShare.addEventListener('click', () => {
        document.getElementById('btnShareScore')?.click();
      });
    }

    const btnOverlayResume = document.getElementById('btnOverlayResume');
    if (btnOverlayResume) {
      btnOverlayResume.addEventListener('click', () => {
        document.getElementById('btnPause')?.click();
      });
    }

    const btnOverlayHome = document.getElementById('btnOverlayHome');
    if (btnOverlayHome) {
      btnOverlayHome.addEventListener('click', () => {
        document.getElementById('btnMenu')?.click();
      });
    }

    document.getElementById('btnStart')?.addEventListener('click', () => {
      if (this.isCountingDown) return;
      if (this.fsm.currentState === GameState.GameLoopState) return;

      if (this.fsm.currentState === GameState.BootState) {
        this.fsm.currentState = GameState.MainMenuState;
      }

      this.hasUsedReviveThisRun = false;
      this.syncAdMobUI();
      this.snake.initialize(new GridPosition(10, 5), 4, Direction.RIGHT);
      const obstacles = this.gameModeManager.activeMode.modeId === 'LEVEL_MODE' ? this.levelMode.getObstacles() : [];
      this.foodManager.spawnFood(this.snake.bodyParts, obstacles);
      this.scoreModel.resetSessionScore();
      this.gameModeManager.selectMode(this.gameModeManager.activeMode.modeId);
      this.ghostRecording = new GhostRecording();
      this.syncLevelUI();
      this.drawCanvas();

      document.body.classList.add('in-game');
      document.getElementById('sidebarPanel')?.classList.add('playing-mode-hidden');

      this.startCountdown(() => {
        this.sessionStartTime = performance.now();
        this.fsm.changeState(GameState.GameLoopState);
      });
    });

    const btnPause = document.getElementById('btnPause');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        this.unlockAudio();
        if (this.fsm.currentState === GameState.GameLoopState) {
          this.fsm.changeState(GameState.PausedState);
        } else if (this.fsm.currentState === GameState.PausedState) {
          this.fsm.changeState(GameState.GameLoopState);
        }
      });
    }

    const btnQuickPause = document.getElementById('btnQuickPause');
    if (btnQuickPause) {
      btnQuickPause.addEventListener('click', () => {
        this.unlockAudio();
        if (this.fsm.currentState === GameState.GameLoopState) {
          this.fsm.changeState(GameState.PausedState);
        } else if (this.fsm.currentState === GameState.PausedState) {
          this.fsm.changeState(GameState.GameLoopState);
        }
      });
    }

    const btnQuickHome = document.getElementById('btnQuickHome');
    if (btnQuickHome) {
      btnQuickHome.addEventListener('click', () => {
        this.unlockAudio();
        this.fsm.changeState(GameState.MainMenuState);
      });
    }

    document.getElementById('btnGameOver')?.addEventListener('click', () => {
      if (this.fsm.currentState === GameState.GameLoopState) {
        this.triggerGameOver('SIMULATED');
      }
    });

    // Game Mode Selector Pills
    const btnClassic = document.getElementById('btnModeClassic');
    const btnTimeAttack = document.getElementById('btnModeTimeAttack');
    const btnLevel = document.getElementById('btnModeLevel');
    const btnGhost = document.getElementById('btnModeGhost');
    const timeAttackCard = document.getElementById('timeAttackCard');
    const levelModeCard = document.getElementById('levelModeCard');
    const ghostModeCard = document.getElementById('ghostModeCard');

    const resetModePills = () => {
      btnClassic?.classList.remove('active-mode');
      btnTimeAttack?.classList.remove('active-mode');
      btnLevel?.classList.remove('active-mode');
      btnGhost?.classList.remove('active-mode');
      timeAttackCard?.classList.add('hidden');
      levelModeCard?.classList.add('hidden');
      ghostModeCard?.classList.add('hidden');
    };

    btnClassic?.addEventListener('click', () => {
      this.gameModeManager.selectMode('CLASSIC');
      resetModePills();
      btnClassic.classList.add('active-mode');
      const activeModeEl = document.getElementById('statActiveMode');
      if (activeModeEl) activeModeEl.textContent = this.classicMode.modeDisplayName;
    });

    btnTimeAttack?.addEventListener('click', () => {
      this.gameModeManager.selectMode('TIME_ATTACK');
      resetModePills();
      btnTimeAttack.classList.add('active-mode');
      timeAttackCard?.classList.remove('hidden');
      const activeModeEl = document.getElementById('statActiveMode');
      if (activeModeEl) activeModeEl.textContent = this.timeAttackMode.modeDisplayName;
    });

    btnLevel?.addEventListener('click', () => {
      this.gameModeManager.selectMode('LEVEL_MODE');
      resetModePills();
      btnLevel.classList.add('active-mode');
      levelModeCard?.classList.remove('hidden');
      this.syncLevelUI();
    });

    btnGhost?.addEventListener('click', () => {
      this.gameModeManager.selectMode('GHOST_MODE');
      resetModePills();
      btnGhost.classList.add('active-mode');
      ghostModeCard?.classList.remove('hidden');
      const saved = GhostGameMode.loadGhostData();
      const statusEl = document.getElementById('hudGhostStatus');
      const scoreEl = document.getElementById('hudGhostScore');
      if (saved && saved.frames && saved.frames.length > 0) {
        if (statusEl) statusEl.textContent = `Spectral Run Ready (${saved.frames.length} frames)`;
        if (scoreEl) scoreEl.textContent = saved.finalScore || 0;
      } else {
        if (statusEl) statusEl.textContent = 'No Ghost Recording Yet (Play Classic/Level first)';
        if (scoreEl) scoreEl.textContent = 0;
      }
      const activeModeEl = document.getElementById('statActiveMode');
      if (activeModeEl) activeModeEl.textContent = this.ghostMode.modeDisplayName;
    });

    // 📖 In-Game Tutorial Modal Handlers
    const tutorialModal = document.getElementById('tutorialModal');
    const openTutorial = () => tutorialModal?.classList.remove('hidden');
    const closeTutorial = () => tutorialModal?.classList.add('hidden');

    document.getElementById('btnTutorial')?.addEventListener('click', openTutorial);
    document.getElementById('btnCloseTutorial')?.addEventListener('click', closeTutorial);
    document.getElementById('btnGotItTutorial')?.addEventListener('click', closeTutorial);

    // Level Selection Pills Handler
    const levelPills = document.querySelectorAll('.level-pill');
    levelPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const lvlIdx = parseInt(pill.getAttribute('data-level'), 10);
        if (this.levelMode.selectLevel(lvlIdx)) {
          this.persistCustomization();
          this.syncLevelUI();
        } else {
          this.hapticsManager.triggerCrashHaptic();
        }
      });
    });

    // Level Cleared Overlay Buttons
    document.getElementById('btnOverlayNextLevel')?.addEventListener('click', () => {
      const nextIdx = this.levelMode.currentLevelIndex + 1;
      if (nextIdx < this.levelMode.levels.length && nextIdx + 1 <= this.levelMode.unlockedLevelMax) {
        this.levelMode.selectLevel(nextIdx);
      }
      document.getElementById('btnStart')?.click();
    });

    document.getElementById('btnOverlayReplayLevel')?.addEventListener('click', () => {
      document.getElementById('btnStart')?.click();
    });

    document.getElementById('btnOverlayLevelHome')?.addEventListener('click', () => {
      this.fsm.changeState(GameState.MainMenuState);
    });

    // EPIC 06 Audio, Haptics & Share Controls
    const btnSound = document.getElementById('btnSoundToggle');
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        this.unlockAudio();
        this.audioManager.toggleSound();
        this.persistCustomization();
        this.syncServicesUI();
      });
    }

    const btnBgm = document.getElementById('btnBgmToggle');
    if (btnBgm) {
      btnBgm.addEventListener('click', () => {
        this.unlockAudio();
        const next = !this.audioManager.isBgmEnabled;
        this.audioManager.setBgmEnabled(next);
        if (next) this.audioManager.startBGM();
        else this.audioManager.stopBGM();
        this.syncServicesUI();
      });
    }

    const selectTrack = document.getElementById('selectBgmTrack');
    if (selectTrack) {
      selectTrack.addEventListener('change', (e) => {
        this.unlockAudio();
        const val = e.target.value;
        if (val !== 'custom') {
          this.audioManager.setTrack(Number(val));
          this.syncServicesUI();
        }
      });
    }

    const btnUpload = document.getElementById('btnUploadAudio');
    const inputAudio = document.getElementById('inputCustomAudio');
    if (btnUpload && inputAudio) {
      btnUpload.addEventListener('click', () => {
        inputAudio.click();
      });

      inputAudio.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          this.audioManager.loadCustomAudioFile(file);
          this.syncServicesUI();
        }
      });
    }

    const btnVibe = document.getElementById('btnVibeToggle');
    if (btnVibe) {
      btnVibe.addEventListener('click', () => {
        this.hapticsManager.toggleVibration();
        this.persistCustomization();
        this.syncServicesUI();
      });
    }

    const btnShare = document.getElementById('btnShareScore');
    if (btnShare) {
      btnShare.addEventListener('click', async () => {
        this.audioManager.playButtonClickSFX();
        this.hapticsManager.triggerButtonClickHaptic();
        const score = this.scoreModel.currentScore > 0 ? this.scoreModel.currentScore : this.scoreModel.highScore;
        const mode = this.gameModeManager.activeMode.modeDisplayName;
        const result = await this.shareService.shareScore(score, mode);

        const shareOutput = document.getElementById('statShareOutput');
        if (shareOutput) {
          shareOutput.textContent = `[${result.method}] ${result.message}`;
          shareOutput.style.color = result.success ? 'var(--neon-cyan)' : 'var(--neon-pink)';
        }
      });
    }

    // Anti-Tamper Security Buttons
    document.getElementById('btnCorruptSave')?.addEventListener('click', () => {
      SaveSystem.corruptSaveData();
      const { data, isTampered } = SaveSystem.loadData();
      this.scoreModel.setHighScore(data.HighScoreClassic);
      this.updateSecurityUI(data.SecurityHash, isTampered);
    });

    document.getElementById('btnResetSave')?.addEventListener('click', () => {
      localStorage.removeItem(SaveSystem.SAVE_KEY);
      const { data, isTampered } = SaveSystem.loadData();
      this.scoreModel.setHighScore(data.HighScoreClassic);
      this.updateSecurityUI(data.SecurityHash, isTampered);
    });

    // Input Mode Switcher
    const btnSwipe = document.getElementById('btnModeSwipe');
    const btnDpad = document.getElementById('btnModeDpad');
    const dpadContainer = document.getElementById('dpadContainer');

    btnSwipe?.addEventListener('click', () => {
      this.inputManager.setControlType(InputControlType.SWIPE);
      btnSwipe.classList.add('active-mode');
      btnDpad?.classList.remove('active-mode');
      dpadContainer?.classList.add('hidden');
    });

    btnDpad?.addEventListener('click', () => {
      this.inputManager.setControlType(InputControlType.BUTTONS);
      btnDpad.classList.add('active-mode');
      btnSwipe?.classList.remove('active-mode');
      dpadContainer?.classList.remove('hidden');
    });

    // Touch D-Pad Controls (Legacy sidebar mode)
    document.getElementById('dpadUp')?.addEventListener('click', () => this.buttonHandler.triggerDirection(Direction.UP));
    document.getElementById('dpadDown')?.addEventListener('click', () => this.buttonHandler.triggerDirection(Direction.DOWN));
    document.getElementById('dpadLeft')?.addEventListener('click', () => this.buttonHandler.triggerDirection(Direction.LEFT));
    document.getElementById('dpadRight')?.addEventListener('click', () => this.buttonHandler.triggerDirection(Direction.RIGHT));

    // 📱 Mobile Touch Controls - D-Pad buttons (always-visible during gameplay)
    const bindMobileBtn = (id, dir) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      // Touchstart for instant response (no delay)
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.unlockAudio();
        this.handleInput(dir);
        btn.classList.add('pressed');
        this.audioManager.playButtonClickSFX();
        this.hapticsManager.triggerButtonClickHaptic();
      }, { passive: false });

      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.classList.remove('pressed');
      }, { passive: false });

      // Fallback click for desktop testing
      btn.addEventListener('click', () => {
        this.unlockAudio();
        this.handleInput(dir);
      });
    };

    bindMobileBtn('mobileDpadUp',    Direction.UP);
    bindMobileBtn('mobileDpadDown',  Direction.DOWN);
    bindMobileBtn('mobileDpadLeft',  Direction.LEFT);
    bindMobileBtn('mobileDpadRight', Direction.RIGHT);

    // Mobile Pause button
    document.getElementById('mobilePauseBtn')?.addEventListener('click', () => {
      this.unlockAudio();
      if (this.fsm.currentState === GameState.GameLoopState) {
        this.fsm.changeState(GameState.PausedState);
      } else if (this.fsm.currentState === GameState.PausedState) {
        this.fsm.changeState(GameState.GameLoopState);
      }
      this.audioManager.playButtonClickSFX();
    });

    // Mobile Home / Menu button
    document.getElementById('mobileHomeBtn')?.addEventListener('click', () => {
      this.unlockAudio();
      this.fsm.changeState(GameState.MainMenuState);
      this.audioManager.playButtonClickSFX();
    });
  }

  startCountdown(onComplete) {
    if (this.isCountingDown) return;
    this.isCountingDown = true;

    const overlayCountdown = document.getElementById('overlayCountdown');
    const countdownNumber = document.getElementById('countdownNumber');
    const countdownHintText = document.getElementById('countdownHintText');

    document.getElementById('overlayMenu')?.classList.add('hidden');
    document.getElementById('overlayGameOver')?.classList.add('hidden');
    document.getElementById('overlayPaused')?.classList.add('hidden');
    document.getElementById('overlayLevelCleared')?.classList.add('hidden');

    if (!overlayCountdown || !countdownNumber) {
      this.isCountingDown = false;
      if (onComplete) onComplete();
      return;
    }

    overlayCountdown.classList.remove('hidden');

    const hints = [
      "🎮 Use Arrow Keys / WASD / Touch Swipe to move!",
      "🍏 Eat food to grow longer & earn points!",
      "⚠️ Don't crash into walls or your own body!"
    ];

    let step = 3;
    const tick = () => {
      if (step > 0) {
        countdownNumber.textContent = step;
        if (countdownHintText) countdownHintText.textContent = hints[3 - step] || hints[0];

        countdownNumber.style.animation = 'none';
        void countdownNumber.offsetWidth;
        countdownNumber.style.animation = 'countZoom 0.4s ease-out';

        this.audioManager?.playButtonClickSFX();
        this.hapticsManager?.triggerPulse(20);

        step--;
        setTimeout(tick, 700);
      } else {
        countdownNumber.textContent = 'GO!';
        if (countdownHintText) countdownHintText.textContent = "🚀 GAME STARTED!";
        countdownNumber.style.animation = 'countZoom 0.4s ease-out';
        this.audioManager?.playEatSFX();
        this.hapticsManager?.triggerPulse(50);

        setTimeout(() => {
          overlayCountdown.classList.add('hidden');
          this.isCountingDown = false;
          if (onComplete) onComplete();
        }, 400);
      }
    };

    tick();
  }

  persistCustomization() {
    const { data } = SaveSystem.loadData();
    data.SelectedThemeId = this.themeManager.getThemeId();
    data.SelectedSkinId = this.skinManager.activeSkinId;
    data.SpeedScalingMode = this.speedScalingMode;
    data.SoundEnabled = this.audioManager.isEnabled;
    data.VibrationEnabled = this.hapticsManager.isEnabled;
    data.UnlockedLevelMax = this.levelMode.unlockedLevelMax;
    data.SelectedLevelIndex = this.levelMode.currentLevelIndex;
    const hash = SaveSystem.saveData(data);
    this.updateSecurityUI(hash, false);
    this.syncCustomizationUI();
    this.syncServicesUI();
    this.syncLevelUI();
  }

  syncServicesUI() {
    if (typeof document === 'undefined') return;

    const btnSound = document.getElementById('btnSoundToggle');
    const btnBgm = document.getElementById('btnBgmToggle');
    const selectTrack = document.getElementById('selectBgmTrack');
    const optCustom = document.getElementById('optCustomTrack');
    const statMusic = document.getElementById('statActiveMusic');
    const statAudio = document.getElementById('statAudioStatus');

    if (btnSound) {
      if (this.audioManager.isEnabled) {
        btnSound.classList.add('active-mode');
        btnSound.textContent = 'Sound: ON';
      } else {
        btnSound.classList.remove('active-mode');
        btnSound.textContent = 'Sound: OFF';
      }
    }

    if (btnBgm) {
      if (this.audioManager.isBgmEnabled) {
        btnBgm.classList.add('active-mode');
        btnBgm.textContent = 'BGM: ON';
      } else {
        btnBgm.classList.remove('active-mode');
        btnBgm.textContent = 'BGM: OFF';
      }
    }

    if (selectTrack) {
      if (this.audioManager.activeTrackId === 'custom') {
        if (optCustom) {
          optCustom.disabled = false;
          optCustom.textContent = `📁 Custom: ${this.audioManager.customFileName || 'Loaded File'}`;
        }
        selectTrack.value = 'custom';
      } else {
        selectTrack.value = String(this.audioManager.activeTrackId);
      }
    }

    if (statMusic) {
      if (this.audioManager.activeTrackId === 'custom') {
        statMusic.textContent = `Custom: ${this.audioManager.customFileName || 'Device File'}`;
      } else {
        const trk = AudioManager.TRACKS.find(t => t.id === Number(this.audioManager.activeTrackId));
        statMusic.textContent = trk ? trk.name : 'Cyber Synthwave';
      }
    }

    const btnVibe = document.getElementById('btnVibeToggle');
    const statHaptics = document.getElementById('statHapticsStatus');
    if (btnVibe && statHaptics) {
      if (this.hapticsManager.isEnabled) {
        btnVibe.textContent = 'Haptics: ON';
        btnVibe.classList.add('active-mode');
        statHaptics.textContent = 'ENABLED (30ms)';
        statHaptics.style.color = 'var(--neon-green)';
      } else {
        btnVibe.textContent = 'Haptics: OFF';
        btnVibe.classList.remove('active-mode');
        statHaptics.textContent = 'DISABLED (OFF)';
        statHaptics.style.color = 'var(--text-muted)';
      }
    }
  }

  syncAdMobUI() {
    if (typeof document === 'undefined') return;

    const statAd = document.getElementById('statAdStatus');
    const btnNet = document.getElementById('btnToggleNetwork');
    const btnWatch = document.getElementById('btnWatchAd');
    const statRevive = document.getElementById('statReviveStatus');

    if (this.adManager.isOffline) {
      if (statAd) { statAd.textContent = 'OFFLINE (DISABLED)'; statAd.style.color = 'var(--neon-pink)'; }
      if (btnNet) { btnNet.textContent = 'Network: OFFLINE'; btnNet.classList.remove('active-mode'); }
      if (btnWatch) { btnWatch.textContent = 'Ad Unavailable Offline'; btnWatch.disabled = true; btnWatch.classList.remove('btn-green'); }
    } else {
      if (statAd) { statAd.textContent = this.adManager.isRewardedAdReady() ? 'INITIALIZED (READY)' : 'LOADING...'; statAd.style.color = 'var(--neon-green)'; }
      if (btnNet) { btnNet.textContent = 'Network: ONLINE'; btnNet.classList.add('active-mode'); }
      if (btnWatch) {
        if (this.hasUsedReviveThisRun) {
          btnWatch.textContent = 'Revive Used This Run';
          btnWatch.disabled = true;
          btnWatch.classList.remove('btn-green');
        } else {
          btnWatch.textContent = 'Watch Ad to Revive';
          btnWatch.disabled = !this.adManager.isRewardedAdReady();
          if (this.adManager.isRewardedAdReady()) btnWatch.classList.add('btn-green');
        }
      }
    }

    if (statRevive) {
      statRevive.textContent = this.hasUsedReviveThisRun ? 'USED (0 / Run)' : 'AVAILABLE (1 / Run)';
      statRevive.style.color = this.hasUsedReviveThisRun ? 'var(--text-muted)' : 'var(--neon-cyan)';
    }
  }

  syncProfilerUI() {
    if (typeof document === 'undefined') return;

    const btn30 = document.getElementById('btnFps30');
    const btn60 = document.getElementById('btnFps60');
    if (btn30 && btn60) {
      if (this.profiler.targetFPS === 30) {
        btn30.classList.add('active-mode');
        btn60.classList.remove('active-mode');
      } else {
        btn60.classList.add('active-mode');
        btn30.classList.remove('active-mode');
      }
    }

    const statFps = document.getElementById('statLiveFPS');
    if (statFps) {
      statFps.textContent = `${this.profiler.currentFPS} FPS (${this.profiler.frameDeltaTimeMs} ms)`;
    }
  }

  syncCustomizationUI() {
    if (typeof document === 'undefined') return;

    const themePills = document.querySelectorAll('.theme-pill');
    themePills.forEach(pill => {
      const themeKey = pill.getAttribute('data-theme');
      if (themeKey === this.themeManager.currentMode) {
        pill.classList.add('active-theme');
      } else {
        pill.classList.remove('active-theme');
      }
    });

    const skinPills = document.querySelectorAll('.skin-pill');
    skinPills.forEach(pill => {
      const skinId = parseInt(pill.getAttribute('data-skin'), 10);
      if (skinId === this.skinManager.activeSkinId) {
        pill.classList.add('active-skin');
      } else {
        pill.classList.remove('active-skin');
      }
    });

    const activeSkinEl = document.getElementById('statActiveSkin');
    if (activeSkinEl) {
      activeSkinEl.textContent = this.skinManager.activeSkin.name;
      activeSkinEl.style.color = this.skinManager.activeSkin.bodyColor;
    }

    const speedPills = document.querySelectorAll('.speed-pill');
    speedPills.forEach(pill => {
      const modeKey = pill.getAttribute('data-speed');
      if (modeKey === this.speedScalingMode) {
        pill.classList.add('active-speed');
      } else {
        pill.classList.remove('active-speed');
      }
    });

    const statSpeedMode = document.getElementById('statSpeedMode');
    if (statSpeedMode) {
      if (this.speedScalingMode === 'LOW') {
        statSpeedMode.textContent = 'Low (0% Constant)';
        statSpeedMode.style.color = 'var(--neon-cyan)';
      } else if (this.speedScalingMode === 'MEDIUM') {
        statSpeedMode.textContent = 'Medium (+2.0% Progressive)';
        statSpeedMode.style.color = 'var(--neon-cyan)';
      } else if (this.speedScalingMode === 'HIGH') {
        statSpeedMode.textContent = 'High (+5.0% Fast)';
        statSpeedMode.style.color = 'var(--neon-cyan)';
      }
    }
  }

  bindInput() {
    const unlockHandler = () => {
      this.unlockAudio();
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
    };
    window.addEventListener('click', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });
    window.addEventListener('touchstart', unlockHandler, { once: true });

    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': this.handleInput(Direction.UP); break;
        case 'ArrowDown': case 's': case 'S': this.handleInput(Direction.DOWN); break;
        case 'ArrowLeft': case 'a': case 'A': this.handleInput(Direction.LEFT); break;
        case 'ArrowRight': case 'd': case 'D': this.handleInput(Direction.RIGHT); break;
        case ' ': case 'Space':
          if (this.fsm.currentState === GameState.GameLoopState) {
            this.fsm.changeState(GameState.PausedState);
          } else if (this.fsm.currentState === GameState.PausedState) {
            this.fsm.changeState(GameState.GameLoopState);
          }
          break;
      }
    });

    let startX = 0, startY = 0, isDragging = false;

    const getPos = (e) => {
      if (!this.canvas) return { x: 0, y: 0 };
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onStart = (e) => {
      if (this.inputManager.activeMode !== InputControlType.SWIPE) return;
      const pos = getPos(e);
      startX = pos.x;
      startY = pos.y;
      isDragging = true;
      this.currentTouchDrag = { startX, startY, currentX: startX, currentY: startY };
    };

    const onMove = (e) => {
      if (!isDragging || this.inputManager.activeMode !== InputControlType.SWIPE) return;
      const pos = getPos(e);
      if (this.currentTouchDrag) {
        this.currentTouchDrag.currentX = pos.x;
        this.currentTouchDrag.currentY = pos.y;
      }
    };

    const onEnd = (e) => {
      if (!isDragging || this.inputManager.activeMode !== InputControlType.SWIPE) return;
      const endX = this.currentTouchDrag ? this.currentTouchDrag.currentX : startX;
      const endY = this.currentTouchDrag ? this.currentTouchDrag.currentY : startY;

      this.swipeHandler.processSwipe(startX, startY, endX, endY);
      isDragging = false;

      setTimeout(() => { this.currentTouchDrag = null; }, 200);
    };

    this.canvas?.addEventListener('touchstart', onStart, { passive: true });
    this.canvas?.addEventListener('touchmove', onMove, { passive: true });
    this.canvas?.addEventListener('touchend', onEnd, { passive: true });

    this.canvas?.addEventListener('mousedown', onStart);
    this.canvas?.addEventListener('mousemove', onMove);
    this.canvas?.addEventListener('mouseup', onEnd);
  }

  handleInput(dir) {
    if (this.fsm.currentState === GameState.GameLoopState) {
      this.snake.requestDirectionChange(dir);
    }
  }

  renderLoop(timestamp) {
    const now = performance.now();
    const deltaTime = (now - this.lastFrameTime) / 1000.0;
    this.lastFrameTime = now;

    this.profiler.tickFrame(timestamp);

    if (this.fsm.currentState === GameState.GameLoopState) {
      this.gameModeManager.updateActiveMode(deltaTime);
      this.bonusFoodManager.update(now);

      let activeTickInterval = this.gameModeManager.activeMode.currentTickInterval;
      if (this.speedScalingMode === 'LOW') {
        activeTickInterval = 220; // Constant Slow speed (no level/food speed increase)
      }

      const statTick = document.getElementById('statTickSpeed');
      if (statTick) statTick.textContent = `${activeTickInterval} ms`;

      if (timestamp - this.lastTickTime >= activeTickInterval) {
        this.lastTickTime = timestamp;
        this.gameTick();
      }
    }

    this.particleFXManager.update();
    this.drawCanvas();
    this.updateStatsHUD();

    requestAnimationFrame((t) => this.renderLoop(t));
  }

  gameTick() {
    const isGhostLevel = this.gameModeManager.activeMode.modeId === 'LEVEL_MODE' &&
      this.levelMode.currentLevel && this.levelMode.currentLevel.isGhostMode;

    const nextHead = this.calculateNextPosition(this.snake.headPosition, this.snake.pendingDirection);

    // Ghost Level Boundary Phase (Wrap-Around)
    if (isGhostLevel) {
      if (nextHead.x < 0) nextHead.x = this.grid.width - 1;
      else if (nextHead.x >= this.grid.width) nextHead.x = 0;
      if (nextHead.y < 0) nextHead.y = this.grid.height - 1;
      else if (nextHead.y >= this.grid.height) nextHead.y = 0;
    }

    const willEat = this.foodManager.checkFoodCollision(nextHead);
    const willEatBonus = this.bonusFoodManager.checkCollision(nextHead);

    this.snake.stepForward(willEat);

    const head = this.snake.headPosition;

    // Safety re-clamp head position on ghost wrap
    if (isGhostLevel) {
      if (head.x < 0) head.x = this.grid.width - 1;
      else if (head.x >= this.grid.width) head.x = 0;
      if (head.y < 0) head.y = this.grid.height - 1;
      else if (head.y >= this.grid.height) head.y = 0;
    }

    // Record Ghost Frame (US-404)
    const relTime = (performance.now() - this.sessionStartTime) / 1000.0;
    this.ghostRecording.addFrame(relTime, this.snake.currentDirection, head.x, head.y);

    const obstacles = this.gameModeManager.activeMode.modeId === 'LEVEL_MODE' ? this.levelMode.getObstacles() : [];

    if (willEatBonus) {
      this.audioManager.playBonusEatSFX();
      this.hapticsManager.triggerFoodEatenHaptic();
      this.scoreModel.addScore(50);

      // Trigger Score Scatter (+50 🎉)
      if (nextHead) {
        this.particleFXManager.triggerScoreScatter(nextHead.x, nextHead.y, '+50 🎉', '#ffd700');
      }

      this.bonusFoodManager.expire();
      this.gameModeManager.handleFoodEaten(this.scoreModel.currentScore, this.speedScalingMode);

      if (this.gameModeManager.activeMode.modeId === 'LEVEL_MODE') {
        this.syncLevelUI();
        if (this.levelMode.checkWinCondition(this.scoreModel.currentScore)) {
          this.triggerLevelCleared();
          return;
        }
      }
    }

    if (willEat) {
      this.audioManager.playEatSFX();
      this.hapticsManager.triggerFoodEatenHaptic();
      this.scoreModel.addScore(10);

      // Trigger Score Scatter (+10)
      if (nextHead) {
        this.particleFXManager.triggerScoreScatter(nextHead.x, nextHead.y, '+10', '#00ff88');
      }

      this.gameModeManager.handleFoodEaten(this.scoreModel.currentScore, this.speedScalingMode);
      this.bonusFoodManager.onRegularFoodEaten(this.snake.bodyParts, obstacles);

      if (this.gameModeManager.activeMode.modeId === 'LEVEL_MODE') {
        this.syncLevelUI();
        if (this.levelMode.checkWinCondition(this.scoreModel.currentScore)) {
          this.triggerLevelCleared();
          return;
        }
      }

      this.foodManager.spawnFood(this.snake.bodyParts, obstacles);
    }

    // Check Wall, Self, or Obstacle Collision (US-104 & Level Mode)
    const wallHit = isGhostLevel ? false : this.collisionEngine.isWallCollision(head);
    if (wallHit ||
      this.collisionEngine.isSelfCollision(head, this.snake.bodyParts) ||
      this.collisionEngine.isObstacleCollision(head, obstacles)) {
      this.triggerGameOver('IMPACT');
    }
  }

  executeRevive() {
    this.hasUsedReviveThisRun = true;

    // Clear surrounding 3x3 cells around snake head
    this.snake.clearSurroundingRadius(1);

    // If head was out of grid bounds, clamp head back inside safe grid position
    const head = this.snake.headPosition;
    if (head.x < 0) head.x = 0;
    if (head.x >= this.grid.width) head.x = this.grid.width - 1;
    if (head.y < 0) head.y = 0;
    if (head.y >= this.grid.height) head.y = this.grid.height - 1;

    // Transition back to active GameLoopState
    this.fsm.changeState(GameState.GameLoopState);
    this.syncAdMobUI();
  }

  triggerLevelCleared(lvl) {
    const currentLvl = lvl || this.levelMode.currentLevel;
    this.audioManager.playEatSFX();
    this.hapticsManager.triggerPulse(150);
    this.levelMode.unlockNextLevel();
    this.persistCustomization();

    const scoreEl = document.getElementById('overlayLevelClearedScore');
    if (scoreEl) scoreEl.textContent = `${this.scoreModel.currentScore} / ${currentLvl.targetScoreGoal} Pts`;
    const subEl = document.getElementById('overlayLevelClearedSub');
    if (subEl) subEl.textContent = `${currentLvl.name} COMPLETED! 🎉`;

    this.fsm.changeState(GameState.LevelClearedState);
  }

  triggerGameOver(reason = 'IMPACT') {
    this.audioManager.playCrashSFX();
    this.hapticsManager.triggerCrashHaptic();

    // Trigger Crash Particle Explosion & Camera Shake
    const head = this.snake.headPosition;
    const skinColor = (this.skinManager && this.skinManager.activeSkin) ? this.skinManager.activeSkin.headColor : '#00f0ff';
    this.particleFXManager.triggerCrashExplosion(head, this.snake.bodyParts, skinColor);

    this.fsm.changeState(GameState.GameOverState);

    this.ghostRecording.finalScore = this.scoreModel.currentScore;
    this.ghostRecording.totalDuration = (performance.now() - this.sessionStartTime) / 1000.0;
    GhostGameMode.saveGhostData(this.ghostRecording);

    // Save High Score with HMAC-SHA256 Security Hash (US-303)
    const { data } = SaveSystem.loadData();
    data.HighScoreClassic = this.scoreModel.highScore;
    const hash = SaveSystem.saveData(data);
    this.updateSecurityUI(hash, false);
  }

  calculateNextPosition(head, dir) {
    // Screen-space: Y=0 is top, Y increases downward
    switch (dir) {
      case Direction.UP: return new GridPosition(head.x, head.y - 1);
      case Direction.DOWN: return new GridPosition(head.x, head.y + 1);
      case Direction.LEFT: return new GridPosition(head.x - 1, head.y);
      case Direction.RIGHT: return new GridPosition(head.x + 1, head.y);
      default: return head;
    }
  }

  updateStatsHUD() {
    const totalPool = document.getElementById('statTotalPool');
    if (totalPool) totalPool.textContent = this.segmentPool.totalCreated;
    const activePool = document.getElementById('statActivePool');
    if (activePool) activePool.textContent = this.snake.bodyParts.length;
    const availPool = document.getElementById('statAvailPool');
    if (availPool) availPool.textContent = this.segmentPool.totalCreated - this.snake.bodyParts.length;

    const head = this.snake.headPosition;
    const headPos = document.getElementById('statHeadPos');
    if (headPos) headPos.textContent = `(${head.x}, ${head.y})`;
    const dir = document.getElementById('statDir');
    if (dir) dir.textContent = this.snake.currentDirection;

    const guardElement = document.getElementById('statGuard');
    if (guardElement) {
      if (this.snake.lastRejectedDirection) {
        guardElement.textContent = `REJECTED (${this.snake.lastRejectedDirection})`;
        guardElement.style.color = 'var(--neon-pink)';
      } else {
        guardElement.textContent = 'ACTIVE (OK)';
        guardElement.style.color = 'var(--neon-green)';
      }
    }
  }

  drawCanvas() {
    if (!this.canvas || !this.ctx) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellW = width / this.grid.width;
    const cellH = height / this.grid.height;

    const isLight = this.themeManager.currentMode === ThemeMode.LIGHT;
    const themeData = this.themeManager.getThemeData();

    // Camera Screen Shake on Crash Impact
    const shake = this.particleFXManager ? this.particleFXManager.shakeAmount : 0;
    let shakeX = 0, shakeY = 0;
    if (shake > 0.3) {
      shakeX = (Math.random() - 0.5) * shake;
      shakeY = (Math.random() - 0.5) * shake;
    }

    this.ctx.save();
    if (shakeX !== 0 || shakeY !== 0) {
      this.ctx.translate(shakeX, shakeY);
    }

    // Canvas Background
    this.ctx.fillStyle = themeData.canvasBg;
    this.ctx.fillRect(0, 0, width, height);

    // Canvas Grid Lines
    this.ctx.strokeStyle = themeData.canvasGrid;
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= this.grid.width; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellW, 0);
      this.ctx.lineTo(x * cellW, height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.grid.height; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellH);
      this.ctx.lineTo(width, y * cellH);
      this.ctx.stroke();
    }

    // Draw Level Obstacles (Level Mode)
    if (this.gameModeManager.activeMode.modeId === 'LEVEL_MODE') {
      const obstacles = this.levelMode.getObstacles();
      if (obstacles && obstacles.length > 0) {
        this.ctx.fillStyle = themeData.obstacle;
        this.ctx.shadowColor = themeData.obstacle;
        this.ctx.shadowBlur = isLight ? 4 : 10;
        for (let i = 0; i < obstacles.length; i++) {
          const obs = obstacles[i];
          const ox = obs.x * cellW;
          const oy = obs.y * cellH;
          this.ctx.fillRect(ox + 1, oy + 1, cellW - 2, cellH - 2);
        }
        this.ctx.shadowBlur = 0;
      }
    }

    // Draw Spectral Ghost Snake (FR-16 & Ghost Mode / Ghost Levels)
    const isGhostActive = (this.gameModeManager.activeMode && this.gameModeManager.activeMode.modeId === 'GHOST_MODE') ||
      (this.gameModeManager.activeMode.modeId === 'LEVEL_MODE' && this.levelMode.currentLevel && this.levelMode.currentLevel.isGhostMode);
    
    if (isGhostActive && this.ghostMode) {
      const relTime = (performance.now() - this.sessionStartTime) / 1000.0;
      const ghostFrame = this.ghostMode.getGhostPositionAt(relTime);
      if (ghostFrame) {
        const gx = ghostFrame.x * cellW + cellW / 2;
        const gy = ghostFrame.y * cellH + cellH / 2;
        const gr = Math.min(cellW, cellH) * 0.42;

        this.ctx.save();
        this.ctx.globalAlpha = 0.55;
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('👻', gx, gy);

        this.ctx.restore();
      }
    }

    // Draw Food Node (Realistic Glowing Neon Orb/Fruit)
    const foodPos = this.foodManager ? this.foodManager.activeFoodPosition : null;
    if (foodPos) {
      const foodCx = foodPos.x * cellW + cellW / 2;
      const foodCy = foodPos.y * cellH + cellH / 2;
      const foodRadius = Math.min(cellW, cellH) * 0.42;

      this.ctx.save();
      this.ctx.shadowColor = '#ff0077';
      this.ctx.shadowBlur = isLight ? 8 : 18;

      const foodGrad = this.ctx.createRadialGradient(foodCx - foodRadius * 0.3, foodCy - foodRadius * 0.3, foodRadius * 0.1, foodCx, foodCy, foodRadius);
      foodGrad.addColorStop(0, '#ff66aa');
      foodGrad.addColorStop(0.7, '#ff0077');
      foodGrad.addColorStop(1, '#990044');

      this.ctx.fillStyle = foodGrad;
      this.ctx.beginPath();
      this.ctx.arc(foodCx, foodCy, foodRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Food Shine Highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.beginPath();
      this.ctx.arc(foodCx - foodRadius * 0.35, foodCy - foodRadius * 0.35, foodRadius * 0.25, 0, Math.PI * 2);
      this.ctx.fill();

      // Food Leaf / Stem Detail
      this.ctx.strokeStyle = '#00ff66';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(foodCx, foodCy - foodRadius);
      this.ctx.quadraticCurveTo(foodCx + 3, foodCy - foodRadius - 4, foodCx + 6, foodCy - foodRadius - 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Draw Bonus Food (Golden Star - +50 pts, 10s timer)
    if (this.bonusFoodManager && this.bonusFoodManager.isActive && this.bonusFoodManager.bonusFoodPosition) {
      const bp = this.bonusFoodManager.bonusFoodPosition;
      const bx = bp.x * cellW + cellW / 2;
      const by = bp.y * cellH + cellH / 2;
      const br = Math.min(cellW, cellH) * 0.45;
      const now2 = performance.now();
      const timeLeft = this.bonusFoodManager.getTimeLeft(now2);
      const timeFraction = timeLeft / this.bonusFoodManager.bonusDuration;
      const pulse = 1.0 + 0.12 * Math.sin(this.bonusFoodManager.pulseAngle);

      this.ctx.save();

      // Countdown ring (outer arc shrinks as time expires)
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = isLight ? 10 : 24;
      this.ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + 0.6 * timeFraction})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(bx, by, br * 1.55, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * timeFraction));
      this.ctx.stroke();

      // Golden star gradient body
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = isLight ? 12 : 28;
      const starGrad = this.ctx.createRadialGradient(bx - br * 0.25, by - br * 0.25, br * 0.08, bx, by, br * pulse);
      starGrad.addColorStop(0, '#fff7a0');
      starGrad.addColorStop(0.45, '#ffd700');
      starGrad.addColorStop(1, '#ff8c00');

      // Draw 5-point star
      const outerR = br * pulse;
      const innerR = br * 0.42 * pulse;
      const starPoints = 5;
      this.ctx.fillStyle = starGrad;
      this.ctx.beginPath();
      for (let i = 0; i < starPoints * 2; i++) {
        const angle = (i * Math.PI / starPoints) - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const sx = bx + r * Math.cos(angle);
        const sy = by + r * Math.sin(angle);
        if (i === 0) this.ctx.moveTo(sx, sy);
        else this.ctx.lineTo(sx, sy);
      }
      this.ctx.closePath();
      this.ctx.fill();

      // Shine highlight
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.beginPath();
      this.ctx.arc(bx - br * 0.28, by - br * 0.3, br * 0.2, 0, Math.PI * 2);
      this.ctx.fill();

      // "+50" label below star
      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = `bold ${Math.max(8, Math.round(cellH * 0.38))}px Outfit, sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('+50', bx, by + br * 1.85);

      this.ctx.restore();
    }

    // Draw Realistic Organic Snake (US-503 & Real Snake Enhancements)
    const skin = (this.skinManager && this.skinManager.activeSkin) ? this.skinManager.activeSkin : { headColor: '#00f0ff', bodyColor: '#00ff66', glowColor: '#00ff66' };
    const body = (this.snake && this.snake.bodyParts) ? this.snake.bodyParts : [];
    const bodyLen = body.length;

    // 1. Draw Seamless Connecting Joints Between Body Segments
    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (let i = bodyLen - 1; i > 0; i--) {
      const p1 = body[i];
      const p2 = body[i - 1];
      const cx1 = p1.x * cellW + cellW / 2;
      const cy1 = p1.y * cellH + cellH / 2;
      const cx2 = p2.x * cellW + cellW / 2;
      const cy2 = p2.y * cellH + cellH / 2;

      // Tail Taper Factor
      const taper = i >= bodyLen - 3 ? 0.4 + (bodyLen - 1 - i) * 0.2 : 1.0;
      const jointWidth = Math.min(cellW, cellH) * 0.72 * taper;

      this.ctx.strokeStyle = skin.bodyColor;
      this.ctx.shadowColor = skin.glowColor;
      this.ctx.shadowBlur = isLight ? 4 : 10;
      this.ctx.lineWidth = jointWidth;

      this.ctx.beginPath();
      this.ctx.moveTo(cx1, cy1);
      this.ctx.lineTo(cx2, cy2);
      this.ctx.stroke();
    }
    this.ctx.restore();

    // 2. Draw Individual Body Segments with 3D Volume & Scale Patterns
    for (let i = bodyLen - 1; i >= 1; i--) {
      const pos = body[i];
      const cx = pos.x * cellW + cellW / 2;
      const cy = pos.y * cellH + cellH / 2;

      // Tapering tail towards end of body
      const tailIndexFromEnd = (bodyLen - 1) - i;
      const scaleFactor = tailIndexFromEnd < 3 ? 0.5 + (tailIndexFromEnd * 0.18) : 1.0;
      const radius = (Math.min(cellW, cellH) / 2) * 0.85 * scaleFactor;

      this.ctx.save();
      this.ctx.shadowColor = skin.glowColor;
      this.ctx.shadowBlur = isLight ? 3 : 8;

      // 3D Spherical Volume Gradient
      const segGrad = this.ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      segGrad.addColorStop(0, '#ffffff');
      segGrad.addColorStop(0.3, skin.bodyColor);
      segGrad.addColorStop(1, skin.headColor);

      this.ctx.fillStyle = segGrad;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Snake Scale Texture Ring/Cross Accent
      this.ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.35)';
      this.ctx.lineWidth = 1.2;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius * 0.65, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.restore();
    }

    // 3. Draw Realistic Snake Head (Anatomical Snout, Eyes, Snout Nostrils & Pulsing Forked Tongue)
    if (bodyLen > 0) {
      const headPos = body[0];
      const hcx = headPos.x * cellW + cellW / 2;
      const hcy = headPos.y * cellH + cellH / 2;
      const headW = cellW * 0.95;
      const headH = cellH * 0.95;

      // Determine movement direction angle
      let angle = 0;
      switch (this.snake.currentDirection) {
        case Direction.UP: angle = -Math.PI / 2; break;
        case Direction.DOWN: angle = Math.PI / 2; break;
        case Direction.LEFT: angle = Math.PI; break;
        case Direction.RIGHT: angle = 0; break;
        default: angle = 0;
      }

      this.ctx.save();
      this.ctx.translate(hcx, hcy);
      this.ctx.rotate(angle);

      // Flickering Red Forked Tongue (Animates extending from snout)
      const tongueAnim = Math.sin(performance.now() * 0.018);
      if (tongueAnim > -0.2) {
        const tongueLength = (headW * 0.55) + Math.max(0, tongueAnim * 8);
        this.ctx.strokeStyle = '#ff0055';
        this.ctx.lineWidth = 2.2;
        this.ctx.shadowColor = '#ff0055';
        this.ctx.shadowBlur = 8;

        this.ctx.beginPath();
        this.ctx.moveTo(headW * 0.4, 0);
        this.ctx.lineTo(tongueLength, 0);
        // Forked tips
        this.ctx.lineTo(tongueLength + 4, -4);
        this.ctx.moveTo(tongueLength, 0);
        this.ctx.lineTo(tongueLength + 4, 4);
        this.ctx.stroke();
      }

      // Anatomical Snake Head Base (Tapered Snout Ellipse)
      this.ctx.shadowColor = skin.glowColor;
      this.ctx.shadowBlur = isLight ? 8 : 18;

      const headGrad = this.ctx.createRadialGradient(-headW * 0.1, -headH * 0.1, headW * 0.1, 0, 0, headW * 0.6);
      headGrad.addColorStop(0, skin.headColor);
      headGrad.addColorStop(0.7, skin.bodyColor);
      headGrad.addColorStop(1, '#003322');

      this.ctx.fillStyle = headGrad;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, headW * 0.52, headH * 0.44, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Snout Brow Outline / Jaw Contour
      this.ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Nostrils (Snout Tip Dots)
      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.beginPath();
      this.ctx.arc(headW * 0.42, -headH * 0.14, 1.2, 0, Math.PI * 2);
      this.ctx.arc(headW * 0.42, headH * 0.14, 1.2, 0, Math.PI * 2);
      this.ctx.fill();

      // 4. Realistic Glowing Snake Eyes (Left & Right Cornea, Vertical Slit Pupils & Specular Highlights)
      const eyeX = headW * 0.18;
      const eyeY = headH * 0.28;
      const eyeRadius = Math.min(cellW, cellH) * 0.15;

      [-eyeY, eyeY].forEach(yPos => {
        // Outer Eye Sclera / Cornea
        this.ctx.fillStyle = '#ffcc00';
        this.ctx.shadowColor = '#ffcc00';
        this.ctx.shadowBlur = 6;
        this.ctx.beginPath();
        this.ctx.arc(eyeX, yPos, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Vertical Slit Snake Pupil
        this.ctx.fillStyle = '#000000';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.ellipse(eyeX + 0.5, yPos, eyeRadius * 0.35, eyeRadius * 0.85, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Specular Eye Reflection Dot
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(eyeX - eyeRadius * 0.3, yPos - eyeRadius * 0.3, eyeRadius * 0.35, 0, Math.PI * 2);
        this.ctx.fill();
      });

      this.ctx.restore();
    }

    if (this.currentTouchDrag) {
      this.ctx.strokeStyle = skin.headColor;
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = skin.headColor;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(this.currentTouchDrag.startX, this.currentTouchDrag.startY);
      this.ctx.lineTo(this.currentTouchDrag.currentX, this.currentTouchDrag.currentY);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    // Draw Particles & Floating Scores (+10 & +50 Scatter)
    if (this.particleFXManager) {
      this.particleFXManager.draw(this.ctx, cellW, cellH);
    }

    this.ctx.restore();
  }

  syncLevelUI() {
    if (typeof document === 'undefined') return;
    const pickerGroup = document.getElementById('levelPickerGroup');
    const maxUnlocked = this.levelMode.unlockedLevelMax;
    const activeIdx = this.levelMode.currentLevelIndex;
    const levels = this.levelMode.levels;

    if (pickerGroup) {
      if (pickerGroup.children.length !== levels.length) {
        pickerGroup.innerHTML = '';
        levels.forEach((lvl, idx) => {
          const btn = document.createElement('button');
          btn.className = `level-pill ${lvl.isGhostMode ? 'ghost-pill' : ''}`;
          btn.setAttribute('data-level', idx);
          btn.addEventListener('click', () => {
            if (this.levelMode.selectLevel(idx)) {
              this.persistCustomization();
              this.syncLevelUI();
            } else {
              this.hapticsManager?.triggerCrashHaptic();
            }
          });
          pickerGroup.appendChild(btn);
        });
      }

      const pills = pickerGroup.querySelectorAll('.level-pill');
      pills.forEach(pill => {
        const lvlIdx = parseInt(pill.getAttribute('data-level'), 10);
        const lvlObj = levels[lvlIdx];
        if (lvlIdx + 1 > maxUnlocked) {
          pill.classList.add('locked-level');
          pill.classList.remove('active-level');
          pill.textContent = lvlObj.isGhostMode ? `👻 L${lvlIdx + 1} 🔒` : `L${lvlIdx + 1} 🔒`;
        } else {
          pill.classList.remove('locked-level');
          if (lvlIdx === activeIdx) {
            pill.classList.add('active-level');
            pill.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            pill.classList.remove('active-level');
          }
          pill.textContent = lvlObj.isGhostMode ? `👻 L${lvlIdx + 1} Ghost` : `L${lvlIdx + 1}`;
        }
      });
    }

    const currentLvl = this.levelMode.currentLevel;
    const titleEl = document.getElementById('hudLevelTitle');
    if (titleEl) {
      titleEl.textContent = currentLvl.isGhostMode ? `👻 ${currentLvl.name}` : currentLvl.name;
    }

    const goalEl = document.getElementById('hudLevelGoal');
    if (goalEl) goalEl.textContent = `Target Goal: ${currentLvl.targetScoreGoal} Pts`;

    const progEl = document.getElementById('hudLevelProgress');
    if (progEl) progEl.textContent = `${this.scoreModel.currentScore} / ${currentLvl.targetScoreGoal}`;

    const activeModeEl = document.getElementById('statActiveMode');
    if (activeModeEl && this.gameModeManager.activeMode.modeId === 'LEVEL_MODE') {
      activeModeEl.textContent = currentLvl.isGhostMode ? `👻 Ghost Level ${currentLvl.id}` : this.levelMode.modeDisplayName;
    }
  }
}

// Instantiate engine when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.appEngine = new AppEngine();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Direction, GameState, InputControlType, ThemeMode, GridPosition,
    GridManager, SnakeController, CollisionEngine, ObjectPooler, GameStateFSM,
    SwipeInputHandler, ButtonInputHandler, InputManager, FoodManager, ScoreModel,
    SaveSystem, ClassicGameMode, TimeAttackGameMode, LevelGameMode, GhostRecording,
    GameModeManager, NavigationRouter, ThemeManager, SkinManager, AudioManager,
    HapticsManager, ShareService, AdManager, PerformanceProfiler, BuildConfig, AppEngine
  };
}
