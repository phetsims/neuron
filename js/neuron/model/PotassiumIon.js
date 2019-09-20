// Copyright 2014-2019, University of Colorado Boulder

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
  function PotassiumIon() {
    Particle.call( this );
  }

  neuron.register( 'PotassiumIon', PotassiumIon );

  return inherit( Particle, PotassiumIon, {

    // @public
    getType: function() {
      return ParticleType.POTASSIUM_ION;
    },

    // @public
    getRepresentationColor: function() {
      return NeuronConstants.POTASSIUM_COLOR;
    }

  } );
} );
