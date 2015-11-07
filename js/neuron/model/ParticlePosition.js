// Copyright 2014-2015, University of Colorado Boulder
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