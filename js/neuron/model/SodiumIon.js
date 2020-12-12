// Copyright 2014-2020, University of Colorado Boulder
/**
 * Model representation of a sodium ion.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import Particle from './Particle.js';
import ParticleType from './ParticleType.js';

class SodiumIon extends Particle {

  constructor() {
    super();
  }

  // @public, @override
  getType() {
    return ParticleType.SODIUM_ION;
  }

  // @public, @override
  getRepresentationColor() {
    return NeuronConstants.SODIUM_COLOR;
  }
}

neuron.register( 'SodiumIon', SodiumIon );

export default SodiumIon;