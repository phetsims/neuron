//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A motion strategy for traversing a basic membrane channel, i.e. one that
 * has only one gate, and then fading away.
 *
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';
  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var MembraneTraversalMotionStrategy = require( 'NEURON/neuron/model/MembraneTraversalMotionStrategy' );
  var WanderAwayThenFadeMotionStrategy = require( 'NEURON/neuron/model/WanderAwayThenFadeMotionStrategy' );
  var TimedFadeAwayStrategy = require( 'NEURON/neuron/model/TimedFadeAwayStrategy' );
  var MathUtils = require( 'NEURON/neuron/utils/MathUtils' );


  var RAND = {nextDouble: function() {
    return Math.random();
  }};

  /**
   *
   * @param channel
   * @param startingLocationX
   * @param startingLocationY
   * @param maxVelocity
   * @constructor
   */
  function TraverseChannelAndFadeMotionStrategy( channel, startingLocationX, startingLocationY, maxVelocity ) {
    maxVelocity = maxVelocity || MembraneTraversalMotionStrategy.DEFAULT_MAX_VELOCITY;
    this.velocityVector = new Vector2();
    this.channel = channel;
    this.maxVelocity = maxVelocity;

    // Holds array of objects with x and y properties (doesn't use vector for performance reasons)
    // http://jsperf.com/object-notation-vs-constructor
    this.traversalPoints = this.createTraversalPoints( channel, startingLocationX, startingLocationY );
    this.currentDestinationIndex = 0;
    this.channelHasBeenEntered = false;


    this.setCourseForCurrentTraversalPoint( startingLocationX, startingLocationY );
  }

  return inherit( MembraneTraversalMotionStrategy, TraverseChannelAndFadeMotionStrategy, {

    //@Override
    move: function( movableModelElement, fadableModelElement, dt ) {

      var currentPositionRefX = movableModelElement.getPositionX();
      var currentPositionRefY = movableModelElement.getPositionY();

      if ( !this.channelHasBeenEntered ) {
        // Update the flag the tracks whether this particle has made it
        // to the channel and started traversing it.
        this.channelHasBeenEntered = this.channel.isPointInChannel( currentPositionRefX, currentPositionRefY );
      }

      if ( this.channel.isOpen() || this.channelHasBeenEntered ) {
        // The channel is open, or we are inside it or have gone all the
        // way through, so keep executing this motion strategy.
        if ( this.currentDestinationIndex >= this.traversalPoints.length || this.maxVelocity * dt < this.distanceBetweenPosAndTraversalPoint( currentPositionRefX, currentPositionRefY, this.traversalPoints[ this.currentDestinationIndex] ) ) {
          // Move according to the current velocity.
          movableModelElement.setPosition( currentPositionRefX + this.velocityVector.x * dt,
              currentPositionRefY + this.velocityVector.y * dt );
        }
        else {
          // We are close enough to the destination that we should just
          // position ourself there and update to the next traversal point.
          movableModelElement.setPosition( this.traversalPoints[ this.currentDestinationIndex].x, this.traversalPoints[ this.currentDestinationIndex].y );
          this.currentDestinationIndex++;
          this.setCourseForCurrentTraversalPoint( movableModelElement.getPositionX(), movableModelElement.getPositionY() );
          if ( this.currentDestinationIndex === this.traversalPoints.length ) {
            // We have traversed through all points and are now
            // presumably on the other side of the membrane, so we need to
            // start fading out of existence.
            fadableModelElement.setFadeStrategy( new TimedFadeAwayStrategy( 0.002 ) );

            // Slow down the speed.  Don't do this if it is already
            // moving pretty slowly.
            if ( this.maxVelocity / MembraneTraversalMotionStrategy.DEFAULT_MAX_VELOCITY >= 0.5 ) {
              this.velocityVector.multiplyScalar( 0.2 );
            }
          }
        }
      }
      else {
        // The channel has closed and this element has not yet entered it.
        // Time to replace this motion strategy with a different one.
        movableModelElement.setMotionStrategy( new WanderAwayThenFadeMotionStrategy( this.channel.getCenterLocation(),
          movableModelElement.getPositionX(), movableModelElement.getPositionY(), 0, 0.002 ) );
      }
    },
    /**
     * Create the points through which a particle must move when traversing
     * this channel.
     *
     * @param channel
     * @param startingLocation
     * @return
     */
    createTraversalPoints: function( channel, startingLocationX, startingLocationY ) {
      var points = [];
      var ctr = channel.getCenterLocation();
      var r = channel.getChannelSize().height * 0.65; // Make the point a little outside the channel.
      var outerOpeningLocation = {x: ctr.x + Math.cos( channel.getRotationalAngle() ) * r, y: ctr.y + Math.sin( channel.getRotationalAngle() ) * r };
      var innerOpeningLocation = {x: ctr.x - Math.cos( channel.getRotationalAngle() ) * r, y: ctr.y - Math.sin( channel.getRotationalAngle() ) * r };

      if ( this.distanceBetweenPosAndTraversalPoint( startingLocationX, startingLocationY, innerOpeningLocation ) < this.distanceBetweenPosAndTraversalPoint( startingLocationX, startingLocationY, outerOpeningLocation ) ) {
        points.push( innerOpeningLocation );
        points.push( outerOpeningLocation );
      }
      else {
        points.push( outerOpeningLocation );
        points.push( innerOpeningLocation );
      }

      return points;
    },
    setCourseForCurrentTraversalPoint: function( currentLocationX, currentLocationY ) {
      if ( this.currentDestinationIndex < this.traversalPoints.length ) {
        var dest = this.traversalPoints[this.currentDestinationIndex];
        this.velocityVector.setXY( dest.x - currentLocationX, dest.y - currentLocationY );
        var scaleFactor = this.maxVelocity / this.velocityVector.magnitude();
        this.velocityVector.multiplyScalar( scaleFactor );
      }
      else {
        // All points have been traversed.  Change the direction a bit in
        // order to make things look a little more "Brownian".
        this.velocityVector.rotate( ( RAND.nextDouble() - 0.5 ) * Math.PI * 0.9 );
      }
    },

    /**
     * @param xPos
     * @param yPos
     * @param travelsalPoint (object literal with x and y properties)
     */
    distanceBetweenPosAndTraversalPoint: function( posX, posY, travelsalPoint ) {
      return  MathUtils.distanceBetween( posX, posY, travelsalPoint.x, travelsalPoint.y );
    }

  } );
} );
//// Copyright 2002-2012, University of Colorado
//package edu.colorado.phet.neuron.model;
//
//import java.awt.geom.Point2D;
//import java.util.ArrayList;
//import java.util.Random;
//
//import edu.colorado.phet.common.phetcommon.math.vector.MutableVector2D;
//

// * @author John Blanco
// */
//public class TraverseChannelAndFadeMotionStrategy extends MembraneTraversalMotionStrategy {
//
//  private static final Random RAND = new Random();
//  private MutableVector2D velocityVector = new MutableVector2D();
//  private ArrayList<Point2D> traversalPoints;
//  private int currentDestinationIndex = 0;
//  private boolean channelHasBeenEntered = false; // Flag that is set when the channel is entered.
//  private double maxVelocity;
//  protected final MembraneChannel channel;
//
//  public TraverseChannelAndFadeMotionStrategy( MembraneChannel channel, Point2D startingLocation, double maxVelocity ) {
//    this.channel = channel;
//    this.maxVelocity = maxVelocity;
//    traversalPoints = createTraversalPoints( channel, startingLocation );
//    currentDestinationIndex = 0;
//    setCourseForCurrentTraversalPoint( startingLocation );
//  }
//
//  public TraverseChannelAndFadeMotionStrategy( MembraneChannel channel, Point2D startingLocation ) {
//    this( channel, startingLocation, DEFAULT_MAX_VELOCITY );
//  }
//
//
//
//

//}
