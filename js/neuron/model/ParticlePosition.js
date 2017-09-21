// Copyright 2014-2016, University of Colorado Boulder
define( function( require ) {
  'use strict';

  // modules
  var neuron = require( 'NEURON/neuron' );

  var ParticlePosition = {
    'INSIDE_MEMBRANE': 'INSIDE_MEMBRANE',
    'OUTSIDE_MEMBRANE': 'OUTSIDE_MEMBRANE'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ParticlePosition ); }

  neuron.register( 'ParticlePosition', ParticlePosition );

  return ParticlePosition;
} );