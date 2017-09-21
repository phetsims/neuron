// Copyright 2014-2016, University of Colorado Boulder
/**
 * Behavior modes that were decided upon after testing
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var neuron = require( 'NEURON/neuron' );

  var BehaviourModeType = {
    pauseAtEndOfPlayback: true,
    recordAtEndOfPlayback: false
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( BehaviourModeType ); }

  neuron.register( 'BehaviourModeType', BehaviourModeType );

  return BehaviourModeType;
} );