// Copyright 2014-2015, University of Colorado Boulder

/**
 * Main entry point for the neuron sim.
 */
define( function( require ) {
  'use strict';

  // modules
  var NeuronProfiler = require( 'NEURON/neuron/common/NeuronProfiler' );
  var NeuronScreen = require( 'NEURON/neuron/view/NeuronScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var neuronTitleString = require( 'string!NEURON/neuron.title' );

  var simOptions = {
    credits: {
      leadDesign: 'Noah Podolefsky, Amanda McGarry',
      softwareDevelopment: 'John Blanco, Sharfudeen Ashraf',
      team: 'Wendy Adams, Fanny (Benay) Bentley, Janet Casagrand, Mike Klymkowsky,\nAriel Paul, Katherine Perkins',
      qualityAssurance: 'Steele Dalton, Elise Morgan, Oliver Orejola, Bryan Yoelin',
      thanks: 'Conversion of this simulation to HTML5 was funded in part by the Ghent University.'
    }
  };

  SimLauncher.launch( function() {

    // create and start the sim
    var sim = new Sim( neuronTitleString, [ new NeuronScreen() ], simOptions );
    sim.start();

    // This sim has some sim-specific profiling that can be done.  If the query parameter checked below is present,
    // the profiler is instantiated and made available.  There are several different profiling operations that can be
    // set through the query parameter, please see the NeuronProfiler.js file for details on these.
    if ( window.phet.chipper.getQueryParameters().hasOwnProperty( 'neuronProfiler' ) ) {
      // create and hook up the neuron profiler
      window.phet.neuron.profiler = new NeuronProfiler( sim, parseInt( window.phet.chipper.getQueryParameters().neuronProfiler ) );
    }
  } );
} );