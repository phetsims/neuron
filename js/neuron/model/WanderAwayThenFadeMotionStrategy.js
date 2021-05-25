// Copyright 2014-2021, University of Colorado Boulder

/**
 * A motion strategy that has a particle wander around for a while and then fade out of existence.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import MotionStrategy from './MotionStrategy.js';
import TimedFadeAwayStrategy from './TimedFadeAwayStrategy.js';

// constants
const CLOCK_TICKS_BEFORE_POSITION_UPDATE = 5;
const CLOCK_TICKS_BEFORE_VELOCITY_UPDATE = CLOCK_TICKS_BEFORE_POSITION_UPDATE * 20;
const POSITION_UPDATE_PERIOD = NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT * CLOCK_TICKS_BEFORE_POSITION_UPDATE;
const VELOCITY_UPDATE_PERIOD = NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT * CLOCK_TICKS_BEFORE_VELOCITY_UPDATE;
const MIN_VELOCITY = 1000;  // In nanometers per second of sim time.
const MAX_VELOCITY = 5000; // In nanometers per second of sim time.

const RAND = {
  nextInt: bounds => Math.floor( dotRandom.nextDouble() * bounds )
};

class WanderAwayThenFadeMotionStrategy extends MotionStrategy {

  /**
   * @param {Vector2} awayPoint - Point that should be moved away from.
   * @param {number} currentPositionX - Starting x position
   * @param {number} currentPositionY - Starting y position
   * @param {number} preFadeTime     - Time before fade out starts, in sim time
   * @param {number} fadeOutDuration - Time of fade out
   */
  constructor( awayPoint, currentPositionX, currentPositionY, preFadeTime, fadeOutDuration ) {

    super();
    this.awayPoint = awayPoint;
    this.preFadeCountdownTimer = preFadeTime;
    this.fadeOutDuration = fadeOutDuration;

    // Set up random offsets so that all the particles using this motion strategy don't all get updated at the same time.
    this.motionUpdateCountdownTimer = RAND.nextInt( CLOCK_TICKS_BEFORE_POSITION_UPDATE ) * NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT;
    this.velocityUpdateCountdownTimer = RAND.nextInt( CLOCK_TICKS_BEFORE_VELOCITY_UPDATE ) * NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT;

    this.velocityX = 0;
    this.velocityY = 0;

    // Set an initial velocity and direction.
    this.updateVelocity( currentPositionX, currentPositionY );
  }

  // @public, @override
  move( movableModelElement, fadableModelElement, dt ) {

    this.motionUpdateCountdownTimer -= dt;
    if ( this.motionUpdateCountdownTimer <= 0 ) {
      // Time to update the motion.
      movableModelElement.setPosition(
        movableModelElement.getPositionX() + this.velocityX * POSITION_UPDATE_PERIOD,
        movableModelElement.getPositionY() + this.velocityY * POSITION_UPDATE_PERIOD );

      this.motionUpdateCountdownTimer = POSITION_UPDATE_PERIOD;
    }

    this.velocityUpdateCountdownTimer -= dt;
    if ( this.velocityUpdateCountdownTimer <= 0 ) {
      // Time to update the velocity.
      this.updateVelocity( movableModelElement.getPositionX(), movableModelElement.getPositionY() );
      this.velocityUpdateCountdownTimer = VELOCITY_UPDATE_PERIOD;
    }

    if ( this.preFadeCountdownTimer >= 0 ) {
      this.preFadeCountdownTimer -= dt;
      if ( this.preFadeCountdownTimer <= 0 ) {
        // Time to start the fade out.
        fadableModelElement.setFadeStrategy( new TimedFadeAwayStrategy( this.fadeOutDuration ) );
      }
    }
  }

  // @private
  updateVelocity( currentPositionX, currentPositionY ) {
    // Create a velocity vector that causes this to move away from the "away point".
    const awayAngle = Math.atan2( currentPositionY - this.awayPoint.y,
      currentPositionX - this.awayPoint.x ) + ( dotRandom.nextDouble() - 0.5 ) * Math.PI;
    const newScalerVelocity = MIN_VELOCITY + dotRandom.nextDouble() * ( MAX_VELOCITY - MIN_VELOCITY );
    this.velocityX = newScalerVelocity * Math.cos( awayAngle );
    this.velocityY = newScalerVelocity * Math.sin( awayAngle );
  }
}

neuron.register( 'WanderAwayThenFadeMotionStrategy', WanderAwayThenFadeMotionStrategy );

export default WanderAwayThenFadeMotionStrategy;
