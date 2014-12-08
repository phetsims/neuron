//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The main screen class for the 'Neuron' simulation.  This is where the main model and view instances are created and
 * inserted into the framework.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var NeuronModel = require( 'NEURON/neuron/model/NeuronModel' );
  var NeuronScreenView = require( 'NEURON/neuron/view/NeuronScreenView' );
  var NeuronClockModelAdapter = require( 'NEURON/neuron/model/NeuronClockModelAdapter' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var neuronSimString = require( 'string!NEURON/neuron.name' );

  /**
   * Creates the model and view for the NeuronScreen
   * @constructor
   */
  function NeuronScreen() {
    var neuronModel = new NeuronModel();
    // NeuronModelAdapter intercepts the default Step function and provides "constant" clock and record Playback
    // features to NeuronModel, see NeuronClockModelAdapter
    var neuronClockModelAdapter = new NeuronClockModelAdapter( neuronModel, NeuronConstants.CLOCK_FRAME_RATE,
      NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT );

    Screen.call( this, neuronSimString, null /* no icon, single-screen sim */,
      function() { return neuronClockModelAdapter; },
      function( model ) { return new NeuronScreenView( model ); },
      { backgroundColor: '#ccfefa' }
    );

  }

  return inherit( Screen, NeuronScreen );
} );