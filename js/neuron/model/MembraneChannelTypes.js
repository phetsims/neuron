// Copyright 2014-2021, University of Colorado Boulder
/**
 * Allowable types of membrane channels.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';

const MembraneChannelTypes = {
  SODIUM_LEAKAGE_CHANNEL: 'SODIUM_LEAKAGE_CHANNEL',
  SODIUM_GATED_CHANNEL: 'SODIUM_GATED_CHANNEL',
  POTASSIUM_LEAKAGE_CHANNEL: 'POTASSIUM_LEAKAGE_CHANNEL',
  POTASSIUM_GATED_CHANNEL: 'POTASSIUM_GATED_CHANNEL'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( MembraneChannelTypes ); }

neuron.register( 'MembraneChannelTypes', MembraneChannelTypes );

export default MembraneChannelTypes;