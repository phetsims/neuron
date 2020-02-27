// Copyright 2014-2019, University of Colorado Boulder
/**
 * Model representation of a sodium ion.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import Particle from './Particle.js';
import ParticleType from './ParticleType.js';

/**
 * @constructor
 */
function SodiumIon() {
  Particle.call( this );
}

neuron.register( 'SodiumIon', SodiumIon );

export default inherit( Particle, SodiumIon, {

  // @public, @override
  getType: function() {
    return ParticleType.SODIUM_ION;
  },

  // @public, @override
  getRepresentationColor: function() {
    return NeuronConstants.SODIUM_COLOR;
  }

} );