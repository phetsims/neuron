// Copyright 2014-2020, University of Colorado Boulder
/**
 * Abstract base class for all of the leak channels, which are the channels through which ions pass in/out independent
 * of the action potentials.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import MembraneChannel from './MembraneChannel.js';

class AbstractLeakChannel extends MembraneChannel {

  /**
   * @param {number} channelWidth
   * @param {number} channelHeight
   * @param {NeuronModel} modelContainingParticles
   */
  constructor( channelWidth, channelHeight, modelContainingParticles ) {
    super( channelWidth, channelHeight, modelContainingParticles );
    this.reset();
  }

  // @public
  stepInTime( dt ) {
    super.stepInTime( dt );
  }

  // @public
  reset() {
    this.setOpenness( 1 );  // Leak channels are always fully open.
  }
}

neuron.register( 'AbstractLeakChannel', AbstractLeakChannel );

export default AbstractLeakChannel;