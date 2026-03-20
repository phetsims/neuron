// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model representation of a sodium ion.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import NeuronConstants from '../common/NeuronConstants.js';
import Particle from './Particle.js';
import ParticleType from './ParticleType.js';

class PotassiumIon extends Particle {

  constructor() {
    super();
  }

  // @public
  getType() {
    return ParticleType.POTASSIUM_ION;
  }

  // @public
  getRepresentationColor() {
    return NeuronConstants.POTASSIUM_COLOR;
  }
}

export default PotassiumIon;
