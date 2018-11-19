// Copyright 2014-2018, University of Colorado Boulder

/**
 * A motion strategy that has a particle wander around for a while and then fade out of existence.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );
  var neuron = require( 'NEURON/neuron' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var TimedFadeAwayStrategy = require( 'NEURON/neuron/model/TimedFadeAwayStrategy' );

  // constants
  var CLOCK_TICKS_BEFORE_POSITION_UPDATE = 5;
  var CLOCK_TICKS_BEFORE_VELOCITY_UPDATE = CLOCK_TICKS_BEFORE_POSITION_UPDATE * 20;
  var POSITION_UPDATE_PERIOD = NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT * CLOCK_TICKS_BEFORE_POSITION_UPDATE;
  var VELOCITY_UPDATE_PERIOD = NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT * CLOCK_TICKS_BEFORE_VELOCITY_UPDATE;
  var MIN_VELOCITY = 1000;  // In nanometers per second of sim time.
  var MAX_VELOCITY = 5000; // In nanometers per second of sim time.

  var RAND = {
    nextInt: function( bounds ) {
      return Math.floor( phet.joist.random.nextDouble() * bounds );
    }
  };

  /**
   * @param {Vector2} awayPoint - Point that should be moved away from.
   * @param {number} currentLocationX - Starting locationX
   * @param {number} currentLocationY - Starting locationY
   * @param {number} preFadeTime     - Time before fade out starts, in sim time
   * @param {number} fadeOutDuration - Time of fade out
   * @constructor
   */
  function WanderAwayThenFadeMotionStrategy( awayPoint, currentLocationX, currentLocationY, preFadeTime, fadeOutDuration ) {

    this.awayPoint = awayPoint;
    this.preFadeCountdownTimer = preFadeTime;
    this.fadeOutDuration = fadeOutDuration;

    // Set up random offsets so that all the particles using this motion strategy don't all get updated at the same time.
    this.motionUpdateCountdownTimer = RAND.nextInt( CLOCK_TICKS_BEFORE_POSITION_UPDATE ) * NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT;
    this.velocityUpdateCountdownTimer = RAND.nextInt( CLOCK_TICKS_BEFORE_VELOCITY_UPDATE ) * NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT;

    this.velocityX = 0;
    this.velocityY = 0;

    // Set an initial velocity and direction.
    this.updateVelocity( currentLocationX, currentLocationY );
  }

  neuron.register( 'WanderAwayThenFadeMotionStrategy', WanderAwayThenFadeMotionStrategy );

  return inherit( MotionStrategy, WanderAwayThenFadeMotionStrategy, {

    // @public, @override
    move: function( movableModelElement, fadableModelElement, dt ) {

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
    },

    // @private
    updateVelocity: function( currentPositionX, currentPositionY ) {
      // Create a velocity vector that causes this to move away from the "away point".
      var awayAngle = Math.atan2( currentPositionY - this.awayPoint.y,
          currentPositionX - this.awayPoint.x ) + ( phet.joist.random.nextDouble() - 0.5 ) * Math.PI;
      var newScalerVelocity = MIN_VELOCITY + phet.joist.random.nextDouble() * ( MAX_VELOCITY - MIN_VELOCITY );
      this.velocityX = newScalerVelocity * Math.cos( awayAngle );
      this.velocityY = newScalerVelocity * Math.sin( awayAngle );
    }

  } );
} );

