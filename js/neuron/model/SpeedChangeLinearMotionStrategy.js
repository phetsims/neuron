// Copyright 2014-2019, University of Colorado Boulder
/**
 * This is a very specialized motion strategy that is basically a linear motion but that starts at one speed and then
 * changes to another.  It was created for a specific application - getting particles to move quickly away from the exit
 * of a channel with an inactivation gate, and then slowing down.  It may have other applications.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );
  const neuron = require( 'NEURON/neuron' );

  /**
   * @param {Vector2} initialVelocity
   * @param {number} speedScaleFactor
   * @param {number} timeAtFirstSpeed
   * @constructor
   */
  function SpeedChangeLinearMotionStrategy( initialVelocity, speedScaleFactor, timeAtFirstSpeed ) {
    this.velocityVectorX = initialVelocity.x;
    this.velocityVectorY = initialVelocity.y;
    this.speedScaleFactor = speedScaleFactor;
    this.firstSpeedCountdownTimer = timeAtFirstSpeed;
  }

  neuron.register( 'SpeedChangeLinearMotionStrategy', SpeedChangeLinearMotionStrategy );

  return inherit( MotionStrategy, SpeedChangeLinearMotionStrategy, {

    // @public, @override
    move: function( movable, fadableModelElement, dt ) {
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

  } );
} );
