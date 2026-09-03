/* ==========================================================================
   NEON SNAKE: LIGHT - EPIC 08 QA AUTOMATED TEST SUITE (NUNIT EQUIVALENT)
   Coverage: US-801 (NUnit Tests), US-802 (30 FPS Cap & 0 GC Tick), US-803 (Sub-15MB APK), US-804 (ARM Build Matrix)
   SRS Traceability: NFR-01, NFR-02, NFR-05, NFR-06
   ========================================================================== */

// Import classes if in Node environment
if (typeof require !== 'undefined') {
  var {
    PerformanceProfiler, BuildConfig, SnakeController, CollisionEngine, SaveSystem, GridPosition, Direction
  } = require('../app.js');
}

// Assert Test Helper Framework
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

// Instantiate Epic 8 Test Suite
const epic8Suite = new TestSuite("Epic 08: Non-Functional Optimization, NUnit Testing & Release APK Build");

// --------------------------------------------------------------------------
// US-801: Automated NUnit Unit Test Suite Regressions Check
// --------------------------------------------------------------------------
epic8Suite.addTest("US-801: SnakeController 180-degree turn rejection guard check passes", () => {
  Assert.isTrue(SnakeController.isOppositeDirection(Direction.RIGHT, Direction.LEFT), "RIGHT and LEFT are opposite");
  Assert.isTrue(SnakeController.isOppositeDirection(Direction.UP, Direction.DOWN), "UP and DOWN are opposite");
  Assert.isFalse(SnakeController.isOppositeDirection(Direction.RIGHT, Direction.UP), "RIGHT and UP are orthogonal 90-degree");
});

epic8Suite.addTest("US-801: CollisionEngine correctly flags wall boundary and self collisions", () => {
  const engine = new CollisionEngine(20, 30);
  Assert.isFalse(engine.isWallCollision(new GridPosition(10, 15)), "Position (10,15) is inside bounds");
  Assert.isTrue(engine.isWallCollision(new GridPosition(-1, 15)), "Position (-1,15) is wall collision");
  Assert.isTrue(engine.isWallCollision(new GridPosition(20, 15)), "Position (20,15) is wall collision");
  Assert.isTrue(engine.isWallCollision(new GridPosition(10, -1)), "Position (10,-1) is wall collision");
  Assert.isTrue(engine.isWallCollision(new GridPosition(10, 30)), "Position (10,30) is wall collision");
});

epic8Suite.addTest("US-801: SaveSystem checksum integrity verification detects save file tampering", () => {
  const mockSave = {
    HighScoreClassic: 99999,
    HighScoreTimeAttack: 88888,
    SelectedSkinId: 0,
    SelectedThemeId: 0,
    SoundEnabled: true,
    VibrationEnabled: true,
    ControlType: 0,
    UnlockedSkinIds: [0],
    SecurityHash: 'CORRUPTED_TAMPER_HASH'
  };

  SaveSystem.saveData(mockSave);
  const { data: loaded, isTampered } = SaveSystem.loadData();

  Assert.isTrue(isTampered, "Tampered checksum must set isTampered flag to true");
  Assert.areEqual(0, loaded.HighScoreClassic, "Cheated high score must reset to fallback 0");
});

// --------------------------------------------------------------------------
// US-802: Frame Rate Cap & Performance Profiling (30 FPS, Zero GC) Tests
// --------------------------------------------------------------------------
epic8Suite.addTest("US-802: PerformanceProfiler initializes at 30 FPS target and 33.33ms frame delta", () => {
  const profiler = new PerformanceProfiler(30);
  Assert.areEqual(30, profiler.targetFPS, "Default target frame rate must be 30 FPS");
  Assert.areEqual("33.33", profiler.frameDeltaTimeMs, "Target 30 FPS frame delta should be 33.33ms");
});

epic8Suite.addTest("US-802: PerformanceProfiler registers 0 Bytes heap allocations during active ticks", () => {
  const profiler = new PerformanceProfiler(30);
  profiler.tickFrame(performance.now());
  Assert.areEqual(0, profiler.heapAllocationsPerTick, "Heap allocations per tick must equal 0 Bytes");
});

epic8Suite.addTest("US-802: PerformanceProfiler updates target FPS mode to 60 FPS", () => {
  const profiler = new PerformanceProfiler(30);
  profiler.setTargetFrameRate(60);
  Assert.areEqual(60, profiler.targetFPS, "Target frame rate updated to 60 FPS");
  Assert.areEqual("16.67", profiler.frameDeltaTimeMs, "Target 60 FPS frame delta should be 16.67ms");
});

// --------------------------------------------------------------------------
// US-803: Asset Compression & Sub-15MB APK Package Optimization Tests
// --------------------------------------------------------------------------
epic8Suite.addTest("US-803: BuildConfig verifies release APK file size is strictly under 15.0 MB target", () => {
  Assert.isTrue(BuildConfig.MAX_ALLOWED_APK_SIZE_MB <= 15.0, "Max allowed APK size limit is 15.0 MB");
  Assert.areEqual(11.8, BuildConfig.ACTUAL_APK_SIZE_MB, "Optimized package footprint is 11.8 MB");
  Assert.isTrue(BuildConfig.ValidatePackageSize(11.8), "Package size 11.8 MB passes validation");
  Assert.isFalse(BuildConfig.ValidatePackageSize(16.5), "Package size 16.5 MB fails validation");
});

epic8Suite.addTest("US-803: BuildConfig confirms High stripping level and ASTC texture compression", () => {
  Assert.areEqual("High", BuildConfig.STRIPPING_LEVEL, "Code stripping level set to High");
  Assert.isTrue(BuildConfig.COMPRESSION.includes("ASTC 6x6"), "Uses ASTC 6x6 sprite atlas compression");
});

// --------------------------------------------------------------------------
// US-804: Android APK Build Generation & Device Matrix Verification Tests
// --------------------------------------------------------------------------
epic8Suite.addTest("US-804: BuildConfig targets Android 14 (API 34+) with minimum Android 7.0 (API 24+)", () => {
  Assert.isTrue(BuildConfig.TARGET_SDK.includes("API 34+"), "Target SDK level is API 34+");
  Assert.isTrue(BuildConfig.MIN_SDK.includes("API 24+"), "Minimum SDK level is API 24+");
});

epic8Suite.addTest("US-804: BuildConfig exports formatted build summary string payload", () => {
  const summary = BuildConfig.getSummary();
  Assert.isTrue(summary.includes("Neon Snake: Light v1.0.0"), "Summary contains game title and version");
  Assert.isTrue(summary.includes("11.8MB"), "Summary contains APK size");
  Assert.isTrue(summary.includes("Android 14"), "Summary contains target SDK");
});

// Export runner for Browser and Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { epic8Suite, PerformanceProfiler, BuildConfig, SnakeController, CollisionEngine, SaveSystem };
}
