// Copyright 2014-2021, University of Colorado Boulder

/**
 * A motion strategy for showing some slow Brownian motion, which is basically just an occasional small jump from its
 * initial position to a new nearby position and then back.  This is intended to create noticeable but non-distracting
 * motion that doesn't consume much processor time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import neuron from '../../neuron.js';
import MotionStrategy from './MotionStrategy.js';

// constants
const MAX_JUMP_DISTANCE = 1; // In nanometers.
const MIN_JUMP_DISTANCE = 0.1;  // In nanometers.
const MIN_TIME_TO_NEXT_JUMP = 0.0009;  // In seconds of sim time, not wall time.
const MAX_TIME_TO_NEXT_JUMP = 0.0015;  // In seconds of sim time, not wall time.

class SlowBrownianMotionStrategy extends MotionStrategy {

  /**
   * @param {number} initialPositionX
   * @param {number} initialPositionY
   */
  constructor( initialPositionX, initialPositionY ) {
    super();
    this.initialPositionX = initialPositionX;
    this.initialPositionY = initialPositionY;
    // In seconds of sim time.
    this.timeUntilNextJump = this.generateNewJumpTime();
  }

  // @public, @override
  move( movableModelElement, fadableModelElement, dt ) {
    this.timeUntilNextJump -= dt;
    if ( this.timeUntilNextJump <= 0 ) {
      // It is time to jump.
      if ( movableModelElement.isPositionEqual( this.initialPositionX, this.initialPositionY ) ) {
        // Jump away from this position.
        const jumpAngle = this.generateNewJumpAngle();
        const jumpDistance = this.generateNewJumpDistance();
        const currentPosRefX = movableModelElement.getPositionX();
        const currentPosRefY = movableModelElement.getPositionY();
        movableModelElement.setPosition( currentPosRefX + jumpDistance * Math.cos( jumpAngle ),
          currentPosRefY + jumpDistance * Math.sin( jumpAngle ) );
      }
      else {
        // Jump back to initial position.
        movableModelElement.setPosition( this.initialPositionX, this.initialPositionY );
      }
      // Reset the jump counter time.
      this.timeUntilNextJump = this.generateNewJumpTime();
    }
  }

  // @private
  generateNewJumpTime() {
    return MIN_TIME_TO_NEXT_JUMP + dotRandom.nextDouble() * ( MAX_TIME_TO_NEXT_JUMP - MIN_TIME_TO_NEXT_JUMP );
  }

  // @private
  generateNewJumpDistance() {
    return MIN_JUMP_DISTANCE + dotRandom.nextDouble() * ( MAX_JUMP_DISTANCE - MIN_JUMP_DISTANCE );
  }

  // @private
  generateNewJumpAngle() {
    return dotRandom.nextDouble() * Math.PI * 2;
  }
}

neuron.register( 'SlowBrownianMotionStrategy', SlowBrownianMotionStrategy );

export default SlowBrownianMotionStrategy;
