// Copyright 2014-2017, University of Colorado Boulder
/**
 * Behavior modes that were decided upon after testing
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const neuron = require( 'NEURON/neuron' );

  var BehaviourModeType = {
    pauseAtEndOfPlayback: true,
    recordAtEndOfPlayback: false
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( BehaviourModeType ); }

  neuron.register( 'BehaviourModeType', BehaviourModeType );

  return BehaviourModeType;
} );