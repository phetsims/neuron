// Copyright 2014-2017, University of Colorado Boulder
/**
 /**
 * This node is meant to portray a small round indentation on a surface.  This is a modern user interface paradigm that
 * is intended to convey the concept of "gripability" (sp?), i.e. something that the user can click on and subsequently
 * grab.  This is meant to look somewhat 3D, much like etched borders do.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );
  const Node = require( 'SCENERY/nodes/Node' );

  // constants
  const STROKE_LINE_WIDTH = 0.5;

  /**
   * @param {number} diameter
   * @param {Color} baseColor
   * @constructor
   */
  function GrippyIndentNode( diameter, baseColor ) {

    Node.call( this );
    const baseDarkerColor = baseColor.darkerColor( 0.9 );
    const translucentDarkerColor = new Color( baseDarkerColor.getRed(), baseDarkerColor.getGreen(),
      baseDarkerColor.getBlue(), baseColor.getAlpha() );
    const baseLighterColor = baseColor.brighterColor( 0.9 );
    const translucentBrighterColor = new Color( baseLighterColor.getRed(), baseLighterColor.getGreen(),
      baseLighterColor.getBlue(), baseColor.getAlpha() );
    const radius = diameter / 2 - STROKE_LINE_WIDTH;

    this.addChild( new Circle( radius, {
      fill: translucentDarkerColor,
      stroke: translucentBrighterColor,
      lineWidth: STROKE_LINE_WIDTH
    } ) );
  }

  neuron.register( 'GrippyIndentNode', GrippyIndentNode );

  return inherit( Node, GrippyIndentNode );

} );

