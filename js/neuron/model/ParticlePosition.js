// Copyright 2002-2011, University of Colorado
define( function() {
  'use strict';

  var ParticlePosition = {
    'INSIDE_MEMBRANE': 'INSIDE_MEMBRANE',
    'OUTSIDE_MEMBRANE': 'OUTSIDE_MEMBRANE'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ParticlePosition ); }

  return ParticlePosition;
} );