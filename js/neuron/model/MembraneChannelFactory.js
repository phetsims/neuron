// Copyright 2014-2020, University of Colorado Boulder
/**
 * Factory to create different types of MembraneChannels
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import MembraneChannelTypes from './MembraneChannelTypes.js';
import PotassiumGatedChannel from './PotassiumGatedChannel.js';
import PotassiumLeakageChannel from './PotassiumLeakageChannel.js';
import SodiumDualGatedChannel from './SodiumDualGatedChannel.js';
import SodiumLeakageChannel from './SodiumLeakageChannel.js';

const MembraneChannelFactory = {
  /**
   * factory method for creating a MembraneChannel of the specified type.
   * @param {MembraneChannelTypes} channelType
   * @param {NeuronModel} particleModel
   * @param {HodgkinHuxleyModel} hodgkinHuxleyModel
   * @returns {MembraneChannel}
   * @public
   */
  createMembraneChannel( channelType, particleModel, hodgkinHuxleyModel ) {
    let membraneChannel = null;
    switch( channelType ) {
      case MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL:
        membraneChannel = new SodiumLeakageChannel( particleModel, hodgkinHuxleyModel );
        break;
      case MembraneChannelTypes.SODIUM_GATED_CHANNEL:
        membraneChannel = new SodiumDualGatedChannel( particleModel, hodgkinHuxleyModel );
        break;
      case MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL:
        membraneChannel = new PotassiumLeakageChannel( particleModel, hodgkinHuxleyModel );
        break;
      case MembraneChannelTypes.POTASSIUM_GATED_CHANNEL:
        membraneChannel = new PotassiumGatedChannel( particleModel, hodgkinHuxleyModel );
        break;
      default:
        assert && assert( false, 'Error: Unrecognized channelType type.' );
    }
    return membraneChannel;
  }
};

neuron.register( 'MembraneChannelFactory', MembraneChannelFactory );

export default MembraneChannelFactory;