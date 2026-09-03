/* ==========================================================================
   NEON SNAKE: LIGHT - EPIC 06 QA AUTOMATED TEST SUITE (NUNIT EQUIVALENT)
   Coverage: US-601 (Audio Manager), US-602 (Haptics Manager), US-603 (Score Share Intent Bridge)
   SRS Traceability: FR-19, FR-20, FR-21
   ========================================================================== */

// Import classes if in Node environment
if (typeof require !== 'undefined') {
  var {
    AudioManager, HapticsManager, ShareService, SaveSystem
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

// Instantiate Epic 6 Test Suite
const epic6Suite = new TestSuite("Epic 06: Audio, Haptic Feedback & Native Android Sharing");

// --------------------------------------------------------------------------
// US-601: Audio Manager & Sound Effect Pool Tests
// --------------------------------------------------------------------------
epic6Suite.addTest("US-601: AudioManager initializes with sound enabled by default", () => {
  const audioMgr = new AudioManager();
  Assert.isTrue(audioMgr.isEnabled, "AudioManager sound should be enabled by default");
});

epic6Suite.addTest("US-601: AudioManager toggles sound state cleanly", () => {
  const audioMgr = new AudioManager(true);

  const state1 = audioMgr.toggleSound();
  Assert.isFalse(state1, "Sound should toggle to disabled");
  Assert.isFalse(audioMgr.isEnabled, "isEnabled should equal false");

  const state2 = audioMgr.toggleSound();
  Assert.isTrue(state2, "Sound should toggle back to enabled");
  Assert.isTrue(audioMgr.isEnabled, "isEnabled should equal true");
});

epic6Suite.addTest("US-601: AudioManager suppresses audio playback when sound is disabled", () => {
  const audioMgr = new AudioManager(false); // Disabled

  Assert.isFalse(audioMgr.playEatSFX(), "playEatSFX must return false when sound disabled");
  Assert.isFalse(audioMgr.playButtonClickSFX(), "playButtonClickSFX must return false when sound disabled");
  Assert.isFalse(audioMgr.playCrashSFX(), "playCrashSFX must return false when sound disabled");
});

epic6Suite.addTest("US-601: Sound preference persists in SaveData with HMAC-SHA256 checksum", () => {
  const mockData = {
    HighScoreClassic: 310,
    HighScoreTimeAttack: 95,
    SelectedSkinId: 1,
    SelectedThemeId: 0,
    SoundEnabled: false, // Sound muted
    VibrationEnabled: true,
    ControlType: 0,
    UnlockedSkinIds: [0, 1],
    SecurityHash: ''
  };

  SaveSystem.saveData(mockData);
  const { data: loaded, isTampered } = SaveSystem.loadData();

  Assert.isFalse(isTampered, "Loaded save data with SoundEnabled=false must pass security check");
  Assert.isFalse(loaded.SoundEnabled, "Loaded SoundEnabled must equal false");
});

// --------------------------------------------------------------------------
// US-602: Device Haptic Vibration Feedback Tests
// --------------------------------------------------------------------------
epic6Suite.addTest("US-602: HapticsManager initializes with vibration enabled by default", () => {
  const haptics = new HapticsManager();
  Assert.isTrue(haptics.isEnabled, "HapticsManager vibration should be enabled by default");
});

epic6Suite.addTest("US-602: HapticsManager toggles vibration state cleanly", () => {
  const haptics = new HapticsManager(true);

  const state1 = haptics.toggleVibration();
  Assert.isFalse(state1, "Vibration should toggle to disabled");

  const state2 = haptics.toggleVibration();
  Assert.isTrue(state2, "Vibration should toggle back to enabled");
});

epic6Suite.addTest("US-602: HapticsManager triggers pulse durations (30ms food, 200ms crash, 15ms click)", () => {
  const haptics = new HapticsManager(true);

  Assert.isTrue(haptics.triggerFoodEatenHaptic(), "triggerFoodEatenHaptic should return true");
  Assert.areEqual(30, haptics.lastVibrationMs, "Food eaten vibration duration should be 30ms");

  Assert.isTrue(haptics.triggerCrashHaptic(), "triggerCrashHaptic should return true");
  Assert.areEqual(200, haptics.lastVibrationMs, "Crash vibration duration should be 200ms");

  Assert.isTrue(haptics.triggerButtonClickHaptic(), "triggerButtonClickHaptic should return true");
  Assert.areEqual(15, haptics.lastVibrationMs, "Button click vibration duration should be 15ms");
});

epic6Suite.addTest("US-602: HapticsManager suppresses vibration when disabled", () => {
  const haptics = new HapticsManager(false); // Disabled

  Assert.isFalse(haptics.triggerFoodEatenHaptic(), "Food haptic must return false when disabled");
  Assert.isFalse(haptics.triggerCrashHaptic(), "Crash haptic must return false when disabled");
});

epic6Suite.addTest("US-602: Vibration preference persists in SaveData with HMAC-SHA256 checksum", () => {
  const mockData = {
    HighScoreClassic: 420,
    HighScoreTimeAttack: 110,
    SelectedSkinId: 2,
    SelectedThemeId: 1,
    SoundEnabled: true,
    VibrationEnabled: false, // Vibration disabled
    ControlType: 0,
    UnlockedSkinIds: [0, 2],
    SecurityHash: ''
  };

  SaveSystem.saveData(mockData);
  const { data: loaded, isTampered } = SaveSystem.loadData();

  Assert.isFalse(isTampered, "Loaded save data with VibrationEnabled=false must pass security check");
  Assert.isFalse(loaded.VibrationEnabled, "Loaded VibrationEnabled must equal false");
});

// --------------------------------------------------------------------------
// US-603: Native Android Score Share Intent Bridge Tests
// --------------------------------------------------------------------------
epic6Suite.addTest("US-603: ShareService formats localized share string payload accurately", () => {
  const share = new ShareService();
  const msg = share.formatShareMessage(150, "Classic");

  Assert.isTrue(msg.includes("I just scored 150 in Neon Snake: Light (Classic Mode)!"), "Message formatted with score and mode");
  Assert.isTrue(msg.includes("Can you beat my high score?"), "Message contains call-to-action text");
});

epic6Suite.addTest("US-603: ShareService dispatches share score payload successfully", async () => {
  const share = new ShareService();
  const result = await share.shareScore(200, "Time Attack");

  Assert.isTrue(result.success, "Share score execution should report success");
  Assert.isTrue(result.message.includes("200"), "Share message payload should contain score 200");
  Assert.isTrue(result.method !== undefined && result.method.length > 0, "Share method should be reported");
});

// Export runner for Browser and Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { epic6Suite, AudioManager, HapticsManager, ShareService, SaveSystem };
}
