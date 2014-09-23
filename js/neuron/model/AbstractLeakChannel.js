// Copyright 2002-2011, University of Colorado
/**
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var MembraneChannel = require( 'NEURON/neuron/model/MembraneChannel' );

  /**
   * @param  channelWidth
   * @param  channelHeight
   * @param {ParticleCapture} modelContainingParticles
   * @constructor
   */
  function AbstractLeakChannel( channelWidth, channelHeight, modelContainingParticles ) {
    MembraneChannel.call( this, channelWidth, channelHeight, modelContainingParticles );
    this.reset();
  }

  return inherit( MembraneChannel, AbstractLeakChannel, {
    stepInTime: function( dt ) {
      MembraneChannel.prototype.stepInTime.call( this, dt );
    },
    reset: function() {
      this.setOpenness( 1 );  // Leak channels are always fully open.
    }
  } );
} );
//// Copyright 2002-2011, University of Colorado
//package edu.colorado.phet.neuron.model;
//
//
//public abstract class AbstractLeakChannel extends MembraneChannel {
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------
//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//
//  //----------------------------------------------------------------------------
//  // Constructor
//  //----------------------------------------------------------------------------
//
//  public AbstractLeakChannel(double channelWidth, double channelHeight, IParticleCapture modelContainingParticles) {
//    super(channelWidth, channelHeight, modelContainingParticles);
//    reset();
//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------
//
//  @Override
//  public void reset() {
//    setOpenness(1);  // Leak channels are always fully open.
//  }
//}
