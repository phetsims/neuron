// Copyright 2014-2017, University of Colorado Boulder
/**
 * Possible types of particles used in this sim.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const neuron = require( 'NEURON/neuron' );

  var ParticleType = {
    'SODIUM_ION': 'SODIUM_ION',
    'POTASSIUM_ION': 'POTASSIUM_ION'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ParticleType ); }

  neuron.register( 'ParticleType', ParticleType );

  return ParticleType;
} );