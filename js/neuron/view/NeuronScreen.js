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
  var neuron = require( 'NEURON/neuron' );
  var NeuronModel = require( 'NEURON/neuron/model/NeuronModel' );
  var NeuronScreenView = require( 'NEURON/neuron/view/NeuronScreenView' );
  var NeuronClockModelAdapter = require( 'NEURON/neuron/model/NeuronClockModelAdapter' );
  var Screen = require( 'JOIST/Screen' );
  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   * Creates the model and view for the NeuronScreen
   * @constructor
   */
  function NeuronScreen() {

    Screen.call( this,
      function() { return new NeuronClockModelAdapter( new NeuronModel() ); }, // clock model adapter provides constant ticks to model
      function( model ) { return new NeuronScreenView( model ); },
      { backgroundColorProperty: new Property( Color.toColor( '#ccfefa' ) ) }
    );
  }

  neuron.register( 'NeuronScreen', NeuronScreen );

  return inherit( Screen, NeuronScreen );
} );