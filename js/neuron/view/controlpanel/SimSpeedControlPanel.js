// Copyright 2014-2019, University of Colorado Boulder

/**
 * Control panel for choosing the sim speed
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );
  const NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  const Panel = require( 'SUN/Panel' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings - labels for speed radio buttons
  const fastForwardString = require( 'string!NEURON/fastForward' );
  const normalString = require( 'string!NEURON/normal' );
  const slowMotionString = require( 'string!NEURON/slowMotion' );

  /**
   * @param {Property.<number>} speedProperty
   * @param {Object} options
   * @constructor
   */
  function SimSpeedControlPanel( speedProperty, options ) {

    options = _.extend( {
      fill: NeuronConstants.CONTROL_PANEL_BACKGROUND,
      stroke: NeuronConstants.CONTROL_PANEL_STROKE,
      xMargin: 8,
      yMargin: 6
    }, options );

    var radioButtonFont = NeuronConstants.CONTROL_PANEL_CONTROL_FONT;
    var speedRadioButtonGroup = new VerticalAquaRadioButtonGroup( speedProperty, [
      { node: new Text( fastForwardString, { font: radioButtonFont } ), value: 2 },
      { node: new Text( normalString, { font: radioButtonFont } ), value: 1 },
      { node: new Text( slowMotionString, { font: radioButtonFont } ), value: 0.5 }
    ], {
      radioButtonOptions: { radius: 8 },
      spacing: 8,
      touchAreaXDilation: 5
    } );

    Panel.call( this, speedRadioButtonGroup, options );
  }

  neuron.register( 'SimSpeedControlPanel', SimSpeedControlPanel );

  return inherit( Panel, SimSpeedControlPanel );
} );