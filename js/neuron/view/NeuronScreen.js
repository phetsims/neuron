// Copyright 2014-2015, University of Colorado Boulder

/**
 * The main screen class for the 'Neuron' simulation.  This is where the main model and view instances are created and
 * inserted into the framework.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var NeuronModel = require( 'NEURON/neuron/model/NeuronModel' );
  var NeuronScreenView = require( 'NEURON/neuron/view/NeuronScreenView' );
  var NeuronClockModelAdapter = require( 'NEURON/neuron/model/NeuronClockModelAdapter' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var neuronTitleString = require( 'string!NEURON/neuron.title' );

  /**
   * Creates the model and view for the NeuronScreen
   * @constructor
   */
  function NeuronScreen() {
    var neuronModel = new NeuronModel();
    // NeuronModelAdapter intercepts the default Step function and provides "constant" clock and record Playback
    // features to NeuronModel, see NeuronClockModelAdapter
    var neuronClockModelAdapter = new NeuronClockModelAdapter( neuronModel );

    Screen.call( this, neuronTitleString, null /* no icon, single-screen sim */,
      function() { return neuronClockModelAdapter; },
      function( model ) { return new NeuronScreenView( model ); },
      { backgroundColor: '#ccfefa' }
    );
  }

  return inherit( Screen, NeuronScreen );
} );