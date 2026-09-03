using System;
using NUnit.Framework;
using NeonSnake.Core;

namespace NeonSnake.Tests
{
    [TestFixture]
    public class CollisionEngineTests
    {
        private CollisionEngine collisionEngine;

        [SetUp]
        public void Setup()
        {
            collisionEngine = new CollisionEngine(20, 30);
        }

        [Test]
        public void US801_IsWallCollisionDetectsOutOfBoundsPositions()
        {
            Assert.IsFalse(collisionEngine.IsWallCollision(new GridPosition(0, 0)), "Boundary (0,0) is valid");
            Assert.IsFalse(collisionEngine.IsWallCollision(new GridPosition(19, 29)), "Boundary (19,29) is valid");

            Assert.IsTrue(collisionEngine.IsWallCollision(new GridPosition(-1, 15)), "Negative X is wall collision");
            Assert.IsTrue(collisionEngine.IsWallCollision(new GridPosition(20, 15)), "X >= 20 is wall collision");
            Assert.IsTrue(collisionEngine.IsWallCollision(new GridPosition(10, -1)), "Negative Y is wall collision");
            Assert.IsTrue(collisionEngine.IsWallCollision(new GridPosition(10, 30)), "Y >= 30 is wall collision");
        }

        [Test]
        public void US801_IsSelfCollisionDetectsHeadBodyOverlap()
        {
            var snake = new SnakeController();
            snake.Initialize(new GridPosition(10, 15), 4, Direction.Right);

            // Head (10,15), Body [(9,15), (8,15), (7,15)] -> No collision initially
            Assert.IsFalse(collisionEngine.IsSelfCollision(snake.HeadPosition, snake.BodyParts));

            // Force head position to match body part index 2 (8,15)
            GridPosition collidingHead = new GridPosition(8, 15);
            Assert.IsTrue(collisionEngine.IsSelfCollision(collidingHead, snake.BodyParts), "Head matching body position is self-collision");
        }
    }
}
