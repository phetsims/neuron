// Copyright 2014-2019, University of Colorado Boulder
/**
 * Allowable types of membrane channels.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const neuron = require( 'NEURON/neuron' );

  const MembraneChannelTypes = {
    'SODIUM_LEAKAGE_CHANNEL': 'SODIUM_LEAKAGE_CHANNEL',
    'SODIUM_GATED_CHANNEL': 'SODIUM_GATED_CHANNEL',
    'POTASSIUM_LEAKAGE_CHANNEL': 'POTASSIUM_LEAKAGE_CHANNEL',
    'POTASSIUM_GATED_CHANNEL': 'POTASSIUM_GATED_CHANNEL'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( MembraneChannelTypes ); }

  neuron.register( 'MembraneChannelTypes', MembraneChannelTypes );

  return MembraneChannelTypes;
} );