// Copyright 2002-2011, University of Colorado

/**
 * A motion strategy for showing some slow Brownian motion, which is basically
 * just an occasional small jump from its initial location to a new nearby
 * location and then back.  This is intended to create noticable but
 * non-distracting motion that doesn't consume much processor time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';
  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );


  var MAX_JUMP_DISTANCE = 1; // In nanometers.
  var MIN_JUMP_DISTANCE = 0.1;  // In nanometers.
  var MIN_TIME_TO_NEXT_JUMP = 0.0009;  // In seconds of sim time, not wall time.
  var MAX_TIME_TO_NEXT_JUMP = 0.0015;  // In seconds of sim time, not wall time.

  var RAND = {nextDouble: function() {
    return Math.random();
  }};

  function SlowBrownianMotionStrategy( initialLocationX, initialLocationY ) {
    var thisStrategy = this;
    thisStrategy.initialLocationX = initialLocationX;
    thisStrategy.initialLocationY = initialLocationY;
    // In seconds of sim time.
    thisStrategy.timeUntilNextJump = this.generateNewJumpTime();
  }

  return inherit( MotionStrategy, SlowBrownianMotionStrategy, {

    //@Override
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
    generateNewJumpTime: function() {
      return MIN_TIME_TO_NEXT_JUMP + RAND.nextDouble() * (MAX_TIME_TO_NEXT_JUMP - MIN_TIME_TO_NEXT_JUMP);
    },
    generateNewJumpDistance: function() {
      return MIN_JUMP_DISTANCE + RAND.nextDouble() * (MAX_JUMP_DISTANCE - MIN_JUMP_DISTANCE);
    },
    generateNewJumpAngle: function() {
      return RAND.nextDouble() * Math.PI * 2;
    }
  } );
} );


