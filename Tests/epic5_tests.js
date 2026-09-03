/* ==========================================================================
   NEON SNAKE: LIGHT - EPIC 05 QA AUTOMATED TEST SUITE (NUNIT EQUIVALENT)
   Coverage: US-501 (Navigation Stack Router), US-502 (Theme Manager), US-503 (Skin Customization)
   SRS Traceability: FR-02, FR-17, FR-18, NFR-03, NFR-08
   ========================================================================== */

// Import classes if in Node environment
if (typeof require !== 'undefined') {
  var {
    NavigationRouter, ThemeManager, ThemeMode, SkinManager, SaveSystem
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

// Instantiate Epic 5 Test Suite
const epic5Suite = new TestSuite("Epic 05: UI/UX Presentation, Dynamic Themes & Skin Customization");

// --------------------------------------------------------------------------
// US-501: Main Menu & Stack Navigation Router Setup Tests
// --------------------------------------------------------------------------
epic5Suite.addTest("US-501: NavigationRouter initializes with MainMenu root view at stack depth 1", () => {
  const router = new NavigationRouter();
  Assert.areEqual("MainMenu", router.currentView, "Initial root view must be MainMenu");
  Assert.areEqual(1, router.stackDepth, "Initial stack depth must be 1");
});

epic5Suite.addTest("US-501: NavigationRouter pushes views and notifies onViewChanged event", () => {
  const router = new NavigationRouter();
  let lastPrev = null;
  let lastCurr = null;

  router.onViewChanged = (prev, curr) => {
    lastPrev = prev;
    lastCurr = curr;
  };

  const pushed = router.pushView("SkinSelection");
  Assert.isTrue(pushed, "pushView should return true for a new view");
  Assert.areEqual("SkinSelection", router.currentView, "Current view should update to SkinSelection");
  Assert.areEqual(2, router.stackDepth, "Stack depth should be 2 after 1 push");
  Assert.areEqual("MainMenu", lastPrev, "Previous view event parameter must be MainMenu");
  Assert.areEqual("SkinSelection", lastCurr, "Current view event parameter must be SkinSelection");
});

epic5Suite.addTest("US-501: NavigationRouter rejects pushing duplicate active top view", () => {
  const router = new NavigationRouter();
  router.pushView("Settings");
  const duplicatePushed = router.pushView("Settings");

  Assert.isFalse(duplicatePushed, "pushView should return false when pushing the current top view");
  Assert.areEqual(2, router.stackDepth, "Stack depth must remain 2");
});

epic5Suite.addTest("US-501: NavigationRouter pops view and restores previous screen", () => {
  const router = new NavigationRouter();
  router.pushView("Settings");
  router.pushView("Modes");
  Assert.areEqual(3, router.stackDepth, "Stack depth should be 3");

  const popped = router.popView();
  Assert.isTrue(popped, "popView should return true when popping above root");
  Assert.areEqual("Settings", router.currentView, "Current view restored to Settings");
  Assert.areEqual(2, router.stackDepth, "Stack depth reduced to 2");
});

epic5Suite.addTest("US-501: NavigationRouter guards root view against popping below depth 1", () => {
  const router = new NavigationRouter();
  const poppedRoot = router.popView();

  Assert.isFalse(poppedRoot, "popView should return false when trying to pop root view");
  Assert.areEqual("MainMenu", router.currentView, "Current view remains MainMenu");
  Assert.areEqual(1, router.stackDepth, "Stack depth remains 1");
});

epic5Suite.addTest("US-501: NavigationRouter navigateToHome resets back stack to MainMenu", () => {
  const router = new NavigationRouter();
  router.pushView("Settings");
  router.pushView("Skins");
  router.pushView("GameOver");
  Assert.areEqual(4, router.stackDepth, "Stack depth should be 4 before reset");

  router.navigateToHome();
  Assert.areEqual("MainMenu", router.currentView, "Current view reset to MainMenu");
  Assert.areEqual(1, router.stackDepth, "Stack depth reset to 1");
});

// --------------------------------------------------------------------------
// US-502: Dynamic Light & Dark Theme Manager Tests
// --------------------------------------------------------------------------
epic5Suite.addTest("US-502: ThemeManager initializes to Dark theme mode by default", () => {
  const themeMgr = new ThemeManager();
  Assert.areEqual(ThemeMode.DARK, themeMgr.currentMode, "Default theme mode must be DARK");
});

epic5Suite.addTest("US-502: ThemeManager toggles smoothly between DARK and LIGHT modes", () => {
  const themeMgr = new ThemeManager(ThemeMode.DARK);
  themeMgr.toggleTheme();

  Assert.areEqual(ThemeMode.LIGHT, themeMgr.currentMode, "Current mode should toggle to LIGHT");

  themeMgr.toggleTheme();
  Assert.areEqual(ThemeMode.DARK, themeMgr.currentMode, "Current mode should toggle back to DARK");
});

epic5Suite.addTest("US-502: ThemeManager triggers onThemeChanged callback with mode payload", () => {
  const themeMgr = new ThemeManager();
  let receivedMode = null;

  themeMgr.onThemeChanged = (mode) => {
    receivedMode = mode;
  };

  themeMgr.setTheme(ThemeMode.LIGHT);
  Assert.areEqual(ThemeMode.LIGHT, receivedMode, "Callback payload should be LIGHT");
});

epic5Suite.addTest("US-502: Theme selection persists into SaveData and generates security checksum", () => {
  const mockData = {
    HighScoreClassic: 120,
    HighScoreTimeAttack: 45,
    SelectedSkinId: 0,
    SelectedThemeId: 1, // LIGHT mode
    SoundEnabled: true,
    VibrationEnabled: true,
    ControlType: 0,
    UnlockedSkinIds: [0],
    SecurityHash: ''
  };

  const hash = SaveSystem.saveData(mockData);
  Assert.isTrue(hash !== undefined && hash.length > 0, "Security hash generated on save");

  const { data: loaded, isTampered } = SaveSystem.loadData();
  Assert.isFalse(isTampered, "Loaded save must pass security checksum");
  Assert.areEqual(1, loaded.SelectedThemeId, "SelectedThemeId must match saved theme ID (1)");
});

// --------------------------------------------------------------------------
// US-503: Snake Skin Selection System Tests
// --------------------------------------------------------------------------
epic5Suite.addTest("US-503: SkinManager provides exactly 5 distinct Snake skin profiles", () => {
  Assert.areEqual(5, SkinManager.SKINS.length, "SkinManager must contain 5 skin profiles");
  Assert.areEqual("Default Neon Green", SkinManager.SKINS[0].name, "Skin 0 is Default Neon Green");
  Assert.areEqual("Cyan Cyber", SkinManager.SKINS[1].name, "Skin 1 is Cyan Cyber");
  Assert.areEqual("Magenta Pink", SkinManager.SKINS[2].name, "Skin 2 is Magenta Pink");
  Assert.areEqual("Solar Yellow", SkinManager.SKINS[3].name, "Skin 3 is Solar Yellow");
  Assert.areEqual("Rainbow Pulse", SkinManager.SKINS[4].name, "Skin 4 is Rainbow Pulse");
});

epic5Suite.addTest("US-503: SkinManager selects active skin and notifies subscribers", () => {
  const skinMgr = new SkinManager(0);
  let changedSkin = null;

  skinMgr.onSkinChanged = (skin) => {
    changedSkin = skin;
  };

  const selected = skinMgr.selectSkin(2); // Magenta Pink
  Assert.isTrue(selected, "selectSkin(2) should return true for valid skin ID");
  Assert.areEqual(2, skinMgr.activeSkinId, "Active skin ID must be 2");
  Assert.areEqual("Magenta Pink", skinMgr.activeSkin.name, "Active skin name must be Magenta Pink");
  Assert.areEqual("Magenta Pink", changedSkin.name, "Event payload skin name must be Magenta Pink");
});

epic5Suite.addTest("US-503: SkinManager rejects invalid out-of-bounds skin ID selection", () => {
  const skinMgr = new SkinManager(0);

  Assert.isFalse(skinMgr.selectSkin(-1), "Negative skin ID selection must return false");
  Assert.isFalse(skinMgr.selectSkin(5), "Out-of-bounds skin ID selection must return false");
  Assert.areEqual(0, skinMgr.activeSkinId, "Active skin ID should remain 0");
});

epic5Suite.addTest("US-503: Skin profiles define valid headColor, bodyColor, and glowColor properties", () => {
  SkinManager.SKINS.forEach(skin => {
    Assert.isTrue(skin.headColor && skin.headColor.startsWith("#"), `Skin ${skin.name} must have valid hex headColor`);
    Assert.isTrue(skin.bodyColor && skin.bodyColor.startsWith("#"), `Skin ${skin.name} must have valid hex bodyColor`);
    Assert.isTrue(skin.glowColor && skin.glowColor.startsWith("#"), `Skin ${skin.name} must have valid hex glowColor`);
  });
});

epic5Suite.addTest("US-503: Skin selection persists into SaveData with HMAC-SHA256 checksum", () => {
  const mockData = {
    HighScoreClassic: 250,
    HighScoreTimeAttack: 80,
    SelectedSkinId: 3, // Solar Yellow
    SelectedThemeId: 0,
    SoundEnabled: true,
    VibrationEnabled: true,
    ControlType: 0,
    UnlockedSkinIds: [0, 3],
    SecurityHash: ''
  };

  SaveSystem.saveData(mockData);
  const { data: loaded, isTampered } = SaveSystem.loadData();

  Assert.isFalse(isTampered, "Save data with SelectedSkinId = 3 must pass tamper check");
  Assert.areEqual(3, loaded.SelectedSkinId, "Loaded SelectedSkinId must equal 3");
});

// Export runner for Browser and Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { epic5Suite, NavigationRouter, ThemeManager, SkinManager, SaveSystem };
}
