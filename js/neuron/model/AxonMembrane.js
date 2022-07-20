// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model representation for the axon membrane.  Represents it as a cross section and a shape that is intended to look
 * like the body of the axon receding into the distance.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Cubic, Shape } from '../../../../kite/js/imports.js';
import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import AxonMembraneState from './AxonMembraneState.js';
import TravelingActionPotential from './TravelingActionPotential.js';

// Fixed membrane characteristics.
const BODY_LENGTH = NeuronConstants.DEFAULT_DIAMETER * 1.5;
const BODY_TILT_ANGLE = Math.PI / 4;

class AxonMembrane {

  constructor() {

    // @public - events emitted by instances of this type
    this.travelingActionPotentialStarted = new Emitter();
    this.travelingActionPotentialReachedCrossSection = new Emitter();
    this.lingeringCompleted = new Emitter();
    this.travelingActionPotentialEnded = new Emitter();

    // Traveling action potential that moves down the membrane.
    this.travelingActionPotential = null;

    //-----------------------------------------------------------------------------------------------------------------
    // Create the shape of the axon body
    //-----------------------------------------------------------------------------------------------------------------

    // @public - shape of the body of the axon
    this.axonBodyShape = new Shape();

    // points at which axon membrane would appear to vanish, used in shape creation
    const vanishingPoint = new Vector2(
      BODY_LENGTH * Math.cos( BODY_TILT_ANGLE ),
      BODY_LENGTH * Math.sin( BODY_TILT_ANGLE )
    );

    // Find the two points at which the shape will intersect the outer edge of the cross section.
    const r = NeuronConstants.DEFAULT_DIAMETER / 2 + this.getMembraneThickness() / 2;
    let theta = BODY_TILT_ANGLE + Math.PI * 0.45; // Multiplier tweaked a bit for improved appearance.
    const intersectionPointA = new Vector2( r * Math.cos( theta ), r * Math.sin( theta ) );
    theta += Math.PI;
    const intersectionPointB = new Vector2( r * Math.cos( theta ), r * Math.sin( theta ) );

    // Define the control points for the two curves.  Note that there is some tweaking in here, so change as needed
    // to get the desired look. If you can figure it out, that is.  Hints: The shape is drawn starting as a curve
    // from the vanishing point to intersection point A, then a line to intersection point B, then as a curve back to
    // the vanishing point.
    const angleToVanishingPt = Math.atan2(
      vanishingPoint.y - intersectionPointA.y,
      vanishingPoint.x - intersectionPointA.x );
    let controlPtRadius = intersectionPointA.distance( vanishingPoint ) * 0.33;
    const controlPtA1 = new Vector2(
      intersectionPointA.x + controlPtRadius * Math.cos( angleToVanishingPt + 0.15 ),
      intersectionPointA.y + controlPtRadius * Math.sin( angleToVanishingPt + 0.15 ) );
    controlPtRadius = intersectionPointA.distance( vanishingPoint ) * 0.67;
    const controlPtA2 = new Vector2(
      intersectionPointA.x + controlPtRadius * Math.cos( angleToVanishingPt - 0.5 ),
      intersectionPointA.y + controlPtRadius * Math.sin( angleToVanishingPt - 0.5 ) );

    const angleToIntersectionPt = Math.atan2( intersectionPointB.y - vanishingPoint.y,
      intersectionPointB.x - intersectionPointB.x );
    controlPtRadius = intersectionPointB.distance( vanishingPoint ) * 0.33;
    const controlPtB1 = new Vector2(
      vanishingPoint.x + controlPtRadius * Math.cos( angleToIntersectionPt + 0.1 ),
      vanishingPoint.y + controlPtRadius * Math.sin( angleToIntersectionPt + 0.1 ) );
    controlPtRadius = intersectionPointB.distance( vanishingPoint ) * 0.67;
    const controlPtB2 = new Vector2(
      vanishingPoint.x + controlPtRadius * Math.cos( angleToIntersectionPt - 0.25 ),
      vanishingPoint.y + controlPtRadius * Math.sin( angleToIntersectionPt - 0.25 ) );

    // @private - curves that define the boundaries of the body
    this.curveA = new Cubic(
      vanishingPoint,
      controlPtA2,
      controlPtA1,
      intersectionPointA
    );
    this.curveB = new Cubic(
      vanishingPoint,
      controlPtB1,
      controlPtB2,
      intersectionPointB
    );

    // In order to create the full shape, we reverse one of the curves and the connect the two curves together in
    // order to create the full shape of the axon body.
    this.axonBodyShape.moveTo( intersectionPointA.x, intersectionPointA.y );
    this.axonBodyShape.cubicCurveTo(
      controlPtA1.x,
      controlPtA1.y,
      controlPtA2.x,
      controlPtA2.y,
      vanishingPoint.x,
      vanishingPoint.y
    );
    this.axonBodyShape.cubicCurveTo(
      controlPtB1.x,
      controlPtB1.y,
      controlPtB2.x,
      controlPtB2.y,
      intersectionPointB.x,
      intersectionPointB.y
    );
    this.axonBodyShape.close();

    // @public - shape of the cross section of the membrane. For now, and unless there is some reason to do otherwise,
    // the center of the cross section is positioned at the origin.
    this.crossSectionCircleCenter = Vector2.ZERO;
    this.crossSectionCircleRadius = NeuronConstants.DEFAULT_DIAMETER / 2;

    // @private - In order to avoid creating new Vector2 instances during animation, these instances are declared and
    // reused in the evaluateCurve method.
    this.ab = new Vector2( 0, 0 );
    this.bc = new Vector2( 0, 0 );
    this.cd = new Vector2( 0, 0 );
    this.abbc = new Vector2( 0, 0 );
    this.bbcd = new Vector2( 0, 0 );
  }

  /**
   * Step this model element forward in time by the specified delta.
   * @param {number} dt - delta time, in seconds.
   * @public
   */
  stepInTime( dt ) {
    if ( this.travelingActionPotential ) {
      this.travelingActionPotential.stepInTime( dt );
    }
  }

  /**
   * Start an action potential that will travel down the length of the membrane toward the transverse cross section.
   * @public
   */
  initiateTravelingActionPotential() {
    assert && assert( this.travelingActionPotential === null, 'Should not initiate a 2nd traveling action potential before prior one has completed.' );
    this.travelingActionPotential = new TravelingActionPotential( this );
    this.travelingActionPotential.crossSectionReached.addListener( () => {
      this.travelingActionPotentialReachedCrossSection.emit();
    } );

    this.travelingActionPotential.lingeringCompleted.addListener( () => {
      this.removeTravelingActionPotential();
    } );

    this.travelingActionPotentialStarted.emit();
  }

  /**
   * Remove the traveling action potential, either because it has reached the cross section and is therefore no
   * longer needed, or for some other reason (such as a reset or jump in the playback state).
   * @public
   */
  removeTravelingActionPotential() {
    this.travelingActionPotentialEnded.emit();
    this.stimulusPulseInitiated = false;
    this.travelingActionPotential = null;
  }

  // @public
  getState() {
    return new AxonMembraneState( this.travelingActionPotential ? this.travelingActionPotential.getState() : null );
  }

  // @public
  setState( axonMembraneState ) {
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
  }

  /**
   * Get the object that defines the current traveling action potential, null if no action potential is happening.
   * @public
   */
  getTravelingActionPotential() {
    return this.travelingActionPotential;
  }

  // @public
  getMembraneThickness() {
    return NeuronConstants.MEMBRANE_THICKNESS;
  }

  // @public
  getCrossSectionDiameter() {
    return NeuronConstants.DEFAULT_DIAMETER;
  }

  // @public
  getCrossSectionEllipseShape() {
    return this.crossSectionEllipseShape;
  }

  // @public
  reset() {
    if ( this.travelingActionPotential ) {
      // Force premature termination of the action potential.
      this.removeTravelingActionPotential();
    }
  }

  // @public
  getCurveA() {
    return this.curveA;
  }

  // @public
  getCurveB() {
    return this.curveB;
  }

  /**
   * Evaluate the curve in order to locate a point given a distance along the curve.  This uses the DeCasteljau
   * algorithm.
   *
   * This method was converted from static to instance to prevent circular dependency between Traveling
   * Potential and AxonMembrane (Ashraf)
   *
   * @param {Cubic} curve - The curve shape that is being evaluated.
   * @param {number} proportion - proportional distance along the curve from the first control point, must be from 0 to 1.
   * @returns {Vector2} point corresponding to the position of the curve at the specified distance.
   * @public
   */
  evaluateCurve( curve, proportion ) {
    if ( proportion < 0 || proportion > 1 ) {
      throw new Error( `proportion is out of range: ${proportion}` );
    }
    this.linearInterpolation( curve.start, curve.control1, proportion, this.ab );
    this.linearInterpolation( curve.control1, curve.control2, proportion, this.bc );
    this.linearInterpolation( curve.control2, curve.end, proportion, this.cd );
    this.linearInterpolation( this.ab, this.bc, proportion, this.abbc );
    this.linearInterpolation( this.bc, this.cd, proportion, this.bbcd );

    return this.linearInterpolation( this.abbc, this.bbcd, proportion );
  }

  /**
   * Simple linear interpolation between two points.
   * @private
   * @param {Vector2} a
   * @param {Vector2} b
   * @param {number} t
   * @param {Vector2} out
   *
   * Vector2's blend creates a new Vector and returns, for performance/memory reasons
   * this code uses this interpolation method
   */
  linearInterpolation( a, b, t, out ) {
    out = out || new Vector2( 0, 0 );
    out.x = a.x + ( b.x - a.x ) * t;
    out.y = a.y + ( b.y - a.y ) * t;
    return out;
  }
}

neuron.register( 'AxonMembrane', AxonMembrane );

export default AxonMembrane;
