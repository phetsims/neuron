// Copyright 2002-2011, University of Colorado

/**
 * A gated channel through which potassium passes when the channel is open.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var AbstractLeakChannel = require( 'NEURON/neuron/model/AbstractLeakChannel' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var PieSliceShapedCaptureZone = require( 'NEURON/neuron/model/PieSliceShapedCaptureZone' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var Color = require( 'SCENERY/util/Color' );

  var CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
  var CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.

  var BASE_COLOR = Color.interpolateRBGA( NeuronConstants.POTASSIUM_COLOR, new Color( 0, 200, 255 ), 0.6 );
  var DEFAULT_PARTICLE_VELOCITY = 5000; // In nanometers per sec of sim time.

  // Constants that define the rate and variability of particle capture.
  var MIN_INTER_PARTICLE_CAPTURE_TIME = 0.002; // In seconds of sim time.
  var MAX_INTER_PARTICLE_CAPTURE_TIME = 0.004; // In seconds of sim time.

  var RAND = {nextDouble: function() {
    return Math.random();
  }};

  /**
   * @param {ParticleCapture} modelContainingParticles
   * @param {IHodgkinHuxleyModel}hodgkinHuxleyModel
   * @constructor
   */
  function PotassiumLeakageChannel( modelContainingParticles, hodgkinHuxleyModel ) {
    var thisChannel = this;
    AbstractLeakChannel.call( thisChannel, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );

    // Set the speed at which particles will move through the channel.
    thisChannel.setParticleVelocity( DEFAULT_PARTICLE_VELOCITY );

    // Set up the capture zones for this channel.
    thisChannel.setInteriorCaptureZone( new PieSliceShapedCaptureZone( thisChannel.getCenterLocation(), CHANNEL_WIDTH * 5, Math.PI, Math.PI * 0.5 ) );
    thisChannel.setExteriorCaptureZone( new PieSliceShapedCaptureZone( thisChannel.getCenterLocation(), CHANNEL_WIDTH * 5, 0, Math.PI * 0.5 ) );

    // Set the rate of particle capture for leakage.
    thisChannel.setMinInterCaptureTime( MIN_INTER_PARTICLE_CAPTURE_TIME );
    thisChannel.setMaxInterCaptureTime( MAX_INTER_PARTICLE_CAPTURE_TIME );

    // Start the capture timer now, since leak channels are always
    // capturing particles.
    thisChannel.restartCaptureCountdownTimer( false );
  }

  return inherit( AbstractLeakChannel, PotassiumLeakageChannel, {
    stepInTime: function( dt ) {

      var prevOpenness = this.openness;
      var prevInActivationAmt = this.inactivationAmt;
      AbstractLeakChannel.prototype.stepInTime.call( this, dt );
      this.notifyIfMembraneStateChanged( prevOpenness, prevInActivationAmt );
    },
    getChannelColor: function() {
      return BASE_COLOR.colorUtilsDarker( 0.2 );
    },
    getEdgeColor: function() {
      return BASE_COLOR;
    },
    getParticleTypeToCapture: function() {
      return ParticleType.POTASSIUM_ION;
    },
    //  @Override
    chooseCrossingDirection: function() {
      // Generally, this channel leaks from in to out, since the
      // concentration of potassium is greater on the inside of the cell.
      // However, the IPHY people requested that there should occasionally
      // be some leakage in the other direction for greater realism, hence
      // the random choice below.
      var direction = MembraneCrossingDirection.IN_TO_OUT;
      if ( RAND.nextDouble() < 0.2 ) {
        direction = MembraneCrossingDirection.OUT_TO_IN;
      }
      return direction;
    }

  } );

} );
//
//package edu.colorado.phet.neuron.model;
//
//import java.awt.Color;
//
//import edu.colorado.phet.common.phetcommon.view.util.ColorUtils;
//import edu.colorado.phet.neuron.NeuronConstants;
//
//public class PotassiumLeakageChannel extends AbstractLeakChannel {
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------
//

//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//
//  //----------------------------------------------------------------------------
//  // Constructor(s)
//  //----------------------------------------------------------------------------
//
//  public PotassiumLeakageChannel(IParticleCapture modelContainingParticles, IHodgkinHuxleyModel hodgkinHuxleyModel) {

//  }
//
//  public PotassiumLeakageChannel(){
//    this(null, null);
//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------
//

//

//}
