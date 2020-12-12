// Copyright 2014-2020, University of Colorado Boulder

/**
 * Class that defines the behavior of the action potential that travels
 * along the membrane before reaching the position of the transverse cross
 * section.  This is essentially just a shape that is intended to look
 * like something moving along the outer membrane.  The shape moves for a
 * while, then reaches the cross section, and then lingers there for a
 * bit.

 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Emitter from '../../../../axon/js/Emitter.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import neuron from '../../neuron.js';
import TravelingActionPotentialState from './TravelingActionPotentialState.js';

// constants
const TRAVELING_TIME = 0.0020; // In seconds of sim time (not wall time).
const LINGER_AT_CROSS_SECTION_TIME = 0.0005; // In seconds of sim time (not wall time).
const NUM_CURVE_POINTS = 20; // number of points used to approximate the curve of the axon body

/**
 * A function that takes a proportion between 0 and 1, an array of points, and an output array, and sets the output
 * array value to be a weighted interpolation between the two closest points in the array.
 */
function calculateInterpolatedPoint( proportion, points, outputPoint ) {
  assert && assert( proportion >= 0 && proportion <= 1, 'proportion is out of range' );
  const unroundedClosestPointIndex = proportion * ( points.length - 1 );
  const closestPointIndex = Utils.roundSymmetric( unroundedClosestPointIndex );
  const nextClosestPointIndex = unroundedClosestPointIndex % 1 >= 0.5 ? closestPointIndex - 1 : closestPointIndex + 1;
  const weight = 1 - Math.abs( closestPointIndex - unroundedClosestPointIndex );
  const closestPoint = points[ closestPointIndex ];
  const nextClosestPoint = points[ nextClosestPointIndex ];
  outputPoint.setX( weight * closestPoint.x + ( 1 - weight ) * nextClosestPoint.x );
  outputPoint.setY( weight * closestPoint.y + ( 1 - weight ) * nextClosestPoint.y );
}

class TravelingActionPotential {

  /**
   * @param {AxonMembrane} axonMembrane
   */
  constructor( axonMembrane ) {

    this.axonMembrane = axonMembrane; // @private

    // @public - events emitted as the action potential changes
    this.shapeChanged = new Emitter();
    this.crossSectionReached = new Emitter();
    this.lingeringCompleted = new Emitter();

    // @public - describes the shape of the action potential
    this.shapeDescription = {
      mode: 'curve', // valid values are 'curve' and 'circle'
      startPoint: new Vector2( 0, 0 ),
      controlPoint1: new Vector2( 0, 0 ),
      controlPoint2: new Vector2( 0, 0 ),
      endPoint: new Vector2( 0, 0 ),
      circleCenter: axonMembrane.crossSectionCircleCenter,
      circleRadius: 0
    };

    this.travelTimeCountdownTimer = TRAVELING_TIME; // @private
    this.lingerCountdownTimer = 0; // @private
    this.upperCurvePoints = new Array( NUM_CURVE_POINTS ); // @private
    this.lowerCurvePoints = new Array( NUM_CURVE_POINTS ); // @private
    this.curveMidPoint = new Vector2( 0, 0 ); // @private, pre-allocated for performance reasons

    // Set up the points that will be used to determine the ends of the action potential curve.  These are calculated
    // during construction instead of in real time as a performance optimization.
    for ( let i = 0; i < NUM_CURVE_POINTS; i++ ) {
      this.upperCurvePoints[ i ] = axonMembrane.evaluateCurve( axonMembrane.getCurveA(), i / ( NUM_CURVE_POINTS - 1 ) );
      this.lowerCurvePoints[ i ] = axonMembrane.evaluateCurve( axonMembrane.getCurveB(), i / ( NUM_CURVE_POINTS - 1 ) );
    }

    // create the initial shape
    this.updateShapeDescription(); // Also create an initialize Shape
  }

  /**
   * Step this model component forward by the specified time.  This will update the shape such that it will appear to
   * move down the axon membrane.
   * @public
   * @param {number} dt
   */
  stepInTime( dt ) {
    if ( this.travelTimeCountdownTimer > 0 ) {
      this.travelTimeCountdownTimer -= dt;
      this.updateShapeDescription();
      if ( this.travelTimeCountdownTimer <= 0 ) {
        // We've reached the cross section and will now linger there for a bit.
        this.crossSectionReached.emit();
        this.lingerCountdownTimer = LINGER_AT_CROSS_SECTION_TIME;
      }
    }
    else if ( this.lingerCountdownTimer > 0 ) {
      this.lingerCountdownTimer -= dt;
      if ( this.lingerCountdownTimer <= 0 ) {
        this.lingeringCompleted.emit();
      }
      else {
        this.updateShapeDescription();
      }
    }
  }

  /**
   * Update the information that describes the shape of the action potential.
   *
   * NOTE: An attempt was made to generalize this so that it would work for pretty much any shape of the axon body,
   * but this turned out to be a lot of work, so ultimately we went with a simpler implementation that makes some
   * assumptions about the axon body shape.  If significant changes are made to the axon body shape, this routine will
   * need to be updated.
   * @private
   */
  updateShapeDescription() {
    if ( this.travelTimeCountdownTimer > 0 ) {
      // Depict the traveling action potential as a curved line moving down the axon.  Start by calculating the start
      // and end points.
      this.shapeDescription.mode = 'curve';
      const travelAmtFactor = Math.max( 1 - this.travelTimeCountdownTimer / TRAVELING_TIME, 0 );
      calculateInterpolatedPoint( travelAmtFactor, this.upperCurvePoints, this.shapeDescription.startPoint );
      const startPoint = this.shapeDescription.startPoint;
      calculateInterpolatedPoint( travelAmtFactor, this.lowerCurvePoints, this.shapeDescription.endPoint );
      const endPoint = this.shapeDescription.endPoint;
      this.curveMidPoint.setXY( ( startPoint.x + endPoint.x ) / 2, ( startPoint.y + endPoint.y ) / 2 );
      // The exponents used in the control point distances were empirically determined and can be adjusted to make the
      // top or bottom more or less curved as the potential moves down the membrane.
      const ctrlPoint1Distance = endPoint.distance( startPoint ) * 0.7 * Math.pow( travelAmtFactor, 1.8 );
      const ctrlPoint2Distance = endPoint.distance( startPoint ) * 0.7 * Math.pow( travelAmtFactor, 0.8 );
      const perpendicularAngle = Math.atan2( endPoint.y - startPoint.y, endPoint.x - startPoint.x ) + Math.PI / 2;
      this.shapeDescription.controlPoint1.setXY(
        this.curveMidPoint.x + ctrlPoint1Distance * Math.cos( perpendicularAngle + Math.PI / 6 ),
        this.curveMidPoint.y + ctrlPoint1Distance * Math.sin( perpendicularAngle + Math.PI / 6 ) );
      this.shapeDescription.controlPoint2.setXY(
        this.curveMidPoint.x + ctrlPoint2Distance * Math.cos( perpendicularAngle - Math.PI / 6 ),
        this.curveMidPoint.y + ctrlPoint2Distance * Math.sin( perpendicularAngle - Math.PI / 6 ) );
    }
    else {
      // The action potential is "lingering" at the point of the cross section.  Define the shape as a circle that
      // changes shape a bit. This is done when the action potential has essentially reached the point of the cross
      // section.
      this.shapeDescription.mode = 'circle';

      // Make the shape a little bigger than the cross section so that it can be seen behind it, and have it grow
      // while it is there.
      const growthFactor = ( 1 - Math.abs( this.lingerCountdownTimer / LINGER_AT_CROSS_SECTION_TIME - 0.5 ) * 2 ) * 0.04 + 1;
      this.shapeDescription.circleRadius = this.axonMembrane.crossSectionCircleRadius * growthFactor;
    }

    this.shapeChanged.emit();
  }

  /**
   * Set the state from a (probably previously captured) version of the internal state.
   * @public
   */
  setState( state ) {
    this.travelTimeCountdownTimer = state.getTravelTimeCountdownTimer();
    this.lingerCountdownTimer = state.getLingerCountdownTimer();
    this.updateShapeDescription();
  }

  /**
   * Get the state, generally for use in setting the state later for some sort of playback.
   * @public
   */
  getState() {
    return new TravelingActionPotentialState( this.travelTimeCountdownTimer, this.lingerCountdownTimer );
  }
}

neuron.register( 'TravelingActionPotential', TravelingActionPotential );

export default TravelingActionPotential;
