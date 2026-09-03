/* ==========================================================================
   NEON SNAKE: LIGHT - EPIC 02 QA AUTOMATED TEST SUITE (NUNIT EQUIVALENT)
   Coverage: US-201 (Swipe Gesture Handler) & US-202 (Button Control Handler)
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

// Instantiate Epic 2 Test Suite
const epic2Suite = new TestSuite("Epic 02: Input Management & Gesture Control System");

// --------------------------------------------------------------------------
// US-201: Touch Swipe Gesture Detection Handler Tests
// --------------------------------------------------------------------------
epic2Suite.addTest("US-201: SwipeInputHandler calculates horizontal RIGHT swipe vector", () => {
  const handler = new SwipeInputHandler(30);
  let dispatchedDir = null;
  handler.onDirectionRequested = (dir) => { dispatchedDir = dir; };

  const result = handler.processSwipe(100, 100, 200, 110); // ΔX = +100, ΔY = +10
  Assert.areEqual(Direction.RIGHT, result, "Horizontal drag +100px should calculate RIGHT");
  Assert.areEqual(Direction.RIGHT, dispatchedDir, "Dispatched event should be RIGHT");
  Assert.areEqual('HORIZONTAL', handler.lastDominantAxis, "Dominant axis should be HORIZONTAL");
});

epic2Suite.addTest("US-201: SwipeInputHandler calculates horizontal LEFT swipe vector", () => {
  const handler = new SwipeInputHandler(30);
  const result = handler.processSwipe(200, 100, 100, 105); // ΔX = -100, ΔY = +5
  Assert.areEqual(Direction.LEFT, result, "Horizontal drag -100px should calculate LEFT");
  Assert.areEqual('HORIZONTAL', handler.lastDominantAxis);
});

epic2Suite.addTest("US-201: SwipeInputHandler calculates vertical DOWN swipe vector", () => {
  const handler = new SwipeInputHandler(30);
  const result = handler.processSwipe(100, 100, 105, 200); // ΔY = +100 (UI Canvas Y increases downwards)
  Assert.areEqual(Direction.DOWN, result, "Vertical drag down +100px should calculate DOWN");
  Assert.areEqual('VERTICAL', handler.lastDominantAxis);
});

epic2Suite.addTest("US-201: SwipeInputHandler calculates vertical UP swipe vector", () => {
  const handler = new SwipeInputHandler(30);
  const result = handler.processSwipe(100, 200, 105, 100); // ΔY = -100
  Assert.areEqual(Direction.UP, result, "Vertical drag up -100px should calculate UP");
  Assert.areEqual('VERTICAL', handler.lastDominantAxis);
});

epic2Suite.addTest("US-201: SwipeInputHandler rejects sub-threshold drag gestures (<30px)", () => {
  const handler = new SwipeInputHandler(30);
  let dispatched = false;
  handler.onDirectionRequested = () => { dispatched = true; };

  const result = handler.processSwipe(100, 100, 115, 110); // Distance ~18px < 30px
  Assert.areEqual(Direction.NONE, result, "Short drag under 30px should return Direction.NONE");
  Assert.isFalse(dispatched, "No event should be dispatched for sub-threshold gesture");
  Assert.areEqual('SUB-THRESHOLD', handler.lastDominantAxis);
});

// --------------------------------------------------------------------------
// US-202: On-Screen Virtual D-Pad Touch Button Controls Tests
// --------------------------------------------------------------------------
epic2Suite.addTest("US-202: ButtonInputHandler dispatches direction on pointer trigger", () => {
  const handler = new ButtonInputHandler();
  handler.isEnabled = true;

  let lastDir = null;
  handler.onDirectionRequested = (dir) => { lastDir = dir; };

  handler.triggerDirection(Direction.UP);
  Assert.areEqual(Direction.UP, lastDir, "D-Pad UP tap dispatches Direction.UP");

  handler.triggerDirection(Direction.LEFT);
  Assert.areEqual(Direction.LEFT, lastDir, "D-Pad LEFT tap dispatches Direction.LEFT");
});

epic2Suite.addTest("US-202: Disabled ButtonInputHandler suppresses input events", () => {
  const handler = new ButtonInputHandler();
  handler.isEnabled = false;

  let dispatched = false;
  handler.onDirectionRequested = () => { dispatched = true; };

  handler.triggerDirection(Direction.RIGHT);
  Assert.isFalse(dispatched, "Disabled button handler must not dispatch events");
});

// --------------------------------------------------------------------------
// Input Subsystem Mode Switching & Integration Tests
// --------------------------------------------------------------------------
epic2Suite.addTest("InputManager switches between SWIPE and BUTTONS control modes cleanly", () => {
  const swipe = new SwipeInputHandler(30);
  const button = new ButtonInputHandler();
  const manager = new InputManager(swipe, button);

  let managerReceivedDir = null;
  manager.onDirectionRequested = (dir) => { managerReceivedDir = dir; };

  // Mode 1: Swipe Active
  manager.setControlType(InputControlType.SWIPE);
  Assert.isTrue(swipe.isEnabled, "Swipe handler enabled in SWIPE mode");
  Assert.isFalse(button.isEnabled, "Button handler disabled in SWIPE mode");

  swipe.processSwipe(100, 100, 200, 100);
  Assert.areEqual(Direction.RIGHT, managerReceivedDir, "InputManager receives swipe event");

  // Mode 2: Buttons Active
  manager.setControlType(InputControlType.BUTTONS);
  Assert.isFalse(swipe.isEnabled, "Swipe handler disabled in BUTTONS mode");
  Assert.isTrue(button.isEnabled, "Button handler enabled in BUTTONS mode");

  button.triggerDirection(Direction.DOWN);
  Assert.areEqual(Direction.DOWN, managerReceivedDir, "InputManager receives button event");
});

// Export runner for Browser and Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { epic2Suite, SwipeInputHandler, ButtonInputHandler, InputManager, InputControlType };
}
