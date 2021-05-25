// Copyright 2014-2021, University of Colorado Boulder
/**
 * Possible types of particles used in this sim.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';

const ParticleType = {
  SODIUM_ION: 'SODIUM_ION',
  POTASSIUM_ION: 'POTASSIUM_ION'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( ParticleType ); }

neuron.register( 'ParticleType', ParticleType );

export default ParticleType;