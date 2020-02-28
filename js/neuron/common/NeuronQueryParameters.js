// Copyright 2016-2020, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author John Blanco
 */

import neuron from '../../neuron.js';

const NeuronQueryParameters = QueryStringMachine.getAll( {

  // turn on the Neuron-specific profiler
  neuronProfiler: { type: 'number', defaultValue: -1 }
} );

neuron.register( 'NeuronQueryParameters', NeuronQueryParameters );

export default NeuronQueryParameters;