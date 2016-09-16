// Copyright 2014-2015, University of Colorado Boulder

/**
 * A motion strategy for showing some slow Brownian motion, which is basically just an occasional small jump from its
 * initial location to a new nearby location and then back.  This is intended to create noticeable but non-distracting
 * motion that doesn't consume much processor time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );

  // constants
  var MAX_JUMP_DISTANCE = 1; // In nanometers.
  var MIN_JUMP_DISTANCE = 0.1;  // In nanometers.
  var MIN_TIME_TO_NEXT_JUMP = 0.0009;  // In seconds of sim time, not wall time.
  var MAX_TIME_TO_NEXT_JUMP = 0.0015;  // In seconds of sim time, not wall time.

  /**
   * @param {number} initialLocationX
   * @param {number} initialLocationY
   * @constructor
   */
  function SlowBrownianMotionStrategy( initialLocationX, initialLocationY ) {
    var self = this;
    self.initialLocationX = initialLocationX;
    self.initialLocationY = initialLocationY;
    // In seconds of sim time.
    self.timeUntilNextJump = this.generateNewJumpTime();
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
          var jumpAngle = this.generateNewJumpAngle();
          var jumpDistance = this.generateNewJumpDistance();
          var currentPosRefX = movableModelElement.getPositionX();
          var currentPosRefY = movableModelElement.getPositionY();
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
      return MIN_TIME_TO_NEXT_JUMP + Math.random() * (MAX_TIME_TO_NEXT_JUMP - MIN_TIME_TO_NEXT_JUMP);
    },

    // @private
    generateNewJumpDistance: function() {
      return MIN_JUMP_DISTANCE + Math.random() * (MAX_JUMP_DISTANCE - MIN_JUMP_DISTANCE);
    },

    // @private
    generateNewJumpAngle: function() {
      return Math.random() * Math.PI * 2;
    }

  } );
} );
