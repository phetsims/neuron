// Copyright 2014-2019, University of Colorado Boulder
/**
 * Base class for gated membrane channels, i.e. channels that open and close.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';
import MembraneChannel from './MembraneChannel.js';

/**
 * @param {number} channelWidth
 * @param {number} channelHeight
 * @param {NeuronModel} modelContainingParticles
 * @constructor
 */
function GatedChannel( channelWidth, channelHeight, modelContainingParticles ) {
  MembraneChannel.call( this, channelWidth, channelHeight, modelContainingParticles );
  this.setOpenness( 0 );  // Gated channels are assumed to be initially closed.
}

neuron.register( 'GatedChannel', GatedChannel );

export default inherit( MembraneChannel, GatedChannel, {

  // @public
  reset: function() {
    this.setOpenness( 0 );         // Gated channels are assumed to be initially closed...
    this.setInactivationAmount( 0 );  // ...but not inactivated.
  }

} );