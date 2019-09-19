// Copyright 2014-2017, University of Colorado Boulder
/**
 * Enum that defines the direction for something that is crossing a cell membrane.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const neuron = require( 'NEURON/neuron' );

  var MembraneCrossingDirection = {
    'OUT_TO_IN': 'OUT_TO_IN',
    'IN_TO_OUT': 'IN_TO_OUT'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( MembraneCrossingDirection ); }

  neuron.register( 'MembraneCrossingDirection', MembraneCrossingDirection );

  return MembraneCrossingDirection;
} );