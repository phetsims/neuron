// Copyright 2002-2011, University of Colorado
/**
 * TemplateConstants is a collection of constants that configure global properties.
 * If you change something here, it will change *everywhere* in this simulation.
 *
 * @author Chris Malley (cmalley@pixelzoom.com)
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';
  //imports
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Color = require( 'SCENERY/util/Color' );

  return Object.freeze( {
    // Fonts
    CONTROL_PANEL_TITLE_FONT: new PhetFont( {weight: 'bold', size: 14} ),
    CONTROL_PANEL_CONTROL_FONT: new PhetFont( { size: 14} ),
    // Color of the play area
    CANVAS_BACKGROUND: new Color( 204, 255, 249 ),
    // Colors to use when representing various atoms.
    SODIUM_COLOR: new Color( 240, 0, 0 ),
    POTASSIUM_COLOR: new Color( 0, 240, 100 ),
    PROJECT_NAME: "neuron",
    MEMBRANE_THICKNESS: 4, // In nanometers, obtained from web research.
    DEFAULT_DIAMETER: 150 // In nanometers.
  } );

} );
