/* ==========================================================================
   NEON SNAKE: LIGHT - EPIC 03 QA AUTOMATED TEST SUITE (NUNIT EQUIVALENT)
   Coverage: US-301 (Food Manager), US-302 (Score Engine), US-303 (Save System & HMAC)
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

// Instantiate Epic 3 Test Suite
const epic3Suite = new TestSuite("Epic 03: Food Spawning, Scoring & Anti-Tamper Security Persistence");

// --------------------------------------------------------------------------
// US-301: Valid Food Spawner & Consumption Mechanics Tests
// --------------------------------------------------------------------------
epic3Suite.addTest("US-301: FoodManager spawns food in unoccupied grid positions", () => {
  const foodManager = new FoodManager(20, 30);
  const snakeBody = [
    new GridPosition(10, 15),
    new GridPosition(9, 15),
    new GridPosition(8, 15)
  ];

  const spawned = foodManager.spawnFood(snakeBody);
  Assert.isTrue(spawned, "Food spawn should succeed");
  
  const foodPos = foodManager.activeFoodPosition;
  Assert.isTrue(foodPos.x >= 0 && foodPos.x < 20, "Food X inside grid bounds");
  Assert.isTrue(foodPos.y >= 0 && foodPos.y < 30, "Food Y inside grid bounds");

  // Verify food is not on snake body
  const onBody = snakeBody.some(b => b.x === foodPos.x && b.y === foodPos.y);
  Assert.isFalse(onBody, "Food position must not overlap with snake body segments");
});

epic3Suite.addTest("US-301: FoodManager detects food collection collision accurately", () => {
  const foodManager = new FoodManager(20, 30);
  foodManager.activeFoodPosition = new GridPosition(5, 8);

  Assert.isTrue(foodManager.checkFoodCollision(new GridPosition(5, 8)), "Collision true on matching coordinates");
  Assert.isFalse(foodManager.checkFoodCollision(new GridPosition(5, 7)), "Collision false on different coordinates");
});

// --------------------------------------------------------------------------
// US-302: Score Engine & Multiplier Calculation Tests
// --------------------------------------------------------------------------
epic3Suite.addTest("US-302: ScoreModel increments score and updates high score", () => {
  const scoreModel = new ScoreModel(50);
  Assert.areEqual(0, scoreModel.currentScore);
  Assert.areEqual(50, scoreModel.highScore);

  scoreModel.addScore(10);
  Assert.areEqual(10, scoreModel.currentScore, "Score increases to 10");
  Assert.areEqual(50, scoreModel.highScore, "High score unchanged when score < 50");

  scoreModel.addScore(50); // Total: 60
  Assert.areEqual(60, scoreModel.currentScore, "Score increases to 60");
  Assert.areEqual(60, scoreModel.highScore, "High score updates to 60 when score > 50");
});

epic3Suite.addTest("US-302: ScoreModel resets session score while preserving high score", () => {
  const scoreModel = new ScoreModel(100);
  scoreModel.addScore(40);
  Assert.areEqual(40, scoreModel.currentScore);

  scoreModel.resetSessionScore();
  Assert.areEqual(0, scoreModel.currentScore, "Session score resets to 0");
  Assert.areEqual(100, scoreModel.highScore, "High score preserved after session reset");
});

// --------------------------------------------------------------------------
// US-303: Encrypted Save System & Anti-Tamper Security Hash Tests
// --------------------------------------------------------------------------
epic3Suite.addTest("US-303: SaveSystem computes valid HMAC security checksum", () => {
  const data = { HighScoreClassic: 150, HighScoreTimeAttack: 0, SelectedSkinId: 0, SecurityHash: '' };
  const hash = SaveSystem.computeSecurityHash(data);

  Assert.isTrue(hash.length > 10, "Computed hash must be non-empty string");
  Assert.isTrue(hash.startsWith('HMAC_'), "Hash starts with HMAC prefix");
});

epic3Suite.addTest("US-303: SaveSystem saves and loads legitimate data cleanly (isTampered = false)", () => {
  localStorage.removeItem(SaveSystem.SAVE_KEY);

  const testData = {
    HighScoreClassic: 250,
    HighScoreTimeAttack: 0,
    SelectedSkinId: 1,
    SelectedThemeId: 0,
    SoundEnabled: true,
    VibrationEnabled: true,
    ControlType: 0,
    UnlockedSkinIds: [0, 1],
    SecurityHash: ''
  };

  SaveSystem.saveData(testData);
  const { data, isTampered } = SaveSystem.loadData();

  Assert.isFalse(isTampered, "Legitimate save should pass security validation");
  Assert.areEqual(250, data.HighScoreClassic, "HighScoreClassic loaded accurately");
});

epic3Suite.addTest("US-303: SaveSystem detects tampered save data and triggers fallback reset", () => {
  localStorage.removeItem(SaveSystem.SAVE_KEY);

  // 1. Save legitimate data
  const testData = {
    HighScoreClassic: 100,
    HighScoreTimeAttack: 0,
    SelectedSkinId: 0,
    SelectedThemeId: 0,
    SoundEnabled: true,
    VibrationEnabled: true,
    ControlType: 0,
    UnlockedSkinIds: [0],
    SecurityHash: ''
  };
  SaveSystem.saveData(testData);

  // 2. Inject corrupted/cheated save data manually (tamper attack simulation)
  SaveSystem.corruptSaveData();

  // 3. Attempt to load tampered save data
  const { data, isTampered } = SaveSystem.loadData();

  Assert.isTrue(isTampered, "Tamper detection must trigger on corrupted save file");
  Assert.areEqual(0, data.HighScoreClassic, "Cheated high score must be reset to fallback 0");
});

// Export runner for Browser and Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { epic3Suite, FoodManager, ScoreModel, SaveSystem };
}
