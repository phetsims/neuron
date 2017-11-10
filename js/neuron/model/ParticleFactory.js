// Copyright 2014-2017, University of Colorado Boulder

/**
 * Factory class for Particle
 *
 * @Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var neuron = require( 'NEURON/neuron' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  var SodiumIon = require( 'NEURON/neuron/model/SodiumIon' );

  var ParticleFactory = {
    /**
     * factory method for creating a particle of the specified type
     * @param {ParticleType} particleType - ParticleType enum constants
     * @returns {Particle}
     * @public
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
          assert && assert( false, 'Error: Unrecognized particle type.' );
      }
      return newParticle;
    }
  };

  neuron.register( 'ParticleFactory', ParticleFactory );

  return ParticleFactory;
} );