// Copyright 2014-2018, University of Colorado Boulder

/**
 * A motion strategy for showing some slow Brownian motion, which is basically just an occasional small jump from its
 * initial location to a new nearby location and then back.  This is intended to create noticeable but non-distracting
 * motion that doesn't consume much processor time.
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

  // constants
  const MAX_JUMP_DISTANCE = 1; // In nanometers.
  const MIN_JUMP_DISTANCE = 0.1;  // In nanometers.
  const MIN_TIME_TO_NEXT_JUMP = 0.0009;  // In seconds of sim time, not wall time.
  const MAX_TIME_TO_NEXT_JUMP = 0.0015;  // In seconds of sim time, not wall time.

  /**
   * @param {number} initialLocationX
   * @param {number} initialLocationY
   * @constructor
   */
  function SlowBrownianMotionStrategy( initialLocationX, initialLocationY ) {
    this.initialLocationX = initialLocationX;
    this.initialLocationY = initialLocationY;
    // In seconds of sim time.
    this.timeUntilNextJump = this.generateNewJumpTime();
  }

  neuron.register( 'SlowBrownianMotionStrategy', SlowBrownianMotionStrategy );

  return inherit( MotionStrategy, SlowBrownianMotionStrategy, {

    // @public, @override
    move: function( movableModelElement, fadableModelElement, dt ) {
      this.timeUntilNextJump -= dt;
      if ( this.timeUntilNextJump <= 0 ) {
        // It is time to jump.
        if ( movableModelElement.isPositionEqual( this.initialLocationX, this.initialLocationY ) ) {
          // Jump away from this location.
          const jumpAngle = this.generateNewJumpAngle();
          const jumpDistance = this.generateNewJumpDistance();
          const currentPosRefX = movableModelElement.getPositionX();
          const currentPosRefY = movableModelElement.getPositionY();
          movableModelElement.setPosition( currentPosRefX + jumpDistance * Math.cos( jumpAngle ),
            currentPosRefY + jumpDistance * Math.sin( jumpAngle ) );
        }
        else {
          // Jump back to initial location.
          movableModelElement.setPosition( this.initialLocationX, this.initialLocationY );
        }
        // Reset the jump counter time.
        this.timeUntilNextJump = this.generateNewJumpTime();
      }
    },

    // @private
    generateNewJumpTime: function() {
      return MIN_TIME_TO_NEXT_JUMP + phet.joist.random.nextDouble() * (MAX_TIME_TO_NEXT_JUMP - MIN_TIME_TO_NEXT_JUMP);
    },

    // @private
    generateNewJumpDistance: function() {
      return MIN_JUMP_DISTANCE + phet.joist.random.nextDouble() * (MAX_JUMP_DISTANCE - MIN_JUMP_DISTANCE);
    },

    // @private
    generateNewJumpAngle: function() {
      return phet.joist.random.nextDouble() * Math.PI * 2;
    }

  } );
} );
