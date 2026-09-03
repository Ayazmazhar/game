/* ==========================================================================
   NEON SNAKE: LIGHT - EPIC 01 QA AUTOMATED TEST SUITE (NUNIT EQUIVALENT)
   Coverage: US-101, US-102, US-103, US-104, US-105
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

  static deepEqual(expected, actual, message) {
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      throw new Error(`[ASSERT FAIL] Expected '${JSON.stringify(expected)}', but got '${JSON.stringify(actual)}'. ${message || ''}`);
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

// Instantiate Epic 1 Test Suite
const epic1Suite = new TestSuite("Epic 01: Core Engine Architecture & Grid Physics");

// --------------------------------------------------------------------------
// US-101: Core FSM & Application Boot Orchestration Tests
// --------------------------------------------------------------------------
epic1Suite.addTest("US-101: FSM initializes in BootState", () => {
  const fsm = new GameStateFSM();
  Assert.areEqual(GameState.BootState, fsm.currentState, "Initial state must be BootState");
});

epic1Suite.addTest("US-101: FSM validates transition rules", () => {
  const fsm = new GameStateFSM();
  
  // Valid Boot -> MainMenu
  Assert.isTrue(fsm.changeState(GameState.MainMenuState), "BootState -> MainMenuState must be valid");
  Assert.areEqual(GameState.MainMenuState, fsm.currentState);

  // Valid MainMenu -> GameLoop
  Assert.isTrue(fsm.changeState(GameState.GameLoopState), "MainMenuState -> GameLoopState must be valid");
  Assert.areEqual(GameState.GameLoopState, fsm.currentState);

  // Invalid Direct Transition (GameLoop -> BootState)
  Assert.isFalse(fsm.changeState(GameState.BootState), "GameLoopState -> BootState must be rejected");
  Assert.areEqual(GameState.GameLoopState, fsm.currentState, "State must remain unchanged upon rejected transition");
});

// --------------------------------------------------------------------------
// US-102: Logical 2D Grid & Coordinate Mapping Tests
// --------------------------------------------------------------------------
epic1Suite.addTest("US-102: Grid bounds checking validates 20x30 coordinates", () => {
  const grid = new GridManager(20, 30);
  
  Assert.isTrue(grid.isWithinBounds(new GridPosition(0, 0)), "(0,0) is valid");
  Assert.isTrue(grid.isWithinBounds(new GridPosition(19, 29)), "(19,29) is valid boundary limit");
  Assert.isFalse(grid.isWithinBounds(new GridPosition(-1, 0)), "X = -1 is out of bounds");
  Assert.isFalse(grid.isWithinBounds(new GridPosition(20, 15)), "X = 20 is out of bounds");
  Assert.isFalse(grid.isWithinBounds(new GridPosition(10, 30)), "Y = 30 is out of bounds");
});

// --------------------------------------------------------------------------
// US-103: Snake Body Management & 180-Degree Turn Prevention Tests
// --------------------------------------------------------------------------
epic1Suite.addTest("US-103: Snake movement tick updates head and removes tail when not growing", () => {
  const snake = new SnakeController();
  snake.initialize(new GridPosition(10, 15), 3, Direction.RIGHT);

  Assert.areEqual(3, snake.bodyParts.length, "Initial body length should be 3");
  Assert.deepEqual(new GridPosition(10, 15), snake.headPosition, "Initial head position");

  // Step Forward Right
  snake.stepForward(false);
  Assert.areEqual(3, snake.bodyParts.length, "Length remains 3 after step without growth");
  Assert.deepEqual(new GridPosition(11, 15), snake.headPosition, "New head position should be (11, 15)");
});

epic1Suite.addTest("US-103: Snake prevents instant 180-degree self-reversals (FR-04)", () => {
  const snake = new SnakeController();
  snake.initialize(new GridPosition(10, 15), 3, Direction.RIGHT);

  // Attempt 180-degree turn: RIGHT -> LEFT
  const accepted = snake.requestDirectionChange(Direction.LEFT);
  Assert.isFalse(accepted, "180-degree turn request (RIGHT -> LEFT) must be rejected");
  
  // Step forward should continue moving RIGHT
  snake.stepForward(false);
  Assert.deepEqual(new GridPosition(11, 15), snake.headPosition, "Snake continues moving RIGHT despite LEFT input");
});

epic1Suite.addTest("US-103: Snake accepts valid 90-degree turn (RIGHT -> UP)", () => {
  const snake = new SnakeController();
  snake.initialize(new GridPosition(10, 15), 3, Direction.RIGHT);

  const accepted = snake.requestDirectionChange(Direction.UP);
  Assert.isTrue(accepted, "90-degree turn request (RIGHT -> UP) must be accepted");

  snake.stepForward(false);
  Assert.deepEqual(new GridPosition(10, 16), snake.headPosition, "New head position should be (10, 16)");
});

epic1Suite.addTest("US-103: Snake grows by 1 segment when stepForward(growNextStep=true)", () => {
  const snake = new SnakeController();
  snake.initialize(new GridPosition(10, 15), 3, Direction.RIGHT);

  snake.stepForward(true); // Grow step
  Assert.areEqual(4, snake.bodyParts.length, "Body length should increase to 4 after growth tick");
});

// --------------------------------------------------------------------------
// US-104: Collision Engine (Wall & Self Collision) Tests
// --------------------------------------------------------------------------
epic1Suite.addTest("US-104: CollisionEngine detects wall collision boundaries", () => {
  const engine = new CollisionEngine(20, 30);

  Assert.isFalse(engine.isWallCollision(new GridPosition(10, 15)), "Inside grid position is not wall collision");
  Assert.isTrue(engine.isWallCollision(new GridPosition(-1, 15)), "X = -1 triggers wall collision");
  Assert.isTrue(engine.isWallCollision(new GridPosition(20, 15)), "X = 20 triggers wall collision");
  Assert.isTrue(engine.isWallCollision(new GridPosition(10, -1)), "Y = -1 triggers wall collision");
  Assert.isTrue(engine.isWallCollision(new GridPosition(10, 30)), "Y = 30 triggers wall collision");
});

epic1Suite.addTest("US-104: CollisionEngine detects self-collision accurately", () => {
  const engine = new CollisionEngine(20, 30);
  
  // Body: Head (5,5), Body1 (5,4), Body2 (6,4), Body3 (6,5), Body4 (5,5)
  const body = [
    new GridPosition(5, 5),
    new GridPosition(5, 4),
    new GridPosition(6, 4),
    new GridPosition(6, 5),
    new GridPosition(5, 5) // Head collides with Body4
  ];

  Assert.isTrue(engine.isSelfCollision(body[0], body), "Self collision detected when head position equals body segment");

  const safeBody = [
    new GridPosition(5, 5),
    new GridPosition(4, 5),
    new GridPosition(3, 5)
  ];
  Assert.isFalse(engine.isSelfCollision(safeBody[0], safeBody), "No self collision on linear body");
});

// --------------------------------------------------------------------------
// US-105: Zero-Allocation Object Pooler Tests
// --------------------------------------------------------------------------
epic1Suite.addTest("US-105: ObjectPooler prewarms 100 capacity and recycles instances", () => {
  let createdCounter = 0;
  const pool = new ObjectPooler(() => ({ id: ++createdCounter }), 100);

  Assert.areEqual(100, pool.totalCreated, "Prewarmed 100 items");
  Assert.areEqual(100, pool.availableCount, "100 available items initially");
  Assert.areEqual(0, pool.activeCount, "0 active items initially");

  // Get item
  const item1 = pool.get();
  Assert.areEqual(99, pool.availableCount, "Available items decreases by 1");
  Assert.areEqual(1, pool.activeCount, "Active count becomes 1");
  Assert.areEqual(100, pool.totalCreated, "Zero new allocations during get()");

  // Release item back
  pool.release(item1);
  Assert.areEqual(100, pool.availableCount, "Available items returns to 100");
  Assert.areEqual(0, pool.activeCount, "Active count returns to 0");
});

// Export runner for Browser and Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { epic1Suite, GameState, GridPosition, GridManager, SnakeController, CollisionEngine, ObjectPooler, GameStateFSM };
}
