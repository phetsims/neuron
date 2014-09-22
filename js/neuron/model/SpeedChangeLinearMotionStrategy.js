//  Copyright 2002-2014, University of Colorado Boulder
/**
 * This is a very specialized motion strategy that is basically a linear
 * motion but that starts at one speed and then changes to another.  It was
 * created for a very specific application - getting particles to move quickly
 * away from the exit of a channel with an inactivation gate, and then slowing
 * down.  It may have other applications.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );

  function SpeedChangeLinearMotionStrategy( initialVelocity, speedScaleFactor, timeAtFirstSpeed ) {
    this.velocityVector = new Vector2( initialVelocity.x, initialVelocity.y );
    this.speedScaleFactor = speedScaleFactor;
    this.firstSpeedCountdownTimer = timeAtFirstSpeed;
  }

  return inherit( MotionStrategy, SpeedChangeLinearMotionStrategy, {
    move: function( movable, fadableModelElement, dt ) {
      movable.setPosition( movable.getPosition().x + this.velocityVector.x * dt,
          movable.getPosition().y + this.velocityVector.y * dt );
      if ( this.firstSpeedCountdownTimer > 0 ) {
        this.firstSpeedCountdownTimer -= dt;
        if ( this.firstSpeedCountdownTimer <= 0 ) {
          // Scale the speed.
          this.velocityVector.multiplyScalar( this.speedScaleFactor );
        }
      }
    }
  } );
} );



