// Copyright 2002-2011, University of Colorado
/**
 * Factory to create different types pf  MembraneChannels
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';
  //imports
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );
  var SodiumLeakageChannel = require( 'NEURON/neuron/model/SodiumLeakageChannel' );


  return{
    //factory method for creating a MembraneChannel of the specified type.
    /**
     * @param {MembraneChannelTypes} channelType
     * @param {ParticleCapture} particleModel
     * @param {HodgkinHuxleyModel} hodgkinHuxleyModel
     * @returns {*}
     */
    createMembraneChannel: function( channelType, particleModel, hodgkinHuxleyModel ) {
      var membraneChannel = null;

      switch( channelType ) {
        case MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL:
          membraneChannel = new SodiumLeakageChannel( particleModel, hodgkinHuxleyModel );
          break;
        //Other Channel Types TODO
        default:
          assert && assert( false, "Error: Unrecognized channelType type." );
      }
      return membraneChannel;
    }
  };
} );