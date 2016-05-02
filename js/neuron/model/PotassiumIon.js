// Copyright 2014-2015, University of Colorado Boulder

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
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var Particle = require( 'NEURON/neuron/model/Particle' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var neuron = require( 'NEURON/neuron' );

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
