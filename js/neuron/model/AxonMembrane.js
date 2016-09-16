// Copyright 2014-2015, University of Colorado Boulder

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
  var AxonMembraneState = require( 'NEURON/neuron/model/AxonMembraneState' );
  var Cubic = require( 'KITE/segments/Cubic' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var Shape = require( 'KITE/Shape' );
  var TravelingActionPotential = require( 'NEURON/neuron/model/TravelingActionPotential' );
  var Vector2 = require( 'DOT/Vector2' );

  // Fixed membrane characteristics.
  var BODY_LENGTH = NeuronConstants.DEFAULT_DIAMETER * 1.5;
  var BODY_TILT_ANGLE = Math.PI / 4;

  /**
   * @constructor
   */
  function AxonMembrane() {

    var self = this;

    // @public - events emitted by instances of this type
    this.travelingActionPotentialStarted = new Emitter();
    this.travelingActionPotentialReachedCrossSection = new Emitter();
    this.lingeringCompleted = new Emitter();
    this.travelingActionPotentialEnded = new Emitter();

    // Traveling action potential that moves down the membrane.
    self.travelingActionPotential = null;

    //-----------------------------------------------------------------------------------------------------------------
    // Create the shape of the axon body
    //-----------------------------------------------------------------------------------------------------------------

    // @public - shape of the body of the axon
    self.axonBodyShape = new Shape();

    // points at which axon membrane would appear to vanish, used in shape creation
    var vanishingPoint = new Vector2(
      BODY_LENGTH * Math.cos( BODY_TILT_ANGLE ),
      BODY_LENGTH * Math.sin( BODY_TILT_ANGLE )
    );

    // Find the two points at which the shape will intersect the outer edge of the cross section.
    var r = NeuronConstants.DEFAULT_DIAMETER / 2 + self.getMembraneThickness() / 2;
    var theta = BODY_TILT_ANGLE + Math.PI * 0.45; // Multiplier tweaked a bit for improved appearance.
    var intersectionPointA = new Vector2( r * Math.cos( theta ), r * Math.sin( theta ) );
    theta += Math.PI;
    var intersectionPointB = new Vector2( r * Math.cos( theta ), r * Math.sin( theta ) );

    // Define the control points for the two curves.  Note that there is some tweaking in here, so change as needed
    // to get the desired look. If you can figure it out, that is.  Hints: The shape is drawn starting as a curve
    // from the vanishing point to intersection point A, then a line to intersection point B, then as a curve back to
    // the vanishing point.
    var angleToVanishingPt = Math.atan2(
      vanishingPoint.y - intersectionPointA.y,
      vanishingPoint.x - intersectionPointA.x );
    var controlPtRadius = intersectionPointA.distance( vanishingPoint ) * 0.33;
    var controlPtA1 = new Vector2(
      intersectionPointA.x + controlPtRadius * Math.cos( angleToVanishingPt + 0.15 ),
      intersectionPointA.y + controlPtRadius * Math.sin( angleToVanishingPt + 0.15 ) );
    controlPtRadius = intersectionPointA.distance( vanishingPoint ) * 0.67;
    var controlPtA2 = new Vector2(
      intersectionPointA.x + controlPtRadius * Math.cos( angleToVanishingPt - 0.5 ),
      intersectionPointA.y + controlPtRadius * Math.sin( angleToVanishingPt - 0.5 ) );

    var angleToIntersectionPt = Math.atan2( intersectionPointB.y - vanishingPoint.y,
      intersectionPointB.x - intersectionPointB.x );
    controlPtRadius = intersectionPointB.distance( vanishingPoint ) * 0.33;
    var controlPtB1 = new Vector2(
      vanishingPoint.x + controlPtRadius * Math.cos( angleToIntersectionPt + 0.1 ),
      vanishingPoint.y + controlPtRadius * Math.sin( angleToIntersectionPt + 0.1 ) );
    controlPtRadius = intersectionPointB.distance( vanishingPoint ) * 0.67;
    var controlPtB2 = new Vector2(
      vanishingPoint.x + controlPtRadius * Math.cos( angleToIntersectionPt - 0.25 ),
      vanishingPoint.y + controlPtRadius * Math.sin( angleToIntersectionPt - 0.25 ) );

    // @private - curves that define the boundaries of the body
    self.curveA = new Cubic(
      vanishingPoint,
      controlPtA2,
      controlPtA1,
      intersectionPointA
    );
    self.curveB = new Cubic(
      vanishingPoint,
      controlPtB1,
      controlPtB2,
      intersectionPointB
    );

    // In order to create the full shape, we reverse one of the curves and the connect the two curves together in
    // order to create the full shape of the axon body.
    self.axonBodyShape.moveTo( intersectionPointA.x, intersectionPointA.y );
    self.axonBodyShape.cubicCurveTo(
      controlPtA1.x,
      controlPtA1.y,
      controlPtA2.x,
      controlPtA2.y,
      vanishingPoint.x,
      vanishingPoint.y
    );
    self.axonBodyShape.cubicCurveTo(
      controlPtB1.x,
      controlPtB1.y,
      controlPtB2.x,
      controlPtB2.y,
      intersectionPointB.x,
      intersectionPointB.y
    );
    self.axonBodyShape.close();

    // @public - shape of the cross section of the membrane.	For now, and unless there is some reason to do otherwise,
    // the center of the cross section is positioned at the origin.
    self.crossSectionCircleCenter = Vector2.ZERO;
    self.crossSectionCircleRadius = NeuronConstants.DEFAULT_DIAMETER / 2;

    // @private - In order to avoid creating new Vector2 instances during animation, these instances are declared and
    // reused in the evaluateCurve method.
    this.ab = new Vector2();
    this.bc = new Vector2();
    this.cd = new Vector2();
    this.abbc = new Vector2();
    this.bbcd = new Vector2();
  }

  neuron.register( 'AxonMembrane', AxonMembrane );

  return inherit( Object, AxonMembrane, {

      /**
       * Step this model element forward in time by the specified delta.
       * @param {number} dt - delta time, in seconds.
       * @public
       */
      stepInTime: function( dt ) {
        if ( this.travelingActionPotential ) {
          this.travelingActionPotential.stepInTime( dt );
        }
      },

      /**
       * Start an action potential that will travel down the length of the membrane toward the transverse cross section.
       * @public
       */
      initiateTravelingActionPotential: function() {
        var self = this;
        assert && assert( this.travelingActionPotential === null, 'Should not initiate a 2nd traveling action potential before prior one has completed.' );
        this.travelingActionPotential = new TravelingActionPotential( this );
        this.travelingActionPotential.crossSectionReached.addListener( function() {
          self.travelingActionPotentialReachedCrossSection.emit();
        } );

        this.travelingActionPotential.lingeringCompleted.addListener( function() {
          self.removeTravelingActionPotential();
        } );

        self.travelingActionPotentialStarted.emit();
      },

      /**
       * Remove the traveling action potential, either because it has reached the cross section and is therefore no
       * longer needed, or for some other reason (such as a reset or jump in the playback state).
       * @public
       */
      removeTravelingActionPotential: function() {
        this.travelingActionPotentialEnded.emit();
        this.stimulusPulseInitiated = false;
        this.travelingActionPotential = null;
      },

      // @public
      getState: function() {
        return new AxonMembraneState( this.travelingActionPotential ? this.travelingActionPotential.getState() : null );
      },

      // @public
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
       * Get the object that defines the current traveling action potential, null if no action potential is happening.
       * @public
       */
      getTravelingActionPotential: function() {
        return this.travelingActionPotential;
      },

      // @public
      getMembraneThickness: function() {
        return NeuronConstants.MEMBRANE_THICKNESS;
      },

      // @public
      getCrossSectionDiameter: function() {
        return NeuronConstants.DEFAULT_DIAMETER;
      },

      // @public
      getCrossSectionEllipseShape: function() {
        return this.crossSectionEllipseShape;
      },

      // @public
      reset: function() {
        if ( this.travelingActionPotential ) {
          // Force premature termination of the action potential.
          this.removeTravelingActionPotential();
        }
      },

      // @public
      getCurveA: function() {
        return this.curveA;
      },

      // @public
      getCurveB: function() {
        return this.curveB;
      },

      /**
       * Evaluate the curve in order to locate a point given a distance along the curve.  This uses the DeCasteljau
       * algorithm.
       *
       * This method was converted from static to instance to prevent circular dependency between Traveling
       * Potential and AxonMembrane (Ashraf)
       *
       * @param {Cubic} curve - The curve shape that is being evaluated.
       * @param {number} proportion - proportional distance along the curve from the first control point, must be from 0 to 1.
       * @return {Vector2} point corresponding to the location of the curve at the specified distance.
       * @public
       */
      evaluateCurve: function( curve, proportion ) {
        if ( proportion < 0 || proportion > 1 ) {
          throw new Error( 'proportion is out of range: ' + proportion );
        }
        this.linearInterpolation( curve.start, curve.control1, proportion, this.ab );
        this.linearInterpolation( curve.control1, curve.control2, proportion, this.bc );
        this.linearInterpolation( curve.control2, curve.end, proportion, this.cd );
        this.linearInterpolation( this.ab, this.bc, proportion, this.abbc );
        this.linearInterpolation( this.bc, this.cd, proportion, this.bbcd );

        return this.linearInterpolation( this.abbc, this.bbcd, proportion );
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