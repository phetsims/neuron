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
function PotassiumIon() {
  Particle.call( this );
}

neuron.register( 'PotassiumIon', PotassiumIon );

export default inherit( Particle, PotassiumIon, {

  // @public
  getType: function() {
    return ParticleType.POTASSIUM_ION;
  },

  // @public
  getRepresentationColor: function() {
    return NeuronConstants.POTASSIUM_COLOR;
  }

} );