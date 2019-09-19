// Copyright 2014-2017, University of Colorado Boulder
/**
 * Abstract base class for all of the leak channels, which are the channels through which ions pass in/out independent
 * of the action potentials.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const MembraneChannel = require( 'NEURON/neuron/model/MembraneChannel' );
  const neuron = require( 'NEURON/neuron' );

  /**
   * @param {number} channelWidth
   * @param {number} channelHeight
   * @param {NeuronModel} modelContainingParticles
   * @constructor
   */
  function AbstractLeakChannel( channelWidth, channelHeight, modelContainingParticles ) {
    MembraneChannel.call( this, channelWidth, channelHeight, modelContainingParticles );
    this.reset();
  }

  neuron.register( 'AbstractLeakChannel', AbstractLeakChannel );

  return inherit( MembraneChannel, AbstractLeakChannel, {

    // @public
    stepInTime: function( dt ) {
      MembraneChannel.prototype.stepInTime.call( this, dt );
    },

    // @public
    reset: function() {
      this.setOpenness( 1 );  // Leak channels are always fully open.
    }

  } );
} );
