// Copyright 2014-2017, University of Colorado Boulder

/**
 * The main screen class for the 'Neuron' simulation.  This is where the main model and view instances are created and
 * inserted into the framework.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );
  const NeuronClockModelAdapter = require( 'NEURON/neuron/model/NeuronClockModelAdapter' );
  const NeuronModel = require( 'NEURON/neuron/model/NeuronModel' );
  const NeuronScreenView = require( 'NEURON/neuron/view/NeuronScreenView' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  /**
   * Creates the model and view for the NeuronScreen
   * @constructor
   */
  function NeuronScreen() {

    Screen.call( this,
      function() { return new NeuronClockModelAdapter( new NeuronModel() ); }, // clock model adapter provides constant ticks to model
      function( model ) { return new NeuronScreenView( model ); },
      { backgroundColorProperty: new Property( '#ccfefa' ) }
    );
  }

  neuron.register( 'NeuronScreen', NeuronScreen );

  return inherit( Screen, NeuronScreen );
} );
