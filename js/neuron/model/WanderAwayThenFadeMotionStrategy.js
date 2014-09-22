//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A motion strategy that has a particle wander around for a while and then
 * fade out of existence.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';
  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );
  var NeuronSharedConstants = require( 'NEURON/neuron/common/NeuronSharedConstants' );
  var TimedFadeAwayStrategy = require( 'NEURON/neuron/model/TimedFadeAwayStrategy' );


  var CLOCK_TICKS_BEFORE_MOTION_UPDATE = 5;
  var CLOCK_TICKS_BEFORE_VELOCITY_UPDATE = CLOCK_TICKS_BEFORE_MOTION_UPDATE * 10;
  var MOTION_UPDATE_PERIOD = NeuronSharedConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT * CLOCK_TICKS_BEFORE_MOTION_UPDATE;
  var VELOCITY_UPDATE_PERIOD = NeuronSharedConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT * CLOCK_TICKS_BEFORE_VELOCITY_UPDATE;
  var MIN_VELOCITY = 500;  // In nanometers per second of sim time.
  var MAX_VELOCITY = 5000; // In nanometers per second of sim time.

  var RAND = {nextDouble: function() {
    return Math.random();
  }, nextInt: function( bounds ) {
    return Math.floor( Math.random() * bounds );
  }};

  /**
   * Constructor.
   *
   * @param awayPoint       - Point that should be moved away from.
   * @param currentLocation - Starting location
   * @param preFadeTime     - Time before fade out starts, in sim time
   * @param fadeOutDuration - Time of fade out
   */
  function WanderAwayThenFadeMotionStrategy( awayPoint, currentLocation, preFadeTime, fadeOutDuration ) {

    this.awayPoint = awayPoint;
    this.preFadeCountdownTimer = preFadeTime;
    this.fadeOutDuration = fadeOutDuration;

    // Set up random offsets so that all the particles using this motion
    // strategy don't all get updated at the same time.
    this.motionUpdateCountdownTimer = RAND.nextInt( CLOCK_TICKS_BEFORE_MOTION_UPDATE ) * NeuronSharedConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT;
    this.velocityUpdateCountdownTimer = RAND.nextInt( CLOCK_TICKS_BEFORE_VELOCITY_UPDATE ) * NeuronSharedConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT;

    // Set an initial velocity and direction.
    this.updateVelocity( currentLocation );
  }

  return inherit( MotionStrategy, WanderAwayThenFadeMotionStrategy, {

    //@Override
    move: function( movableModelElement, fadableModelElement, dt ) {

      this.motionUpdateCountdownTimer -= dt;
      if ( this.motionUpdateCountdownTimer <= 0 ) {
        // Time to update the motion.
        movableModelElement.setPosition(
            movableModelElement.getPositionReference().x + this.velocity.x * MOTION_UPDATE_PERIOD,
            movableModelElement.getPositionReference().y + this.velocity.y * MOTION_UPDATE_PERIOD );

        this.motionUpdateCountdownTimer = MOTION_UPDATE_PERIOD;
      }

      this.velocityUpdateCountdownTimer -= dt;
      if ( this.velocityUpdateCountdownTimer <= 0 ) {
        // Time to update the velocity.
        this.updateVelocity( movableModelElement.getPositionReference() );
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
    updateVelocity: function( currentPosition ) {
      // Create a velocity vector that causes this to move away from the "away point".
      var awayAngle = Math.atan2( currentPosition.y - this.awayPoint.y,
          currentPosition.x - this.awayPoint.x ) + ( RAND.nextDouble() - 0.5 ) * Math.PI;
      var newScalerVelocity = MIN_VELOCITY + RAND.nextDouble() * ( MAX_VELOCITY - MIN_VELOCITY );
      this.velocity.setXY( newScalerVelocity * Math.cos( awayAngle ), newScalerVelocity * Math.sin( awayAngle ) );
    }

  } );
} );

//// Copyright 2002-2012, University of Colorado
//package edu.colorado.phet.neuron.model;
//
//import java.awt.geom.Point2D;
//import java.util.Random;
//
//import edu.colorado.phet.common.phetcommon.math.vector.MutableVector2D;
//import edu.colorado.phet.neuron.module.NeuronDefaults;
//
//
///**
// * A motion strategy that has a particle wander around for a while and then
// * fade out of existence.
// *
// * @author John Blanco
// */
//public class WanderAwayThenFadeMotionStrategy extends MotionStrategy {
//

//
//  private final Point2D awayPoint;
//
//  private double motionUpdateCountdownTimer;
//  private double velocityUpdateCountdownTimer;
//  private double preFadeCountdownTimer;
//  private double fadeOutDuration;
//  private MutableVector2D velocity = new MutableVector2D();
//

//  public WanderAwayThenFadeMotionStrategy( Point2D awayPoint, Point2D currentLocation, double preFadeTime,
//    double fadeOutDuration ) {
//

//  }
//

//

//}
