// Copyright 2014-2017, University of Colorado Boulder
/**
 * Model representation of a sodium ion.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );
  const NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  const Particle = require( 'NEURON/neuron/model/Particle' );
  const ParticleType = require( 'NEURON/neuron/model/ParticleType' );

  /**
   * @constructor
   */
  function SodiumIon() {
    Particle.call( this );
  }

  neuron.register( 'SodiumIon', SodiumIon );

  return inherit( Particle, SodiumIon, {

    // @public, @override
    getType: function() {
      return ParticleType.SODIUM_ION;
    },

    // @public, @override
    getRepresentationColor: function() {
      return NeuronConstants.SODIUM_COLOR;
    }

  } );
} );
