using System;
using NUnit.Framework;
using NeonSnake.Core;

namespace NeonSnake.Tests
{
    [TestFixture]
    public class SnakeMovementTests
    {
        private SnakeController snake;

        [SetUp]
        public void Setup()
        {
            snake = new SnakeController();
            snake.Initialize(new GridPosition(10, 15), 3, Direction.Right);
        }

        [Test]
        public void US801_SnakeInitializesWithCorrectHeadAndLength()
        {
            Assert.AreEqual(10, snake.HeadPosition.X);
            Assert.AreEqual(15, snake.HeadPosition.Y);
            Assert.AreEqual(3, snake.BodyParts.Count);
        }

        [Test]
        public void US801_SnakeRejectsInstant180DegreeTurnReversal()
        {
            // Snake moving RIGHT, input LEFT should be rejected (FR-04)
            bool accepted = snake.RequestDirectionChange(Direction.Left);
            Assert.IsFalse(accepted, "180-degree turn from Right to Left must be rejected");
            Assert.AreEqual(Direction.Right, snake.PendingDirection);
        }

        [Test]
        public void US801_SnakeAcceptsValid90DegreeTurn()
        {
            // Snake moving RIGHT, input UP should be accepted
            bool accepted = snake.RequestDirectionChange(Direction.Up);
            Assert.IsTrue(accepted, "90-degree turn from Right to Up must be accepted");
            Assert.AreEqual(Direction.Up, snake.PendingDirection);
        }

        [Test]
        public void US801_SnakeStepForwardUpdatesHeadAndPopsTailWhenNotGrowing()
        {
            snake.RequestDirectionChange(Direction.Up);
            snake.StepForward(growNextStep: false);

            Assert.AreEqual(10, snake.HeadPosition.X);
            Assert.AreEqual(16, snake.HeadPosition.Y);
            Assert.AreEqual(3, snake.BodyParts.Count, "Length remains 3 when growNextStep is false");
        }

        [Test]
        public void US801_SnakeStepForwardGrowsLengthWhenGrowNextStepIsTrue()
        {
            snake.StepForward(growNextStep: true);

            Assert.AreEqual(11, snake.HeadPosition.X);
            Assert.AreEqual(15, snake.HeadPosition.Y);
            Assert.AreEqual(4, snake.BodyParts.Count, "Length grows to 4 when food eaten");
        }
    }
}
