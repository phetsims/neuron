// Copyright 2016, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var neuron = require( 'NEURON/neuron' );

  var NeuronQueryParameters = QueryStringMachine.getAll( {

    // turn on the Neuron-specific profiler
    neuronProfiler: { type: 'number', defaultValue: -1 }
  } );

  neuron.register( 'NeuronQueryParameters', NeuronQueryParameters );

  return NeuronQueryParameters;
} );
