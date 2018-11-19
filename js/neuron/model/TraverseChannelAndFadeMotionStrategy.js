// Copyright 2014-2018, University of Colorado Boulder

/**
 * A motion strategy for traversing a basic membrane channel (i.e. one that has only one gate) and then fading away.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MathUtils = require( 'NEURON/neuron/common/MathUtils' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );
  var neuron = require( 'NEURON/neuron' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var TimedFadeAwayStrategy = require( 'NEURON/neuron/model/TimedFadeAwayStrategy' );
  var Vector2 = require( 'DOT/Vector2' );
  var WanderAwayThenFadeMotionStrategy = require( 'NEURON/neuron/model/WanderAwayThenFadeMotionStrategy' );

  /**
   * @param {MembraneChannel} channel
   * @param {number} startingLocationX
   * @param {number} startingLocationY
   * @param {number} maxVelocity
   * @constructor
   */
  function TraverseChannelAndFadeMotionStrategy( channel, startingLocationX, startingLocationY, maxVelocity ) {
    maxVelocity = maxVelocity || NeuronConstants.DEFAULT_MAX_VELOCITY;
    this.velocityVector = new Vector2();
    this.channel = channel;
    this.maxVelocity = maxVelocity;

    // Holds array of objects with x and y properties (doesn't use vector for performance reasons)
    // http://jsperf.com/object-notation-vs-constructor
    this.traversalPoints = this.createTraversalPoints( channel, startingLocationX, startingLocationY );
    this.currentDestinationIndex = 0;
    this.channelHasBeenEntered = false;

    this.startingLocationX = startingLocationX;
    this.startingLocationY = startingLocationY;

    this.setCourseForCurrentTraversalPoint( startingLocationX, startingLocationY );
  }

  neuron.register( 'TraverseChannelAndFadeMotionStrategy', TraverseChannelAndFadeMotionStrategy );

  return inherit( MotionStrategy, TraverseChannelAndFadeMotionStrategy, {

    // @public, @override
    move: function( movableModelElement, fadableModelElement, dt ) {

      var currentPositionRefX = movableModelElement.getPositionX();
      var currentPositionRefY = movableModelElement.getPositionY();

      if ( dt < 0 ) {
        return this.moveBack( movableModelElement, fadableModelElement, dt );
      }

      if ( !this.channelHasBeenEntered ) {
        // Update the flag the tracks whether this particle has made it to the channel and started traversing it.
        this.channelHasBeenEntered = this.channel.isPointInChannel( currentPositionRefX, currentPositionRefY );
      }

      if ( this.channel.isOpen() || this.channelHasBeenEntered ) {

        // The channel is open, or we are inside it or have gone all the way through, so keep executing this motion strategy.
        if ( this.currentDestinationIndex >= this.traversalPoints.length ||
             this.maxVelocity * dt < this.distanceBetweenPosAndTraversalPoint(
               currentPositionRefX,
               currentPositionRefY,
               this.traversalPoints[ this.currentDestinationIndex ] ) ) {

          // Move according to the current velocity.
          movableModelElement.setPosition( currentPositionRefX + this.velocityVector.x * dt,
            currentPositionRefY + this.velocityVector.y * dt );
        }
        else {

          // We are close enough to the destination that we should just position ourself there and update to the next
          // traversal point.
          movableModelElement.setPosition( this.traversalPoints[ this.currentDestinationIndex ].x,
            this.traversalPoints[ this.currentDestinationIndex ].y );
          this.currentDestinationIndex++;
          this.setCourseForCurrentTraversalPoint( movableModelElement.getPositionX(), movableModelElement.getPositionY() );
          if ( this.currentDestinationIndex === this.traversalPoints.length ) {
            // We have traversed through all points and are now
            // presumably on the other side of the membrane, so we need to
            // start fading out of existence.
            fadableModelElement.setFadeStrategy( new TimedFadeAwayStrategy( 0.002 ) );

            // Slow down the speed.  Don't do this if it is already
            // moving pretty slowly.
            if ( this.maxVelocity / NeuronConstants.DEFAULT_MAX_VELOCITY >= 0.5 ) {
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
     * The directional movement of the particle is guided by a set of predefined traversal points.  When a particle
     * reaches one of the traversal points, its direction and velocity is recalculated based on the next traversal
     * point's location.  When the particle goes back in time, the "currentDestinationIndex" which is the pointer to the
     * traversal points array needs to be decremented and when the traversal index reaches zero, original starting
     * location needs to be used for finding the reverse direction.
     * @param {Particle} movableModelElement
     * @param {Particle} fadableModelElement
     * @param {number} dt
     */
    moveBack: function( movableModelElement, fadableModelElement, dt ) {
      var currentPositionRefX = movableModelElement.getPositionX();
      var currentPositionRefY = movableModelElement.getPositionY();

      var traveledDistance = Math.abs( this.maxVelocity * dt );

      if ( this.channelHasBeenEntered ) {
        fadableModelElement.setOpacity( 1 );
      }
      else {
        fadableModelElement.setFadeStrategy( new TimedFadeAwayStrategy( 0.002 ) );
      }

      //check if it should change direction
      if ( this.currentDestinationIndex >= this.traversalPoints.length - 1 ) {
        var distBetweenPosAndCurrentTraversePoint = this.distanceBetweenPosAndTraversalPoint( currentPositionRefX, currentPositionRefY, this.traversalPoints[ this.currentDestinationIndex - 1 ] );
        if ( traveledDistance >= distBetweenPosAndCurrentTraversePoint ) {

          // The particle is near a traversal point, find the previous traversal point and set the particle's direction towards it.
          this.currentDestinationIndex = this.currentDestinationIndex - 1;
          if ( this.currentDestinationIndex >= 1 ) {
            movableModelElement.setPosition( this.traversalPoints[ this.currentDestinationIndex - 1 ].x, this.traversalPoints[ this.currentDestinationIndex - 1 ].y );
            this.setCourseForCurrentTraversalPoint( movableModelElement.getPositionX(), movableModelElement.getPositionY() );
          }
          else {
            movableModelElement.setPosition( this.traversalPoints[ 0 ].x, this.traversalPoints[ 0 ].y );
            this.setCourseForCurrentTraversalPoint( this.startingLocationX, this.startingLocationY );
            this.channelHasBeenEntered = !this.channelHasBeenEntered;
          }
        }
      }

      if ( this.currentDestinationIndex === 0 ) {
        //check if it has come close to original position, if yes remove the particle (going back in time before the particle is created)
        var distanceToOriginalPos = MathUtils.distanceBetween( currentPositionRefX, currentPositionRefY, this.startingLocationX, this.startingLocationY );
        if ( traveledDistance >= distanceToOriginalPos ) {
          fadableModelElement.continueExistingProperty.value = false;
          return;
        }
      }

      movableModelElement.setPosition( currentPositionRefX + this.velocityVector.x * dt,
        currentPositionRefY + this.velocityVector.y * dt );
    },

    /**
     * Create the points through which a particle must move when traversing
     * this channel.
     * @private
     */
    createTraversalPoints: function( channel, startingLocationX, startingLocationY ) {
      var points = [];
      var ctr = channel.getCenterLocation();
      var r = channel.getChannelSize().height * 0.65; // Make the point a little outside the channel.
      var outerOpeningLocation = { x: ctr.x + Math.cos( channel.getRotationalAngle() ) * r, y: ctr.y + Math.sin( channel.getRotationalAngle() ) * r };
      var innerOpeningLocation = { x: ctr.x - Math.cos( channel.getRotationalAngle() ) * r, y: ctr.y - Math.sin( channel.getRotationalAngle() ) * r };

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

    // @private
    setCourseForCurrentTraversalPoint: function( currentLocationX, currentLocationY ) {
      if ( this.currentDestinationIndex < this.traversalPoints.length ) {
        var dest = this.traversalPoints[ this.currentDestinationIndex ];
        this.velocityVector.setXY( dest.x - currentLocationX, dest.y - currentLocationY );
        var scaleFactor = this.maxVelocity / this.velocityVector.magnitude();
        this.velocityVector.multiplyScalar( scaleFactor );
      }
      else {
        // All points have been traversed.  Change the direction a bit in
        // order to make things look a little more "Brownian".
        this.velocityVector.rotate( ( phet.joist.random.nextDouble() - 0.5 ) * Math.PI * 0.9 );
      }
    },

    /**
     * @param {number} posX
     * @param {number} posY
     * @param {Object} traversalPoint - and object literal with x and y properties
     * @private
     */
    distanceBetweenPosAndTraversalPoint: function( posX, posY, traversalPoint ) {
      return MathUtils.distanceBetween( posX, posY, traversalPoint.x, traversalPoint.y );
    }

  } );
} );
