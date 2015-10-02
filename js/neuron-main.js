// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main entry point for the neuron sim.
 */
define( function( require ) {
  'use strict';

  // modules
  var NeuronProfiler = require( 'NEURON/neuron/NeuronProfiler' );
  var NeuronScreen = require( 'NEURON/neuron/NeuronScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!NEURON/neuron.title' );

  var simOptions = {
    credits: {
      leadDesign: 'Noah Podolefsky, Amanda McGarry',
      softwareDevelopment: 'John Blanco, Sharfudeen Ashraf',
      team: 'Wendy Adams, Fanny (Benay) Bentley, Janet Casagrand, Mike Klymkowsky,\nAriel Paul, Katherine Perkins',
      thanks: 'Conversion of this simulation to HTML5 was funded in part by the Ghent University.'
    }
  };

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [ new NeuronScreen() ], simOptions );
    sim.start();

    window.phet.neuron = window.phet.neuron || {};

    // this sim has some sim-specific profiling that can be done, so set it up if query params dictate
    if ( window.phet.chipper.getQueryParameters().hasOwnProperty( 'neuronProfiler' ) ) {
      // create and hook up the neuron profiler
      window.phet.neuron.profiler = new NeuronProfiler( sim, parseInt( window.phet.chipper.getQueryParameters().neuronProfiler ) );
    }
  } );
} );