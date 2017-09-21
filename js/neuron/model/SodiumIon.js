// Copyright 2014-2017, University of Colorado Boulder
/**
 * Model representation of a sodium ion.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var Particle = require( 'NEURON/neuron/model/Particle' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );

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
