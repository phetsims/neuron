// Copyright 2014-2022, University of Colorado Boulder
/**
 /**
 * This node is meant to portray a small round indentation on a surface.  This is a modern user interface paradigm that
 * is intended to convey the concept of "gripability" (sp?), i.e. something that the user can click on and subsequently
 * grab.  This is meant to look somewhat 3D, much like etched borders do.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import { Circle, Color, Node } from '../../../../../scenery/js/imports.js';
import neuron from '../../../neuron.js';

// constants
const STROKE_LINE_WIDTH = 0.5;

class GrippyIndentNode extends Node {

  /**
   * @param {number} diameter
   * @param {Color} baseColor
   */
  constructor( diameter, baseColor ) {

    super();
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
}

neuron.register( 'GrippyIndentNode', GrippyIndentNode );

export default GrippyIndentNode;