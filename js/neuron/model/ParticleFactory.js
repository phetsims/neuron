// Copyright 2014-2019, University of Colorado Boulder

/**
 * Factory class for Particle
 *
 * @Sharfudeen Ashraf (for Ghent University)
 */

define( require => {
  'use strict';

  // modules
  const neuron = require( 'NEURON/neuron' );
  const ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  const PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  const SodiumIon = require( 'NEURON/neuron/model/SodiumIon' );

  const ParticleFactory = {
    /**
     * factory method for creating a particle of the specified type
     * @param {ParticleType} particleType - ParticleType enum constants
     * @returns {Particle}
     * @public
     */
    createParticle: function( particleType ) {
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

  return ParticleFactory;
} );