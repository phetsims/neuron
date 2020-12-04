// Copyright 2014-2020, University of Colorado Boulder

/**
 * Factory class for Particle
 *
 * @Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import ParticleType from './ParticleType.js';
import PotassiumIon from './PotassiumIon.js';
import SodiumIon from './SodiumIon.js';

const ParticleFactory = {
  /**
   * factory method for creating a particle of the specified type
   * @param {ParticleType} particleType - ParticleType enum constants
   * @returns {Particle}
   * @public
   */
  createParticle( particleType ) {
    let newParticle = null;

    switch( particleType ) {
      case ParticleType.POTASSIUM_ION:
        newParticle = new PotassiumIon();
        break;
      case ParticleType.SODIUM_ION:
        newParticle = new SodiumIon();
        break;
      default:
        assert && assert( false, 'Error: Unrecognized particle type.' );
    }
    return newParticle;
  }
};

neuron.register( 'ParticleFactory', ParticleFactory );

export default ParticleFactory;