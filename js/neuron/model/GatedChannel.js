// Copyright 2014-2020, University of Colorado Boulder
/**
 * Base class for gated membrane channels, i.e. channels that open and close.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import MembraneChannel from './MembraneChannel.js';

class GatedChannel extends MembraneChannel {

  /**
   * @param {number} channelWidth
   * @param {number} channelHeight
   * @param {NeuronModel} modelContainingParticles
   */
  constructor( channelWidth, channelHeight, modelContainingParticles ) {
    super( channelWidth, channelHeight, modelContainingParticles );
    this.setOpenness( 0 );  // Gated channels are assumed to be initially closed.
  }

  // @public
  reset() {
    this.setOpenness( 0 );         // Gated channels are assumed to be initially closed...
    this.setInactivationAmount( 0 );  // ...but not inactivated.
  }
}

neuron.register( 'GatedChannel', GatedChannel );

export default GatedChannel;