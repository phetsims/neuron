// Copyright 2014-2024, University of Colorado Boulder

/**
 * @author Sam Reid
 */

import neuron from '../../neuron.js';

const ParticlePosition = {
  INSIDE_MEMBRANE: 'INSIDE_MEMBRANE',
  OUTSIDE_MEMBRANE: 'OUTSIDE_MEMBRANE'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( ParticlePosition ); }

neuron.register( 'ParticlePosition', ParticlePosition );

export default ParticlePosition;