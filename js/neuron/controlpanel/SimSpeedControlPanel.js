// Copyright 2002-2014, University of Colorado Boulder

/**
 * Control panel for choosing the sim speed
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var Panel = require( 'SUN/Panel' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );
  var Text = require( 'SCENERY/nodes/Text' );


  // strings - labels for speed radio buttons
  var fastForwardString = require( 'string!NEURON/fastForward' );
  var normalString = require( 'string!NEURON/normal' );
  var slowMotionString = require( 'string!NEURON/slowMotion' );

  /**
   * @param {Property.<number>} speedProperty
   * @constructor
   */
  function SimSpeedControlPanel( speedProperty ) {

    var radioButtonFont = NeuronConstants.CONTROL_PANEL_CONTROL_FONT;
    var speedRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      { node: new Text( fastForwardString, { font: radioButtonFont } ), property: speedProperty, value: 2 },
      { node: new Text( normalString, { font: radioButtonFont } ), property: speedProperty, value: 1 },
      { node: new Text( slowMotionString, { font: radioButtonFont } ), property: speedProperty, value: 0.5 }
    ], { radius: 8, spacing: 8 } );


    Panel.call( this, speedRadioButtonGroup, {
      // panel options
      fill: NeuronConstants.CONTROL_PANEL_BACKGROUND,
      stroke: NeuronConstants.CONTROL_PANEL_STROKE,
      xMargin: 8,
      yMargin: 6
    } );

  }

  return inherit( Panel, SimSpeedControlPanel );

} );