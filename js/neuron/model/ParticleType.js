// Copyright 2002-2011, University of Colorado
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