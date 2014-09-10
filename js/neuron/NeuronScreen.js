//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The 'Neuron' screen, which shows everything in that screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NeuronModel = require( 'NEURON/neuron/model/NeuronModel' );
  var NeuronScreenView = require( 'NEURON/neuron/view/NeuronScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var neuronSimString = require( 'string!NEURON/neuron.name' );

  /**
   * Creates the model and view for the NeuronScreen
   * @constructor
   */
  function NeuronScreen() {
    Screen.call( this, neuronSimString, null /* no icon, single-screen sim */,
      function() { return new NeuronModel(); },
      function( model ) { return new NeuronScreenView( model ); },
      { backgroundColor: '#ccfefa' }
    );

  }

  return inherit( Screen, NeuronScreen );
} );