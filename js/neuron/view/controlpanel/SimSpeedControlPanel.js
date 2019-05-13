// Copyright 2014-2018, University of Colorado Boulder

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
  var neuron = require( 'NEURON/neuron' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );

  // strings - labels for speed radio buttons
  var fastForwardString = require( 'string!NEURON/fastForward' );
  var normalString = require( 'string!NEURON/normal' );
  var slowMotionString = require( 'string!NEURON/slowMotion' );

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