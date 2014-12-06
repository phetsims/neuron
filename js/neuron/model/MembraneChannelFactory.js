// Copyright 2002-2011, University of Colorado
/**
 * Factory to create different types of MembraneChannels
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );
  var PotassiumGatedChannel = require( 'NEURON/neuron/model/PotassiumGatedChannel' );
  var SodiumLeakageChannel = require( 'NEURON/neuron/model/SodiumLeakageChannel' );
  var PotassiumLeakageChannel = require( 'NEURON/neuron/model/PotassiumLeakageChannel' );
  var SodiumDualGatedChannel = require( 'NEURON/neuron/model/SodiumDualGatedChannel' );

  return{
    /**
     * factory method for creating a MembraneChannel of the specified type.
     * @param {MembraneChannelTypes} channelType
     * @param {ParticleCapture} particleModel
     * @param {HodgkinHuxleyModel} hodgkinHuxleyModel
     * @returns {MembraneChannel}
     */
    createMembraneChannel: function( channelType, particleModel, hodgkinHuxleyModel ) {
      var membraneChannel = null;
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
          assert && assert( false, "Error: Unrecognized channelType type." );
      }
      return membraneChannel;
    }
  };
} );