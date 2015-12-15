// Copyright 2014-2015, University of Colorado Boulder
/**
 * NeuronConstants is a collection of constants that configure global properties. If you change something here, it will
 * change *everywhere* in this simulation.
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Color = require( 'SCENERY/util/Color' );

  var clockFrameRate = 60;
  var minActionPotentialClockDT = ( 1 / clockFrameRate ) / 3000;
  var maxActionPotentialClockDT = ( 1 / clockFrameRate ) / 1000;

  var NeuronConstants = {

    // Fonts
    CONTROL_PANEL_TITLE_FONT: new PhetFont( { weight: 'bold', size: 14 } ),
    CONTROL_PANEL_CONTROL_FONT: new PhetFont( { size: 14 } ),

    // Fill and stroke colors
    CANVAS_BACKGROUND: new Color( 204, 255, 249 ),
    CONTROL_PANEL_BACKGROUND: new Color( 239, 239, 195 ),
    CONTROL_PANEL_STROKE: new Color( 100, 100, 100 ),

    // Colors to use when representing various atoms.
    SODIUM_COLOR: PhetColorScheme.RED_COLORBLIND,
    POTASSIUM_COLOR: new Color( 0, 240, 100 ),
    PROJECT_NAME: 'neuron',
    MEMBRANE_THICKNESS: 4, // In nanometers, obtained from web research.
    DEFAULT_DIAMETER: 150, // In nanometers.
    SCREEN_BACKGROUND: '#ccfefa',

    // Set up the clock ranges for the various modules.  Note that for this sim the clock rates are often several orders
    // of magnitude slower than real time.
    MIN_ACTION_POTENTIAL_CLOCK_DT: minActionPotentialClockDT,
    MAX_ACTION_POTENTIAL_CLOCK_DT: maxActionPotentialClockDT,
    DEFAULT_ACTION_POTENTIAL_CLOCK_DT: (minActionPotentialClockDT + maxActionPotentialClockDT) * 0.55,
    TIME_SPAN: 25, // In seconds.
    DEFAULT_MAX_VELOCITY: 40000
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( NeuronConstants ); }

  return NeuronConstants;
} );
