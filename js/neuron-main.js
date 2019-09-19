// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main entry point for the neuron sim.
 */
define( require => {
  'use strict';

  // modules
  const NeuronProfiler = require( 'NEURON/neuron/common/NeuronProfiler' );
  const NeuronQueryParameters = require( 'NEURON/neuron/common/NeuronQueryParameters' );
  const NeuronScreen = require( 'NEURON/neuron/view/NeuronScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  const neuronTitleString = require( 'string!NEURON/neuron.title' );

  var simOptions = {
    credits: {
      leadDesign: 'Noah Podolefsky, Amanda McGarry',
      softwareDevelopment: 'John Blanco, Sharfudeen Ashraf',
      team: 'Wendy Adams, Fanny (Benay) Bentley, Janet Casagrand, Mike Klymkowsky, Ariel Paul, Katherine Perkins',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Ethan Johnson, Elise Morgan, Oliver Orejola, Bryan Yoelin',
      thanks: 'Conversion of this simulation to HTML5 was funded in part by the Ghent University.'
    },
    webgl: true
  };

  SimLauncher.launch( function() {

    // create and start the sim
    var sim = new Sim( neuronTitleString, [ new NeuronScreen() ], simOptions );
    sim.start();

    // This sim has some sim-specific profiling that can be done.  If the query parameter checked below is present,
    // the profiler is instantiated and made available.  There are several different profiling operations that can be
    // set through the query parameter, please see the NeuronProfiler.js file for details on these.
    if ( NeuronQueryParameters.neuronProfiler >= 1 ) {

      // create and hook up the neuron profiler
      window.phet.neuron.profiler = new NeuronProfiler( sim, NeuronQueryParameters.neuronProfiler );
    }
  } );
} );