// Copyright 2014-2017, University of Colorado Boulder
define( require => {
  'use strict';

  // modules
  const neuron = require( 'NEURON/neuron' );

  const ParticlePosition = {
    'INSIDE_MEMBRANE': 'INSIDE_MEMBRANE',
    'OUTSIDE_MEMBRANE': 'OUTSIDE_MEMBRANE'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ParticlePosition ); }

  neuron.register( 'ParticlePosition', ParticlePosition );

  return ParticlePosition;
} );