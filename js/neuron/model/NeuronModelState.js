// Copyright 2014-2015, University of Colorado Boulder
/**
 * This class contains state information about the model for a given point in time.  It contains enough information for
 * the playback feature, but not necessarily enough to fully restore the simulation to an arbitrary point in time.

 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /*
   * JavaScript object dictionary only supports String as keys, but the channel's state are stored against Membrane
   * Channel object(key). This "map" utility supports this functionality by allowing any object to be used as key.
   * @returns {{put: put, get: get}}
   */
  function map() {
    var keys = [];
    var values = [];

    return {
      put: function( key, value ) {
        var index = keys.indexOf( key );
        if ( index === -1 ) {
          keys.push( key );
          values.push( value );
        }
        else {
          values[ index ] = value;
        }
      },
      get: function( key ) {
        return values[ keys.indexOf( key ) ];
      }
    };
  }

  /**
   * @param {NeuronModel} neuronModel
   * @constructor
   */
  function NeuronModelState( neuronModel ) {

    var thisNeuronModelState = this;

    // @private, accessed via getter methods
    thisNeuronModelState.axonMembraneState = neuronModel.getAxonMembrane().getState();
    thisNeuronModelState.hodgkinHuxleyModelState = neuronModel.hodgkinHuxleyModel.getState();
    thisNeuronModelState.membranePotential = neuronModel.getMembranePotential();
    thisNeuronModelState.sodiumExteriorConcentration = neuronModel.getSodiumExteriorConcentration();
    thisNeuronModelState.sodiumInteriorConcentration = neuronModel.getSodiumInteriorConcentration();
    thisNeuronModelState.potassiumExteriorConcentration = neuronModel.getPotassiumExteriorConcentration();
    thisNeuronModelState.potassiumInteriorConcentration = neuronModel.getPotassiumInteriorConcentration();

    // use c-style loops below for better performance

    var i;
    thisNeuronModelState.membraneChannelStateMap = map();
    for ( i = 0; i < neuronModel.membraneChannels.length; i++ ) {
      var membraneChannel = neuronModel.membraneChannels.get( i );
      thisNeuronModelState.membraneChannelStateMap.put( membraneChannel, membraneChannel.getState() );
    }

    thisNeuronModelState.particlePlaybackMementos = [];

    for ( i = 0; i < neuronModel.transientParticles.length; i++ ) {
      var transientParticle = neuronModel.transientParticles.get( i );
      thisNeuronModelState.particlePlaybackMementos.push( transientParticle.getPlaybackMemento() );
    }
  }

  return inherit( Object, NeuronModelState, {

    // @public
    getAxonMembraneState: function() {
      return this.axonMembraneState;
    },

    // @public
    getHodgkinHuxleyModelState: function() {
      return this.hodgkinHuxleyModelState;
    },

    // @public
    getMembraneChannelStateMap: function() {
      return this.membraneChannelStateMap;
    },

    // @public
    getPlaybackParticleMementos: function() {
      return this.particlePlaybackMementos;
    },

    // @public
    getMembranePotential: function() {
      return this.membranePotential;
    },

    // @public
    getSodiumInteriorConcentration: function() {
      return this.sodiumInteriorConcentration;
    },

    // @public
    getSodiumExteriorConcentration: function() {
      return this.sodiumExteriorConcentration;
    },

    // @public
    getPotassiumInteriorConcentration: function() {
      return this.potassiumInteriorConcentration;
    },

    // @public
    getPotassiumExteriorConcentration: function() {
      return this.potassiumExteriorConcentration;
    }
  } );
} );