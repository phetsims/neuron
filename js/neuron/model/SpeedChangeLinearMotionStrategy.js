// Copyright 2014-2020, University of Colorado Boulder
/**
 * This is a very specialized motion strategy that is basically a linear motion but that starts at one speed and then
 * changes to another.  It was created for a specific application - getting particles to move quickly away from the exit
 * of a channel with an inactivation gate, and then slowing down.  It may have other applications.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import MotionStrategy from './MotionStrategy.js';

class SpeedChangeLinearMotionStrategy extends MotionStrategy {

  /**
   * @param {Vector2} initialVelocity
   * @param {number} speedScaleFactor
   * @param {number} timeAtFirstSpeed
   */
  constructor( initialVelocity, speedScaleFactor, timeAtFirstSpeed ) {
    super();
    this.velocityVectorX = initialVelocity.x;
    this.velocityVectorY = initialVelocity.y;
    this.speedScaleFactor = speedScaleFactor;
    this.firstSpeedCountdownTimer = timeAtFirstSpeed;
  }

  // @public, @override
  move( movable, fadableModelElement, dt ) {
    movable.setPosition( movable.getPositionX() + this.velocityVectorX * dt,
      movable.getPositionY() + this.velocityVectorY * dt );
    if ( this.firstSpeedCountdownTimer > 0 ) {
      this.firstSpeedCountdownTimer -= dt;
      if ( this.firstSpeedCountdownTimer <= 0 ) {
        // Scale the speed.
        this.velocityVectorX = this.velocityVectorX * this.speedScaleFactor;
        this.velocityVectorY = this.velocityVectorY * this.speedScaleFactor;
      }
    }
  }
}

neuron.register( 'SpeedChangeLinearMotionStrategy', SpeedChangeLinearMotionStrategy );

export default SpeedChangeLinearMotionStrategy;