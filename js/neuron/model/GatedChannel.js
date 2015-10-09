// Copyright 2002-2015, University of Colorado Boulder
/**
 * Base class for gated membrane channels, i.e. channels that open and close.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MembraneChannel = require( 'NEURON/neuron/model/MembraneChannel' );

  /**
   * @param  {number} channelWidth
   * @param  {number} channelHeight
   * @param {NeuronModel} modelContainingParticles
   * @constructor
   */
  function GatedChannel( channelWidth, channelHeight, modelContainingParticles ) {
    MembraneChannel.call( this, channelWidth, channelHeight, modelContainingParticles );
    this.setOpenness( 0 );  // Gated channels are assumed to be initially closed.
  }

  return inherit( MembraneChannel, GatedChannel, {

    // @public
    reset: function() {
      this.setOpenness( 0 );         // Gated channels are assumed to be initially closed...
      this.setInactivationAmt( 0 );  // ...but not inactivated.
    }

  } );
} );
