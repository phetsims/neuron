// Copyright 2014-2022, University of Colorado Boulder

/**
 * A "capture zone" (which is a 2D space that defines where particles may be captured by a gate) that is shaped like a
 * pie slice.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import neuron from '../../neuron.js';
import CaptureZone from './CaptureZone.js';

// isPointZone method of captureZone is refactored to use Vector components, this class wide
// instance is used for intermediary vector calculations.  See isPointInZone method
const pointZoneCheckPoint = new Vector2( 0, 0 );

class PieSliceShapedCaptureZone extends CaptureZone {

  /**
   * This class defines the size and orientation of a capture zone which
   * is shaped like a pie slice.  For more information on what exactly a
   * capture zone is, see the parent class documentation.
   *
   * @param {Vector2} center - Position of the center of this capture zone, i.e. where
   * the point of the pie is.
   * @param {number} radius - specifies the distance from the point of
   * the pie slice to the outer rounded edge, in nanometers.
   * @param {number} fixedRotationalOffset - The amount of rotation from 0 that
   * this capture zone always has, and that cannot be changed after
   * construction.  Note that 0 indicates that the point of the pie is at
   * the left and the rounded part at the right.
   * @param {number} angleOfExtent - in radians, extent of the arc.  A value of PI
   * would be a half circle, PI/2 is a quarter circle.
   */
  constructor( center, radius, fixedRotationalOffset, angleOfExtent ) {
    super();
    this.originPoint = center;
    this.radius = radius;
    this.fixedRotationalOffset = fixedRotationalOffset;
    this.angleOfExtent = angleOfExtent;
    this.rotationAngle = 0;
    this.zoneShape = new Shape();
    this.updateShape();
  }

  // @public, @override
  getShape() {
    return this.zoneShape;
  }

  // @public
  isPointInZone( x, y ) {
    pointZoneCheckPoint.x = x;
    pointZoneCheckPoint.y = y;
    return this.zoneShape.containsPoint( pointZoneCheckPoint );
  }

  // @public
  setRotationalAngle( angle ) {
    this.rotationAngle = angle;
    this.updateShape();
  }

  // @public
  setOriginPoint( center ) {
    this.originPoint = center;
    this.updateShape();
  }

  // @public
  getOriginPoint() {
    return this.originPoint;
  }

  // @public, assign a random point that is somewhere within the shape.
  assignNewParticlePosition( particle ) {
    const placementAngle = this.rotationAngle + this.fixedRotationalOffset + ( dotRandom.nextDouble() - 0.5 ) * this.angleOfExtent;
    const distanceFromOrigin = this.radius * 0.9;
    const xPos = this.originPoint.x + distanceFromOrigin * Math.cos( placementAngle );
    const yPos = this.originPoint.y + distanceFromOrigin * Math.sin( placementAngle );
    particle.setPosition( xPos, yPos );
  }

  // @public
  updateShape() {

    let startAngle = ( this.fixedRotationalOffset + this.rotationAngle + this.angleOfExtent / 2 ) - this.angleOfExtent;
    startAngle = Utils.moduloBetweenDown( startAngle, 0, Math.PI * 2 );
    const endAngle = Utils.moduloBetweenDown( this.angleOfExtent, 0, Math.PI * 2 );
    return new Shape().arc( this.originPoint.x, this.originPoint.y, this.radius, startAngle, endAngle, true );// ARC2D.PIE startPoint and endPoint is internally added to arc's path
  }
}

neuron.register( 'PieSliceShapedCaptureZone', PieSliceShapedCaptureZone );

export default PieSliceShapedCaptureZone;
