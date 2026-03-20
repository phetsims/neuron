// Copyright 2014-2026, University of Colorado Boulder
/**
 * Possible types of particles used in this sim.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

const ParticleType = {
  SODIUM_ION: 'SODIUM_ION',
  POTASSIUM_ION: 'POTASSIUM_ION'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( ParticleType ); }

export default ParticleType;
