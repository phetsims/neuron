// Copyright 2014-2017, University of Colorado Boulder
/**
 * Factory to create different types of MembraneChannels
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( require => {
  'use strict';

  // modules
  const MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );
  const neuron = require( 'NEURON/neuron' );
  const PotassiumGatedChannel = require( 'NEURON/neuron/model/PotassiumGatedChannel' );
  const PotassiumLeakageChannel = require( 'NEURON/neuron/model/PotassiumLeakageChannel' );
  const SodiumDualGatedChannel = require( 'NEURON/neuron/model/SodiumDualGatedChannel' );
  const SodiumLeakageChannel = require( 'NEURON/neuron/model/SodiumLeakageChannel' );

  const MembraneChannelFactory = {
    /**
     * factory method for creating a MembraneChannel of the specified type.
     * @param {MembraneChannelTypes} channelType
     * @param {NeuronModel} particleModel
     * @param {HodgkinHuxleyModel} hodgkinHuxleyModel
     * @returns {MembraneChannel}
     * @public
     */
    createMembraneChannel: function( channelType, particleModel, hodgkinHuxleyModel ) {
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

  return MembraneChannelFactory;
} );