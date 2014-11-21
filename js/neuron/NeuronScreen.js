//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The 'Neuron' screen, which shows everything in that screen.
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
  var NeuronSharedConstants = require( 'NEURON/neuron/common/NeuronSharedConstants' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var neuronSimString = require( 'string!NEURON/neuron.name' );

  /**
   * Creates the model and view for the NeuronScreen
   * @constructor
   */
  function NeuronScreen() {
    var neuronModel = new NeuronModel();
    // NeuronModelAdapter intercepts the default Step function and provides
    // "constant" clock and record Playback features to NeuronModel, see NeuronClockModelAdapter
    var neuronClockModelAdapter = new NeuronClockModelAdapter( neuronModel, NeuronSharedConstants.CLOCK_FRAME_RATE,
      NeuronSharedConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT );

    Screen.call( this, neuronSimString, null /* no icon, single-screen sim */,
      function() { return neuronClockModelAdapter; },
      function( model ) { return new NeuronScreenView( model ); },
      { backgroundColor: '#ccfefa' }
    );

  }

  return inherit( Screen, NeuronScreen );
} );