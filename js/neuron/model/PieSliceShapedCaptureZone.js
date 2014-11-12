// Copyright 2002-2011, University of Colorado

/**
 * A "capture zone" (which is a 2D space that defines where particles may be
 * captured by a gate) that is shaped like a pie slice.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var CaptureZone = require( 'NEURON/neuron/model/CaptureZone' );
  var Vector2 = require( 'DOT/Vector2' );
  var DotUtil = require( 'DOT/Util' );

  var RAND = {
    nextDouble: function() {
      return Math.random();
    }
  };

  // isPointZone method of captureZone is refactored to use Vector components, this class wide
  // instance is used for intermediary vector calculations.  See isPointInZone method
  var pointZoneCheckPoint = new Vector2();

  /**
   * This class defines the size and orientation of a capture zone which
   * is shaped like a pie slice.  For more information on what exactly a
   * capture zone is, see the parent class documentation.
   *
   * @param {Vector2} center - Location of the center of this capture zone, i.e. where
   * the point of the pie is.
   * @param {number} radius - specifies the distance from the point of
   * the pie slice to the outer rounded edge, in nanometers.
   * @param {number} fixedRotationalOffset - The amount of rotation from 0 that
   * this capture zone always has, and that cannot be changed after
   * construction.  Note that 0 indicates that the point of the pie is at
   * the left and the rounded part at the right.
   * @param {number} angleOfExtent - in radians, extent of the arc.  A value of PI
   * would be a half circle, PI/2 is a quarter circle.
   * @constructor
   */
  function PieSliceShapedCaptureZone( center, radius, fixedRotationalOffset, angleOfExtent ) {
    var thisZone = this;
    CaptureZone.call( thisZone );
    this.originPoint = center;
    this.radius = radius;
    this.fixedRotationalOffset = fixedRotationalOffset;
    this.angleOfExtent = angleOfExtent;
    this.rotationAngle = 0;
    thisZone.zoneShape = new Shape();
    this.updateShape();
  }

  return inherit( CaptureZone, PieSliceShapedCaptureZone, {

    //@Override
    getShape: function() {
      return this.zoneShape;
    },

    isPointInZone: function( x, y ) {
      pointZoneCheckPoint.x = x;
      pointZoneCheckPoint.y = y;
      return this.zoneShape.containsPoint( pointZoneCheckPoint );
    },

    setRotationalAngle: function( angle ) {
      this.rotationAngle = angle;
      this.updateShape();
    },

    setOriginPoint: function( center ) {
      this.originPoint = center;
      this.updateShape();
    },

    getOriginPoint: function() {
      return this.originPoint;
    },

    // assign a random point that is somewhere within the shape.
    assignNewParticleLocation: function( particle ) {
      var placementAngle = this.rotationAngle + this.fixedRotationalOffset + (RAND.nextDouble() - 0.5) * this.angleOfExtent;
      var distanceFromOrigin = this.radius * 0.9;
      var xPos = this.originPoint.x + distanceFromOrigin * Math.cos( placementAngle );
      var yPos = this.originPoint.y + distanceFromOrigin * Math.sin( placementAngle );
      particle.setPosition( xPos, yPos );
    },

    //Derivation function for originPoint and rotation properties
    // see CaptureZone
    updateShape: function() {

      var startAngle = (this.fixedRotationalOffset + this.rotationAngle + this.angleOfExtent / 2) - this.angleOfExtent;
      startAngle = DotUtil.moduloBetweenDown( startAngle, 0, Math.PI * 2 );
      var endAngle = DotUtil.moduloBetweenDown( this.angleOfExtent, 0, Math.PI * 2 );

      return new Shape().arc( this.originPoint.x, this.originPoint.y, this.radius, startAngle, endAngle, true );// ARC2D.PIE startPoint and endPoint is internally added to arc's path
    }
  } );
} )
;
