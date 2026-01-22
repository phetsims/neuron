// Copyright 2014-2016, University of Colorado Boulder
/**
 /**
 * This node is meant to portray a small round indentation on a surface.  This is a modern user interface paradigm that
 * is intended to convey the concept of "gripability" (sp?), i.e. something that the user can click on and subsequently
 * grab.  This is meant to look somewhat 3D, much like etched borders do.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  // constants
  var STROKE_LINE_WIDTH = 0.5;

  /**
   * @param {number} diameter
   * @param {Color} baseColor
   * @constructor
   */
  function GrippyIndentNode( diameter, baseColor ) {

    Node.call( this );
    var baseDarkerColor = baseColor.darkerColor( 0.9 );
    var translucentDarkerColor = new Color( baseDarkerColor.getRed(), baseDarkerColor.getGreen(),
      baseDarkerColor.getBlue(), baseColor.getAlpha() );
    var baseLighterColor = baseColor.brighterColor( 0.9 );
    var translucentBrighterColor = new Color( baseLighterColor.getRed(), baseLighterColor.getGreen(),
      baseLighterColor.getBlue(), baseColor.getAlpha() );
    var radius = diameter / 2 - STROKE_LINE_WIDTH;

    this.addChild( new Circle( radius, {
      fill: translucentDarkerColor,
      stroke: translucentBrighterColor,
      lineWidth: STROKE_LINE_WIDTH
    } ) );
  }

  return inherit( Node, GrippyIndentNode );

} );

