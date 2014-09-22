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
  var GatedChannel = require( 'NEURON/neuron/model/GatedChannel' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var PieSliceShapedCaptureZone = require( 'NEURON/neuron/model/PieSliceShapedCaptureZone' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var NeuronSharedConstants = require( 'NEURON/neuron/common/NeuronSharedConstants' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var MathUtils = require( 'NEURON/neuron/utils/MathUtils' );

  var CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
  var CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.

  // Constants that control the rate at which this channel will capture ions
  // when it is open.  Smaller numbers here will increase the capture rate
  // and thus make the flow appear to be faster.
  var MIN_INTER_CAPTURE_TIME = 0.00005; // In seconds of sim time.
  var MAX_INTER_CAPTURE_TIME = 0.00020; // In seconds of sim time.

  // Constant used when calculating how open this gate should be based on
  // a value that exists within the Hodgkin-Huxley model.  This was
  // empirically determined.
  var N4_WHEN_FULLY_OPEN = 0.35;

  // Delay range - used to make the timing of the instances of this gate
  // vary a little bit in terms of when they open and close.
  var MAX_STAGGER_DELAY = NeuronSharedConstants.MIN_ACTION_POTENTIAL_CLOCK_DT * 10; // In seconds of sim time.

  var RAND = {nextDouble: function() {
    return Math.random();
  }};

  /**
   * @param {ParticleCapture} modelContainingParticles
   * @param {IHodgkinHuxleyModel}hodgkinHuxleyModel
   * @constructor
   */
  function PotassiumGatedChannel( modelContainingParticles, hodgkinHuxleyModel ) {
    var thisChannel = this;
    GatedChannel.call( thisChannel, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );
    thisChannel.staggerDelay = RAND.nextDouble() * MAX_STAGGER_DELAY;
    thisChannel.hodgkinHuxleyModel = hodgkinHuxleyModel;
    thisChannel.setInteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterLocation(), CHANNEL_WIDTH * 5, Math.PI, Math.PI * 0.5 ) );
    thisChannel.reset();
  }

  return inherit( GatedChannel, PotassiumGatedChannel, {
    stepInTime: function( dt ) {
      GatedChannel.prototype.stepInTime.call( this, dt );
      // Update the openness factor based on the state of the HH model.
      // This is very specific to the model and the type of channel.  Note
      // the non-linear mapping of conductance to the openness factor for
      // the channels.  This is to make the gates appear to snap open and
      // closed more rapidly, which was requested by the IPHY folks after
      // seeing some demos.
      var normalizedConductance =
        Math.min( Math.abs( this.hodgkinHuxleyModel.get_delayed_n4( this.staggerDelay ) ) / N4_WHEN_FULLY_OPEN, 1 );
      var openness = 1 - Math.pow( normalizedConductance - 1, 2 );
      if ( openness > 0 && openness < 1 ) {
        // Trim off some digits, otherwise we are continuously making
        // tiny changes to this value due to internal gyrations of the
        // HH model.
        openness = MathUtils.round( openness, 2 );
      }
      if ( openness !== this.getOpenness() ) {
        this.setOpenness( openness );
        if ( this.isOpen() && this.getCaptureCountdownTimer() === Number.POSITIVE_INFINITY ) {
          // We have just transitioned to the open state, so it is time
          // to start capturing ions.
          this.restartCaptureCountdownTimer( true );
        }
      }
    },
    //@Override
    reset: function() {
      GatedChannel.prototype.reset.call( this );
      // Set up the capture time range, which will be used to control the
      // rate of particle capture when this gate is open.
      this.setMinInterCaptureTime( MIN_INTER_CAPTURE_TIME );
      this.setMaxInterCaptureTime( MAX_INTER_CAPTURE_TIME );
    },
    getChannelColor: function() {
      return NeuronConstants.POTASSIUM_COLOR.colorUtilsDarker( 0.2 );
    },
    getEdgeColor: function() {
      return NeuronConstants.POTASSIUM_COLOR;
    },
    getParticleTypeToCapture: function() {
      return ParticleType.POTASSIUM_ION;
    },
    chooseCrossingDirection: function() {
      return MembraneCrossingDirection.IN_TO_OUT;
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
//import edu.colorado.phet.neuron.module.NeuronDefaults;
//import edu.colorado.phet.neuron.utils.MathUtils;

//public class PotassiumGatedChannel extends GatedChannel {
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------

//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//
//  private IHodgkinHuxleyModel hodgkinHuxleyModel;
//  private double staggerDelay = RAND.nextDouble() * MAX_STAGGER_DELAY;
//
//  //----------------------------------------------------------------------------
//  // Constructor
//  //----------------------------------------------------------------------------
//
//  public PotassiumGatedChannel(IParticleCapture modelContainingParticles, IHodgkinHuxleyModel hodgkinHuxleyModel) {

//  }
//
//  public PotassiumGatedChannel(){
//    this(null, null);
//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------

//

//
//  @Override
//  public void stepInTime(double dt) {

//  }

//}
