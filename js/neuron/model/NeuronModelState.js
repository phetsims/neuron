// Copyright 2014-2019, University of Colorado Boulder
/**
 * This class contains state information about the model for a given point in time.  It contains enough information for
 * the playback feature, but not necessarily enough to fully restore the simulation to an arbitrary point in time.

 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );

  /*
   * JavaScript object dictionary only supports String as keys, but the channel's state are stored against Membrane
   * Channel object(key). This "map" utility supports this functionality by allowing any object to be used as key.
   * @returns {{put: put, get: get}}
   */
  function map() {
    const keys = [];
    const values = [];

    return {
      put: function( key, value ) {
        const index = keys.indexOf( key );
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

    // @private, accessed via getter methods
    this.axonMembraneState = neuronModel.getAxonMembrane().getState();
    this.hodgkinHuxleyModelState = neuronModel.hodgkinHuxleyModel.getState();
    this.membranePotential = neuronModel.getMembranePotential();
    this.sodiumExteriorConcentration = neuronModel.getSodiumExteriorConcentration();
    this.sodiumInteriorConcentration = neuronModel.getSodiumInteriorConcentration();
    this.potassiumExteriorConcentration = neuronModel.getPotassiumExteriorConcentration();
    this.potassiumInteriorConcentration = neuronModel.getPotassiumInteriorConcentration();

    // use c-style loops below for better performance

    let i;
    this.membraneChannelStateMap = map();
    for ( i = 0; i < neuronModel.membraneChannels.length; i++ ) {
      const membraneChannel = neuronModel.membraneChannels.get( i );
      this.membraneChannelStateMap.put( membraneChannel, membraneChannel.getState() );
    }

    this.particlePlaybackMementos = [];

    for ( i = 0; i < neuronModel.transientParticles.length; i++ ) {
      const transientParticle = neuronModel.transientParticles.get( i );
      this.particlePlaybackMementos.push( transientParticle.getPlaybackMemento() );
    }
  }

  neuron.register( 'NeuronModelState', NeuronModelState );

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