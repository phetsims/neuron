// Copyright 2002-2014, University of Colorado Boulder
/**
 * A motion strategy for traversing through a dual-gated channel, meaning one
 * that has a gate and an inactivation level.
 * <p/>
 * This strategy makes several assumptions about the nature of the dual-gate
 * channel and how it is portrayed.  These assumptions depend both on the
 * model representation and the view representation of the dual-gated channel.
 * If changes are made to either, this class may need to be revised.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var WanderAwayThenFadeMotionStrategy = require( 'NEURON/neuron/model/WanderAwayThenFadeMotionStrategy' );
  var TimedFadeAwayStrategy = require( 'NEURON/neuron/model/TimedFadeAwayStrategy' );
  var SpeedChangeLinearMotionStrategy = require( 'NEURON/neuron/model/SpeedChangeLinearMotionStrategy' );
  var LinearMotionStrategy = require( 'NEURON/neuron/model/LinearMotionStrategy' );
  var MathUtils = require( 'NEURON/neuron/utils/MathUtils' );

  // Threshold at which particles will "bounce" back out of the channel
  // rather than traversing it.
  var INACTIVATION_BOUNCE_THRESHOLD = 0.5;

  /**
   *
   * @param {MembraneChannel} channel
   * @param {number} startingLocationX
   * @param {number} startingLocationY
   * @param {number} maxVelocity
   * @constructor
   */
  function DualGateChannelTraversalMotionStrategy( channel, startingLocationX, startingLocationY, maxVelocity ) {
    maxVelocity = maxVelocity || NeuronConstants.DEFAULT_MAX_VELOCITY;
    this.velocityVector = new Vector2();
    this.channel = channel;
    this.maxVelocity = maxVelocity;

    // Holds array of objects with x and y properties (doesn't use vector for performance reasons)
    // http://jsperf.com/object-notation-vs-constructor
    this.traversalPoints = this.createTraversalPoints( channel, startingLocationX, startingLocationY );
    this.currentDestinationIndex = 0;
    this.bouncing = false;
    this.setCourseForCurrentTraversalPoint( startingLocationX, startingLocationY );
  }

  return inherit( MotionStrategy, DualGateChannelTraversalMotionStrategy, {

    //@Override
    move: function( movableModelElement, fadableModelElement, dt ) {
      assert && assert( this.currentDestinationIndex < this.traversalPoints.length );  // Error checking.
      var angularRange = 0;
      var currentPositionRefX = movableModelElement.getPositionX();
      var currentPositionRefY = movableModelElement.getPositionY();

      if ( this.currentDestinationIndex === 0 ) {
        // Currently moving towards the first destination point.  Is the
        // channel still open?
        if ( !this.channel.isOpen() ) {
          // The channel has closed, so there is no sense in continuing
          // towards it.  The particle should wander and then fade out.
          movableModelElement.setMotionStrategy( new WanderAwayThenFadeMotionStrategy( this.channel.getCenterLocation(), movableModelElement.getPositionX(), movableModelElement.getPositionY(), 0, 0.002 ) );
          // For error checking, set the destination index really high.
          // That way it will be detected if this strategy instance is
          // used again.
          this.currentDestinationIndex = Number.MAX_VALUE;
        }
        else if ( this.distanceBetweenPosAndTraversalPoint( currentPositionRefX, currentPositionRefY, this.traversalPoints[ this.currentDestinationIndex ] ) < this.velocityVector.magnitude() * dt ) {
          // We have arrived at the first traversal point, so now start
          // heading towards the second.
          movableModelElement.setPosition( this.traversalPoints[ this.currentDestinationIndex ].x, this.traversalPoints[ this.currentDestinationIndex ].y );
          this.currentDestinationIndex++;
          this.setCourseForPoint( movableModelElement.getPositionX(), movableModelElement.getPositionY(), this.traversalPoints[ this.currentDestinationIndex ],
            this.velocityVector.magnitude() );
        }
        else {
          // Keep moving towards current destination.
          this.moveBasedOnCurrentVelocity( movableModelElement, dt );
        }
      }
      else if ( this.currentDestinationIndex === 1 ) {
        // Currently moving towards the 2nd point, which is in the
        // channel just above where the inactivation gate appears.
        if ( this.channel.getInactivationAmt() > INACTIVATION_BOUNCE_THRESHOLD ) {
          // The inactivation threshold has been reached, so we can't
          // finish traversing the channel and need to bounce.  Check
          // whether we've already handled this.
          if ( !this.bouncing ) {
            // Set the particle up to "bounce", i.e. to turn around
            // and go back whence it came once it reaches the 2nd
            // point.
            this.traversalPoints[ 2 ].x = this.traversalPoints[ 0 ].x;
            this.traversalPoints[ 2 ].y = this.traversalPoints[ 0 ].y;

            this.bouncing = true; // Flag for tracking that we need to bounce.
          }
        }
        if ( this.distanceBetweenPosAndTraversalPoint( currentPositionRefX, currentPositionRefY, this.traversalPoints[ this.currentDestinationIndex ] ) < this.velocityVector.magnitude() * dt ) {
          // The element has reached the current traversal point, so
          // it should start moving towards the next.
          movableModelElement.setPosition( this.traversalPoints[ this.currentDestinationIndex ].x, this.traversalPoints[ this.currentDestinationIndex ].y );
          this.currentDestinationIndex++;
          this.setCourseForPoint( movableModelElement.getPositionX(), movableModelElement.getPositionY(), this.traversalPoints[ this.currentDestinationIndex ],
            this.velocityVector.magnitude() );
          if ( this.bouncing ) {
            // Slow down if we are bouncing - it looks better this way.
            this.velocityVector.multiplyScalar( 0.5 );
          }
        }
        else {
          // Keep moving towards current destination.
          this.moveBasedOnCurrentVelocity( movableModelElement, dt );
        }
      }
      else if ( this.currentDestinationIndex === 2 ) {
        // Currently moving towards the 3rd point.
        if ( this.distanceBetweenPosAndTraversalPoint( currentPositionRefX, currentPositionRefY, this.traversalPoints[ this.currentDestinationIndex ] ) < this.velocityVector.magnitude() * dt ) {
          // The element has reached the last traversal point, so a
          // new motion strategy is set to have it move away and then
          // fade out.

          movableModelElement.setPosition( this.traversalPoints[ this.currentDestinationIndex ].x, this.traversalPoints[ this.currentDestinationIndex ].y );
          this.currentDestinationIndex = Number.MAX_VALUE;
          var newVelocityVector = new Vector2( this.velocityVector.x, this.velocityVector.y );
          if ( this.bouncing ) {
            // This particle should be back where it entered the
            // channel, and can head off in any direction except
            // back toward the membrane.
            newVelocityVector.rotate( ( Math.random() - 0.5 ) * Math.PI );
            newVelocityVector.multiplyScalar( 0.3 + ( Math.random() * 0.2 ) );
            movableModelElement.setMotionStrategy( new LinearMotionStrategy( newVelocityVector ) );
          }
          else {
            // The particle is existing the part of the channel where
            // the inactivation gate exists, so it needs to take on a
            // new course that avoids the gate.  Note that this is set
            // up to work with a specific representation of the
            // inactivation gate, and will need to be changed if the
            // representation of the gate is changed.
            newVelocityVector.multiplyScalar( 0.5 + ( Math.random() * 0.3 ) );
            var maxRotation, minRotation;
            if ( Math.random() > 0.3 ) {
              // Move out to the right (assuming channel is vertical).
              // The angle at which we can move gets more restricted
              // as the inactivation gate closes.
              maxRotation = Math.PI * 0.4;
              angularRange = ( 1 - this.channel.getInactivationAmt() ) * Math.PI * 0.3;
              minRotation = maxRotation - angularRange;
            }
            else {
              // Move out to the left (assuming channel is vertical).
              // The angle at which we can move gets more restricted
              // as the inactivation gate closes.
              maxRotation = -Math.PI * 0.4;
              angularRange = ( 1 - this.channel.getInactivationAmt() ) * -Math.PI * 0.1;
              minRotation = maxRotation - angularRange;
            }
            newVelocityVector.rotate( minRotation + Math.random() * ( maxRotation - minRotation ) );
            movableModelElement.setMotionStrategy( new SpeedChangeLinearMotionStrategy( newVelocityVector, 0.2, 0.0002 ) );
          }
          fadableModelElement.setFadeStrategy( new TimedFadeAwayStrategy( 0.003 ) );
        }
        else {
          // Keep moving towards current destination.
          this.moveBasedOnCurrentVelocity( movableModelElement, dt );
        }
      }
    },

    /**
     * @param posX
     * @param posY
     * @param traversalPoint (object literal with x and y properties)
     */
    distanceBetweenPosAndTraversalPoint: function( posX, posY, traversalPoint ) {
      return MathUtils.distanceBetween( posX, posY, traversalPoint.x, traversalPoint.y );
    },

    moveBasedOnCurrentVelocity: function( movable, dt ) {
      movable.setPosition( movable.getPositionX() + this.velocityVector.x * dt,
        movable.getPositionY() + this.velocityVector.y * dt );
    },

    /**
     * Create the points through which a particle must move when traversing
     * this channel.
     *
     * @param channel
     * @param startingLocationX
     * @param startingLocationY
     * @return
     */
    createTraversalPoints: function( channel, startingLocationX, startingLocationY ) {
      var points = [];
      var ctr = channel.getCenterLocation();
      var r = channel.getChannelSize().height * 0.5;

      // The profiler shows too many vector instances are created from createTravesal method, Since we are dealing with 1000s of particles,for
      // performance reasons and to reduce memory allocation, changing vector constructor function to use object literal
      // http://jsperf.com/object-notation-vs-constructor

      // Create points that represent the inner and outer mouths of the channel.
      var outerOpeningLocation = { x: ctr.x + Math.cos( channel.getRotationalAngle() ) * r, y: ctr.y + Math.sin( channel.getRotationalAngle() ) * r };
      var innerOpeningLocation = { x: ctr.x - Math.cos( channel.getRotationalAngle() ) * r, y: ctr.y - Math.sin( channel.getRotationalAngle() ) * r };

      // Create a point that just above where the inactivation gate would
      // be if the channel were inactivated.  Since the model doesn't
      // actually track the location of the inactivation gate (it is left
      // up to the view), this location is a guess, and may have to be
      // tweaked in order to work well with the view.
      var aboveInactivationGateLocation =
      { x: ctr.x - Math.cos( channel.getRotationalAngle() ) * r * 0.5, y: ctr.y - Math.sin( channel.getRotationalAngle() ) * r * 0.5 };

      if ( this.distanceBetweenPosAndTraversalPoint( startingLocationX, startingLocationY, innerOpeningLocation ) < this.distanceBetweenPosAndTraversalPoint( startingLocationX, startingLocationY, outerOpeningLocation ) ) {
        points.push( innerOpeningLocation );
        points.push( aboveInactivationGateLocation );
        points.push( outerOpeningLocation );
      }
      else {
        points.push( outerOpeningLocation );
        points.push( aboveInactivationGateLocation );
        points.push( innerOpeningLocation );
      }

      return points;
    },

    setCourseForPoint: function( startLocationX, startLocationY, destination, velocityScaler ) {
      this.velocityVector.setXY( destination.x - startLocationX,
        destination.y - startLocationY );
      var scaleFactor = this.maxVelocity / this.velocityVector.magnitude();
      this.velocityVector.multiplyScalar( scaleFactor );

    },

    setCourseForCurrentTraversalPoint: function( currentLocationX, currentLocationY ) {
      var angularRange = 0;
      if ( this.currentDestinationIndex < this.traversalPoints.length ) {
        var dest = this.traversalPoints[ this.currentDestinationIndex ];
        this.velocityVector.setXY( dest.x - currentLocationX, dest.y - currentLocationY );
        var scaleFactor = this.maxVelocity / this.velocityVector.magnitude();
        this.velocityVector.multiplyScalar( scaleFactor );
      }
      else {
        // All points have been traversed.  The behavior at this point
        // depends on whether the channel has an inactivation gate, since
        // such a gate is depicted on the cell-interior side of the
        // channel in this sim.  No matter whether such a gate exists or
        // not, the particle is re-routed a bit in order to create a bit
        // of a brownian look.  If the gate exists, there are more
        // limitations to where the particle can go.
        if ( this.channel.getHasInactivationGate() ) {
          // NOTE: The following is tweaked to work with a particular
          // visual representation of the inactivation gate, and may
          // need to be changed if that representation is changed.
          var velocityRotationAngle = 0;
          var minRotation = 0;
          var maxRotation = 0;
          if ( Math.random() > 0.3 ) {
            // Move out to the right (assuming channel is vertical).
            // The angle at which we can move gets more restricted
            // as the inactivation gate closes.
            maxRotation = Math.PI * 0.4;
            angularRange = ( 1 - this.channel.getInactivationAmt() ) * Math.PI * 0.3;
            minRotation = maxRotation - angularRange;
          }
          else {
            // Move out to the left (assuming channel is vertical).
            // The angle at which we can move gets more restricted
            // as the inactivation gate closes.
            maxRotation = -Math.PI * 0.4;
            angularRange = ( 1 - this.channel.getInactivationAmt() ) * -Math.PI * 0.1;
            minRotation = maxRotation - angularRange;
          }
          velocityRotationAngle = minRotation + Math.random() * ( maxRotation - minRotation );
          this.velocityVector.rotate( velocityRotationAngle );
        }
        else {
          this.velocityVector.rotate( ( Math.random() - 0.5 ) * ( Math.PI * 0.9 ) * this.maxVelocity / NeuronConstants.DEFAULT_MAX_VELOCITY );
        }
      }

    }
  } );
} );

