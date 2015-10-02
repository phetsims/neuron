// Copyright 2002-2011, University of Colorado

/**
 * Model representation for the axon membrane.  Represents it as a cross section and a shape that is intended to look
 * like the body of the axon receding into the distance.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var TravelingActionPotential = require( 'NEURON/neuron/model/TravelingActionPotential' );
  var AxonMembraneState = require( 'NEURON/neuron/model/AxonMembraneState' );
  var Cubic = require( 'KITE/segments/Cubic' );

  // Fixed membrane characteristics.
  var BODY_LENGTH = NeuronConstants.DEFAULT_DIAMETER * 1.5;
  var BODY_TILT_ANGLE = Math.PI / 4;

  /**
   * @constructor
   */
  function AxonMembrane() {

    var thisAxonMembrane = this;

    PropertySet.call( thisAxonMembrane, {
      travelingActionPotentialStarted: false,
      travelingActionPotentialReachedCrossSection: false,
      travelingActionPotentialEnded: false
    } );

    // Traveling action potential that moves down the membrane.
    thisAxonMembrane.travelingActionPotential = null;

    //-----------------------------------------------------------------------------------------------------------------
    // Create the shape of the axon body
    //-----------------------------------------------------------------------------------------------------------------

    // Shape of the body of the axon.
    thisAxonMembrane.axonBodyShape = new Shape();
    // Points that define the body shape.
    thisAxonMembrane.vanishingPoint = new Vector2( BODY_LENGTH * Math.cos( BODY_TILT_ANGLE ), BODY_LENGTH * Math.sin( BODY_TILT_ANGLE ) );

    // Find the two points at which the shape will intersect the outer edge of the cross section.
    var r = NeuronConstants.DEFAULT_DIAMETER / 2 + thisAxonMembrane.getMembraneThickness() / 2;
    var theta = BODY_TILT_ANGLE + Math.PI * 0.45; // Multiplier tweaked a bit for improved appearance.
    thisAxonMembrane.intersectionPointA = new Vector2( r * Math.cos( theta ), r * Math.sin( theta ) );
    theta += Math.PI;
    thisAxonMembrane.intersectionPointB = new Vector2( r * Math.cos( theta ), r * Math.sin( theta ) );

    // Define the control points for the two curves.  Note that there is some tweaking in here, so change as needed
    // to get the desired look. If you can figure it out, that is.  Hints: The shape is drawn starting as a curve
    // from the vanishing point to intersection point A, then a line to intersection point B, then as a curve back to
    // the vanishing point.

    var angleToVanishingPt = Math.atan2( thisAxonMembrane.vanishingPoint.y - thisAxonMembrane.intersectionPointA.y,
      thisAxonMembrane.vanishingPoint.x - thisAxonMembrane.intersectionPointA.x );
    var ctrlPtRadius = thisAxonMembrane.intersectionPointA.distance( thisAxonMembrane.vanishingPoint ) * 0.33;
    thisAxonMembrane.cntrlPtA1 = new Vector2(
      thisAxonMembrane.intersectionPointA.x + ctrlPtRadius * Math.cos( angleToVanishingPt + 0.15 ),
      thisAxonMembrane.intersectionPointA.y + ctrlPtRadius * Math.sin( angleToVanishingPt + 0.15 ) );
    ctrlPtRadius = thisAxonMembrane.intersectionPointA.distance( thisAxonMembrane.vanishingPoint ) * 0.67;
    thisAxonMembrane.cntrlPtA2 = new Vector2(
      thisAxonMembrane.intersectionPointA.x + ctrlPtRadius * Math.cos( angleToVanishingPt - 0.5 ),
      thisAxonMembrane.intersectionPointA.y + ctrlPtRadius * Math.sin( angleToVanishingPt - 0.5 ) );

    var angleToIntersectionPt = Math.atan2( thisAxonMembrane.intersectionPointB.y - thisAxonMembrane.vanishingPoint.y,
      thisAxonMembrane.intersectionPointB.x - thisAxonMembrane.intersectionPointB.x );
    ctrlPtRadius = thisAxonMembrane.intersectionPointB.distance( thisAxonMembrane.vanishingPoint ) * 0.33;
    thisAxonMembrane.cntrlPtB1 = new Vector2(
      thisAxonMembrane.vanishingPoint.x + ctrlPtRadius * Math.cos( angleToIntersectionPt + 0.1 ),
      thisAxonMembrane.vanishingPoint.y + ctrlPtRadius * Math.sin( angleToIntersectionPt + 0.1 ) );
    ctrlPtRadius = thisAxonMembrane.intersectionPointB.distance( thisAxonMembrane.vanishingPoint ) * 0.67;
    thisAxonMembrane.cntrlPtB2 = new Vector2(
      thisAxonMembrane.vanishingPoint.x + ctrlPtRadius * Math.cos( angleToIntersectionPt - 0.25 ),
      thisAxonMembrane.vanishingPoint.y + ctrlPtRadius * Math.sin( angleToIntersectionPt - 0.25 ) );

    // Create the curves that define the boundaries of the body.
    thisAxonMembrane.curveA = new Cubic( thisAxonMembrane.vanishingPoint, thisAxonMembrane.cntrlPtA2, thisAxonMembrane.cntrlPtA1, thisAxonMembrane.intersectionPointA );
    thisAxonMembrane.curveB = new Cubic( thisAxonMembrane.vanishingPoint, thisAxonMembrane.cntrlPtB1, thisAxonMembrane.cntrlPtB2, thisAxonMembrane.intersectionPointB );

    // In order to create the full shape, we reverse one of the curves and the connect the two curves together in
    // order to create the full shape of the axon body.
    thisAxonMembrane.axonBodyShape.moveTo( thisAxonMembrane.intersectionPointA.x, thisAxonMembrane.intersectionPointA.y );
    thisAxonMembrane.axonBodyShape.cubicCurveTo( thisAxonMembrane.cntrlPtA1.x, thisAxonMembrane.cntrlPtA1.y, thisAxonMembrane.cntrlPtA2.x,
      thisAxonMembrane.cntrlPtA2.y, thisAxonMembrane.vanishingPoint.x, thisAxonMembrane.vanishingPoint.y );
    thisAxonMembrane.axonBodyShape.cubicCurveTo( thisAxonMembrane.cntrlPtB1.x, thisAxonMembrane.cntrlPtB1.y, thisAxonMembrane.cntrlPtB2.x,
      thisAxonMembrane.cntrlPtB2.y, thisAxonMembrane.intersectionPointB.x, thisAxonMembrane.intersectionPointB.y );
    thisAxonMembrane.axonBodyShape.close();

    // Shape of the cross section of the membrane.	For now, and unless there is some reason to do otherwise, the center
    // of the cross section is positioned at the origin.
    thisAxonMembrane.crossSectionCircleCenter = Vector2.ZERO; // @public
    thisAxonMembrane.crossSectionCircleRadius = NeuronConstants.DEFAULT_DIAMETER / 2;

    // To avoid creating new Vector2 instances during animation, the instances are declared and reused in the
    // evaluateCurve method.
    this.ab = new Vector2();
    this.bc = new Vector2();
    this.cd = new Vector2();
    this.abbc = new Vector2();
    this.bbcd = new Vector2();
  }

  return inherit( PropertySet, AxonMembrane, {

      /**
       * Step this model element forward in time by the specified delta.
       *
       * @param dt - delta time, in seconds.
       */
      stepInTime: function( dt ) {
        if ( this.travelingActionPotential ) {
          this.travelingActionPotential.stepInTime( dt );
        }
      },

      /**
       * Start an action potential that will travel down the length of the membrane toward the transverse cross section.
       */
      initiateTravelingActionPotential: function() {
        var thisAxonMembrane = this;
        assert && assert( this.travelingActionPotential === null, 'Should not initiate a 2nd traveling action potential before prior one has completed.' );
        this.travelingActionPotential = new TravelingActionPotential( this );
        this.travelingActionPotential.crossSectionReachedProperty.onValue( true, function() {
          thisAxonMembrane.travelingActionPotentialReachedCrossSection = true;
        } );

        this.travelingActionPotential.lingeringCompletedProperty.onValue( true, function() {
          thisAxonMembrane.removeTravelingActionPotential();
        } );

        thisAxonMembrane.travelingActionPotentialStarted = true;
        thisAxonMembrane.travelingActionPotentialEnded = false;
        thisAxonMembrane.travelingActionPotentialReachedCrossSection = false;
      },

      /**
       * Remove the traveling action potential, either because it has reached the cross section and is therefore no
       * longer needed, or for some other reason (such as a reset or jump in the playback state).
       */
      removeTravelingActionPotential: function() {
        this.travelingActionPotentialStarted = false;
        this.travelingActionPotentialReachedCrossSection = false;
        this.travelingActionPotentialEnded = true;
        this.stimulusPulseInitiated = false;
        this.travelingActionPotential = null;
      },

      getState: function() {
        return new AxonMembraneState( this.travelingActionPotential ? this.travelingActionPotential.getState() : null );
      },

      setState: function( axonMembraneState ) {
        if ( !axonMembraneState.getTravelingActionPotentialState() && this.travelingActionPotential ) {
          // Get rid of the existing TAP.
          this.removeTravelingActionPotential();
        }
        else if ( axonMembraneState.getTravelingActionPotentialState() && !this.travelingActionPotential ) {
          // A traveling action potential needs to be added.
          this.initiateTravelingActionPotential();
        }

        if ( this.travelingActionPotential ) {
          // Set the state to match the new given state.
          this.travelingActionPotential.setState( axonMembraneState.getTravelingActionPotentialState() );
        }
      },

      /**
       * Get the object that defines the current traveling action potential.
       * Returns null if no action potential is happening.
       */
      getTravelingActionPotential: function() {
        return this.travelingActionPotential;
      },

      getMembraneThickness: function() {
        return NeuronConstants.MEMBRANE_THICKNESS;
      },

      getCrossSectionDiameter: function() {
        return NeuronConstants.DEFAULT_DIAMETER;
      },

      getCrossSectionEllipseShape: function() {
        return this.crossSectionEllipseShape;
      },

      reset: function() {
        if ( this.travelingActionPotential ) {
          // Force premature termination of the action potential.
          this.removeTravelingActionPotential();
        }
      },

      getCurveA: function() {
        return this.curveA;
      },

      getCurveB: function() {
        return this.curveB;
      },

      /**
       * Evaluate the curve in order to locate a point given a distance along the curve.  This uses the DeCasteljau
       * algorithm.
       *
       * @param curve - The Curve Shape that is being evaluated.
       * @param t - proportional distance along the curve from the first control point, must be from 0 to 1.
       * @return point corresponding to the location of the curve at the specified distance.
       *
       * This method was converted from static to instance to prevent circular dependency between Traveling
       * Potential and AxonMembrane (Ashraf)
       */
      evaluateCurve: function( curve, t ) {
        if ( t < 0 || t > 1 ) {
          throw new Error( "t is out of range: " + t );
        }
        this.linearInterpolation( curve.start, curve.control1, t, this.ab );
        this.linearInterpolation( curve.control1, curve.control2, t, this.bc );
        this.linearInterpolation( curve.control2, curve.end, t, this.cd );
        this.linearInterpolation( this.ab, this.bc, t, this.abbc );
        this.linearInterpolation( this.bc, this.cd, t, this.bbcd );

        return this.linearInterpolation( this.abbc, this.bbcd, t );
      },

      /**
       * Simple linear interpolation between two points.
       * @param {Vector2} a
       * @param {Vector2} b
       * @param {number} t
       * @param {Vector2} out
       *
       * Vector2's blend creates a new Vector and returns, for performance/memory reasons
       * this code uses this interpolation method
       */
      linearInterpolation: function( a, b, t, out ) {
        out = out || new Vector2();
        out.x = a.x + (b.x - a.x) * t;
        out.y = a.y + (b.y - a.y) * t;
        return out;
      }
    }
  );
} );