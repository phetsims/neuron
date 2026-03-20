// Copyright 2014-2026, University of Colorado Boulder

/**
 * @author Sam Reid
 */

const ParticlePosition = {
  INSIDE_MEMBRANE: 'INSIDE_MEMBRANE',
  OUTSIDE_MEMBRANE: 'OUTSIDE_MEMBRANE'
};

// verify that enum is immutable, without the runtime penalty in production code
if ( assert ) { Object.freeze( ParticlePosition ); }

export default ParticlePosition;
