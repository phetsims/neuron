// Copyright 2002-2011, University of Colorado
/**
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';
  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var Particle = require( 'NEURON/neuron/model/Particle' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );

  function SodiumIon() {
     Particle.call( this );
  }

  return inherit(Particle,SodiumIon, {

    getType: function() {
      return ParticleType.SODIUM_ION;
    },
    getRepresentationColor: function() {
      return NeuronConstants.SODIUM_COLOR;
    }
  } );

} );


