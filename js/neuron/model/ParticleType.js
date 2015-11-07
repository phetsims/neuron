// Copyright 2014-2015, University of Colorado Boulder
/**
 * Possible types of particles used in this sim.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function() {
  'use strict';

  var ParticleType = {
    'SODIUM_ION': 'SODIUM_ION',
    'POTASSIUM_ION': 'POTASSIUM_ION'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ParticleType ); }

  return ParticleType;
} );