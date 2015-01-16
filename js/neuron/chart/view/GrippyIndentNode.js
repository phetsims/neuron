// Copyright 2002-2011, University of Colorado
/**
 /**
 * This node is meant to portray a small round indentation on a surface.  This
 * is a modern user interface paradigm that is intended to convey the concept
 * of "gripability" (sp?), i.e. something that the user can click on and
 * subsequently grab.  This is meant to look somewhat 3D, much like etched
 * borders do.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  /**
   *
   * @param {number} diameter
   * @param {Color} baseColor
   * @constructor
   */
  function GrippyIndentNode( diameter, baseColor ) {

    var thisNode = this;
    Node.call( thisNode );
    var baseDarkerColor = baseColor.darkerColor( 0.9 );
    var translucentDarkerColor = new Color( baseDarkerColor.getRed(), baseDarkerColor.getGreen(),
      baseDarkerColor.getBlue(), baseColor.getAlpha() );
    var baseLighterColor = baseColor.brighterColor( 0.9 );
    var translucentBrighterColor = new Color( baseLighterColor.getRed(), baseLighterColor.getGreen(),
      baseLighterColor.getBlue(), baseColor.getAlpha() );
    var radius = diameter / 2;
    thisNode.addChild( new Path( new Shape().circle( 0, 0, radius, radius ), { fill: translucentBrighterColor } ) );
    var offsetFactor = 0.8;
    thisNode.addChild( new Path( new Shape().circle( 0, 0,
      radius * offsetFactor, radius * offsetFactor ), { fill: translucentDarkerColor } ) );

  }


  return inherit( Node, GrippyIndentNode );

} );

