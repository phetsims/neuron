// Copyright 2002-2011, University of Colorado

/**
 * Factory class for Particle
 *
 * @Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  var SodiumIon = require( 'NEURON/neuron/model/SodiumIon' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );

  return {
    /**
     * factory method for creating a particle of the specified type
     *
     * @param {enum} particleType - ParticleType enum constants
     * @returns {Particle}
     */
    createParticle: function( particleType ) {
      var newParticle = null;

      switch( particleType ) {
        case ParticleType.POTASSIUM_ION:
          newParticle = new PotassiumIon();
          break;
        case ParticleType.SODIUM_ION:
          newParticle = new SodiumIon();
          break;
        default:
          assert && assert( false, "Error: Unrecognized particle type." );
      }
      return newParticle;
    }
  };
} );