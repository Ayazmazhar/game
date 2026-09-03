/* ==========================================================================
   NEON SNAKE: LIGHT - EPIC 04 QA AUTOMATED TEST SUITE (NUNIT EQUIVALENT)
   Coverage: US-401 (Framework), US-402 (Classic Speed Ramping), US-403 (Time Attack), US-404 (Ghost & Level)
   ========================================================================== */

// Utility Test Framework
class Assert {
  static isTrue(condition, message) {
    if (!condition) {
      throw new Error(`[ASSERT FAIL] Expected TRUE: ${message}`);
    }
  }

  static isFalse(condition, message) {
    if (condition) {
      throw new Error(`[ASSERT FAIL] Expected FALSE: ${message}`);
    }
  }

  static areEqual(expected, actual, message) {
    if (expected !== actual) {
      throw new Error(`[ASSERT FAIL] Expected '${expected}', but got '${actual}'. ${message || ''}`);
    }
  }
}

class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.results = [];
  }

  addTest(testName, fn) {
    this.tests.push({ testName, fn });
  }

  runAll() {
    console.log(`\n==================================================`);
    console.log(`RUNNING QA TEST SUITE: ${this.name}`);
    console.log(`==================================================`);
    this.results = [];

    let passedCount = 0;
    let failedCount = 0;

    for (const test of this.tests) {
      try {
        test.fn();
        console.log(`  [PASS] ✔ ${test.testName}`);
        this.results.push({ name: test.testName, status: 'PASSED', error: null });
        passedCount++;
      } catch (err) {
        console.error(`  [FAIL] ✖ ${test.testName}`);
        console.error(`         Reason: ${err.message}`);
        this.results.push({ name: test.testName, status: 'FAILED', error: err.message });
        failedCount++;
      }
    }

    console.log(`--------------------------------------------------`);
    console.log(`SUMMARY: Total: ${this.tests.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
    console.log(`==================================================\n`);

    return { total: this.tests.length, passed: passedCount, failed: failedCount, results: this.results };
  }
}

// Instantiate Epic 4 Test Suite
const epic4Suite = new TestSuite("Epic 04: Game Modes Subsystem (Classic & Time Attack)");

// --------------------------------------------------------------------------
// US-401: Polymorphic Game Mode Framework Tests
// --------------------------------------------------------------------------
epic4Suite.addTest("US-401: GameModeManager registers and switches active game modes", () => {
  const manager = new GameModeManager();
  const classic = new ClassicGameMode();
  const timeAttack = new TimeAttackGameMode();

  manager.registerMode(classic);
  manager.registerMode(timeAttack);

  Assert.isTrue(manager.selectMode("CLASSIC"), "Select CLASSIC mode should succeed");
  Assert.areEqual("CLASSIC", manager.activeMode.modeId, "Active mode is CLASSIC");

  Assert.isTrue(manager.selectMode("TIME_ATTACK"), "Select TIME_ATTACK mode should succeed");
  Assert.areEqual("TIME_ATTACK", manager.activeMode.modeId, "Active mode is TIME_ATTACK");
});

// --------------------------------------------------------------------------
// US-402: Classic Mode with Progressive Speed Ramping Tests
// --------------------------------------------------------------------------
epic4Suite.addTest("US-402: ClassicGameMode initializes at base tick interval (200ms)", () => {
  const mode = new ClassicGameMode();
  mode.initializeMode();

  Assert.areEqual(200, mode.currentTickInterval, "Initial tick interval is 200ms");
});

epic4Suite.addTest("US-402: ClassicGameMode decays tick interval on food consumption (Speed Ramping)", () => {
  const mode = new ClassicGameMode();
  mode.initializeMode();

  mode.onFoodEaten(10); // Score 10 -> 1 food -> interval = 200 * 0.98 = 196ms
  Assert.areEqual(196, mode.currentTickInterval, "Tick interval decays to 196ms at score 10");

  mode.onFoodEaten(40); // Score 50 -> 5 foods -> interval = 200 * (0.98^5) = ~181ms
  Assert.isTrue(mode.currentTickInterval < 196, "Speed increases smoothly as score increases");
});

epic4Suite.addTest("US-402: ClassicGameMode clamps speed decay to minimum cap (60ms)", () => {
  const mode = new ClassicGameMode();
  mode.initializeMode();

  mode.onFoodEaten(1000); // Massive score -> decay < 60ms
  Assert.areEqual(60, mode.currentTickInterval, "Tick interval must clamp to 60ms minimum cap");
});

// --------------------------------------------------------------------------
// US-403: Time Attack Mode with Fixed 60-Second Countdown Timer Tests
// --------------------------------------------------------------------------
epic4Suite.addTest("US-403: TimeAttackGameMode initializes at 60.0s countdown timer", () => {
  const mode = new TimeAttackGameMode();
  mode.initializeMode();

  Assert.areEqual(60.0, mode.remainingTime, "Remaining time starts at 60.0s");
  Assert.isFalse(mode.checkGameOverCondition(), "Not game over initially");
});

epic4Suite.addTest("US-403: TimeAttackGameMode decrements timer and triggers game over on expiration", () => {
  const mode = new TimeAttackGameMode();
  mode.initializeMode();

  let expired = false;
  mode.onTimeExpired = () => { expired = true; };

  mode.onTick(30.0); // 30s elapsed
  Assert.areEqual(30.0, mode.remainingTime, "Remaining time is 30.0s after 30s tick");
  Assert.isFalse(expired, "Time not expired at 30s");

  mode.onTick(30.1); // Exceeds remaining 30s
  Assert.areEqual(0.0, mode.remainingTime, "Remaining time clamps to 0.0s");
  Assert.isTrue(expired, "Time expired callback fired");
  Assert.isTrue(mode.checkGameOverCondition(), "GameOver condition true when time is 0.0s");
});

// --------------------------------------------------------------------------
// US-404: Extensibility Hooks for Level Mode & Ghost Mode Tests
// --------------------------------------------------------------------------
epic4Suite.addTest("US-404: GhostRecording serializes ghost frames cleanly to JSON", () => {
  const recording = new GhostRecording();
  recording.addFrame(0.1, 3, 10, 15);
  recording.addFrame(0.2, 3, 11, 15);
  recording.finalScore = 20;
  recording.totalDuration = 0.2;

  const json = recording.toJSON();
  Assert.isTrue(json.includes('"finalScore":20'), "JSON contains finalScore");
  Assert.isTrue(json.includes('"frames":['), "JSON contains frames array");
});

epic4Suite.addTest("US-404: LevelGameMode supports 5 distinct levels, level selection & unlocks", () => {
  const level = new LevelGameMode();
  level.initializeMode();

  Assert.areEqual(5, level.levels.length, "LevelGameMode contains 5 levels");
  Assert.areEqual("Stage 1: Novice Glide", level.currentLevel.name, "Default active level is Stage 1");
  Assert.areEqual(50, level.targetScoreGoal, "Stage 1 target score goal is 50");

  Assert.isFalse(level.selectLevel(1), "Level 2 locked initially (requires unlock)");

  level.unlockNextLevel(); // Unlock Level 2
  Assert.isTrue(level.selectLevel(1), "Level 2 can be selected after unlock");
  Assert.areEqual("Stage 2: Double Pillar", level.currentLevel.name, "Active level switched to Stage 2");
  Assert.areEqual(80, level.targetScoreGoal, "Stage 2 target score goal is 80");
  Assert.isTrue(level.getObstacles().length > 0, "Stage 2 contains obstacle blocks");
});

epic4Suite.addTest("US-404: LevelGameMode checks win condition and triggers level victory", () => {
  const level = new LevelGameMode();
  level.initializeMode();

  Assert.isFalse(level.checkWinCondition(0), "Win condition false at 0 pts");
  Assert.isFalse(level.checkWinCondition(40), "Win condition false at 40 pts");
  Assert.isTrue(level.checkWinCondition(50), "Win condition true at 50 pts target goal");

  let cleared = false;
  level.onLevelCleared = (lvl) => { cleared = true; };
  level.onFoodEaten(50);
  Assert.isTrue(cleared, "onLevelCleared callback fired when target goal reached");
});

epic4Suite.addTest("US-404: CollisionEngine detects obstacle block collisions", () => {
  const collisionEngine = new CollisionEngine(20, 30);
  const obstacles = [new GridPosition(5, 10), new GridPosition(6, 10)];

  Assert.isFalse(collisionEngine.isObstacleCollision(new GridPosition(4, 10), obstacles), "No obstacle collision at open grid cell");
  Assert.isTrue(collisionEngine.isObstacleCollision(new GridPosition(5, 10), obstacles), "Obstacle collision detected at (5, 10)");
});

// Export runner for Browser and Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { epic4Suite, ClassicGameMode, TimeAttackGameMode, LevelGameMode, GhostRecording, GameModeManager };
}
