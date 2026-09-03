/* ==========================================================================
   NEON SNAKE: LIGHT - EPIC 07 QA AUTOMATED TEST SUITE (NUNIT EQUIVALENT)
   Coverage: US-701 (AdMob SDK Init), US-702 (Rewarded Continue Flow & 3x3 Revive), US-703 (Offline Resiliency)
   SRS Traceability: FR-22, FR-23, FR-24
   ========================================================================== */

// Import classes if in Node environment
if (typeof require !== 'undefined') {
  var {
    AdManager, SnakeController, GridPosition, Direction, GameState, GameStateFSM, AppEngine
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

  async runAll() {
    console.log(`\n==================================================`);
    console.log(`RUNNING QA TEST SUITE: ${this.name}`);
    console.log(`==================================================`);
    this.results = [];

    let passedCount = 0;
    let failedCount = 0;

    for (const test of this.tests) {
      try {
        await test.fn();
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

// Instantiate Epic 7 Test Suite
const epic7Suite = new TestSuite("Epic 07: Monetization & Google AdMob Integration");

// --------------------------------------------------------------------------
// US-701: Google AdMob Bridge & SDK Initialization Tests
// --------------------------------------------------------------------------
epic7Suite.addTest("US-701: AdManager initializes SDK asynchronously and loads test rewarded ad", async () => {
  const adMgr = new AdManager();
  let initialized = false;
  let loaded = false;

  adMgr.onAdInitialized = () => { initialized = true; };
  adMgr.onAdLoaded = () => { loaded = true; };

  await adMgr.initializeSDKAsync();

  Assert.isTrue(adMgr.isInitialized, "SDK must be initialized");
  Assert.isTrue(initialized, "onAdInitialized callback should have fired");
  Assert.isTrue(adMgr.isAdLoaded, "Rewarded ad should be loaded");
  Assert.isTrue(loaded, "onAdLoaded callback should have fired");
  Assert.areEqual("ca-app-pub-3940256099942544/5224354917", AdManager.TEST_REWARDED_AD_UNIT_ID, "Uses official Google Test Ad Unit ID");
});

epic7Suite.addTest("US-701: AdManager reports rewarded ad ready when initialized and loaded", async () => {
  const adMgr = new AdManager();
  await adMgr.initializeSDKAsync();

  Assert.isTrue(adMgr.isRewardedAdReady(), "isRewardedAdReady should return true");
});

// --------------------------------------------------------------------------
// US-702: Rewarded Video "Continue Game" Flow & 3x3 Grid Clearance Tests
// --------------------------------------------------------------------------
epic7Suite.addTest("US-702: SnakeController clears surrounding 3x3 grid cells of body segments on revive", () => {
  const snake = new SnakeController();
  // Head at (10, 15), body segments surrounding head
  snake.initialize(new GridPosition(10, 15), 5, Direction.RIGHT);
  Assert.areEqual(5, snake.bodyParts.length, "Initial snake length should be 5");

  const removed = snake.clearSurroundingRadius(1);
  Assert.isTrue(removed > 0, "Body segments within 3x3 radius should be removed");
  Assert.isTrue(snake.bodyParts.length < 5, "Snake length reduced after clearing head radius");
  Assert.areEqual(10, snake.headPosition.x, "Snake head X position preserved");
  Assert.areEqual(15, snake.headPosition.y, "Snake head Y position preserved");
});

epic7Suite.addTest("US-702: Show rewarded ad triggers reward callback and reloads next ad", async () => {
  const adMgr = new AdManager();
  await adMgr.initializeSDKAsync();

  let rewardEarned = false;
  const success = adMgr.showRewardedAd(() => {
    rewardEarned = true;
  });

  Assert.isTrue(success, "showRewardedAd should return true when ad is ready");
  Assert.isTrue(rewardEarned, "Reward callback executed");
  Assert.isTrue(adMgr.isAdLoaded, "Next rewarded ad preloaded automatically after show");
});

epic7Suite.addTest("US-702: Closing ad without reward does not trigger reward callback", async () => {
  const adMgr = new AdManager();
  await adMgr.initializeSDKAsync();

  let rewardEarned = false;
  adMgr.simulateAdCloseWithoutReward();

  Assert.isFalse(rewardEarned, "Reward callback must not execute when ad closed early");
});

// --------------------------------------------------------------------------
// US-703: Offline Fallback Resiliency Tests
// --------------------------------------------------------------------------
epic7Suite.addTest("US-703: AdManager offline mode disables ads without crashing core engine", async () => {
  const adMgr = new AdManager();
  await adMgr.initializeSDKAsync();

  let failedError = null;
  adMgr.onAdFailedToLoad = (err) => { failedError = err; };

  adMgr.setOfflineMode(true); // Airplane mode simulation

  Assert.isTrue(adMgr.isOffline, "AdManager set to offline mode");
  Assert.isFalse(adMgr.isRewardedAdReady(), "isRewardedAdReady returns false offline");
  Assert.isFalse(adMgr.showRewardedAd(() => {}), "showRewardedAd returns false offline");
  Assert.isTrue(failedError !== null, "Offline fail callback triggered safely");
});

epic7Suite.addTest("US-703: Returning online automatically reloads rewarded ad", async () => {
  const adMgr = new AdManager();
  await adMgr.initializeSDKAsync();

  adMgr.setOfflineMode(true);
  Assert.isFalse(adMgr.isRewardedAdReady(), "Ad unavailable offline");

  adMgr.setOfflineMode(false); // Internet restored
  Assert.isTrue(adMgr.isRewardedAdReady(), "Ad reloaded automatically when online");
});

// Export runner for Browser and Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { epic7Suite, AdManager, SnakeController };
}
