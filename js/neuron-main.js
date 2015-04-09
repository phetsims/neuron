// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main entry point for the neuron sim.
 */
define( function( require ) {
  'use strict';

  // modules
  var NeuronScreen = require( 'NEURON/neuron/NeuronScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!NEURON/neuron.name' );

  var simOptions = {
    credits: {
      leadDesign: 'Noah Podolefsky',
      softwareDevelopment: 'John Blanco, Sharfudeen Ashraf',
      team: 'Wendy Adams, Fanny (Benay) Bentley, Janet Casagrand, Mike Klymkowsky,\nAmanda McGarry, Ariel Paul, Katherine Perkins',
      thanks: 'Conversion of this simulation to HTML5 was funded in part by the Ghent University.'
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.chipper.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
    }, simOptions );
  }

  SimLauncher.launch( function() {
    var sim = new Sim( simTitle, [ new NeuronScreen() ], simOptions );
    sim.start();
  } );
} );