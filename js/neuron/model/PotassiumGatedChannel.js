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


  var CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
  var CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.

  /**
   * @param {ParticleCapture} modelContainingParticles
   * @param {IHodgkinHuxleyModel}hodgkinHuxleyModel
   * @constructor
   */
  function PotassiumGatedChannel( modelContainingParticles, hodgkinHuxleyModel ) {
    var thisChannel = this;
    GatedChannel.call( thisChannel, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );
    thisChannel.hodgkinHuxleyModel = hodgkinHuxleyModel;
    thisChannel.setInteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterLocation(), CHANNEL_WIDTH * 5, Math.PI, Math.PI * 0.5 ) );
    thisChannel.reset();
  }

  return inherit( GatedChannel, PotassiumGatedChannel, {
    stepInTime: function( dt ) {
      //TODO
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
      //TODO
    },
    restartCaptureCountdownTimer: function( captureNow ) {
      //TODO
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

//  // Constants that control the rate at which this channel will capture ions
//  // when it is open.  Smaller numbers here will increase the capture rate
//  // and thus make the flow appear to be faster.
//  private static final double MIN_INTER_CAPTURE_TIME = 0.00005; // In seconds of sim time.
//  private static final double MAX_INTER_CAPTURE_TIME = 0.00020; // In seconds of sim time.
//
//  // Constant used when calculating how open this gate should be based on
//  // a value that exists within the Hodgkin-Huxley model.  This was
//  // empirically determined.
//  private static final double N4_WHEN_FULLY_OPEN = 0.35;
//
//  // Delay range - used to make the timing of the instances of this gate
//  // vary a little bit in terms of when they open and close.
//  private static final double MAX_STAGGER_DELAY = NeuronDefaults.MIN_ACTION_POTENTIAL_CLOCK_DT * 10; // In seconds of sim time.
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
//  @Override
//  public Color getChannelColor() {
//    return ColorUtils.darkerColor(NeuronConstants.POTASSIUM_COLOR, 0.2);
//  }
//
//  @Override
//  public Color getEdgeColor() {
//    return NeuronConstants.POTASSIUM_COLOR;
//  }
//
//  @Override
//  public void reset() {
//    super.reset();
//
//    // Set up the capture time range, which will be used to control the
//    // rate of particle capture when this gate is open.
//    setMinInterCaptureTime(MIN_INTER_CAPTURE_TIME);
//    setMaxInterCaptureTime(MAX_INTER_CAPTURE_TIME);
//  }
//
//  @Override
//  public void stepInTime(double dt) {
//    super.stepInTime(dt);
//    // Update the openness factor based on the state of the HH model.
//    // This is very specific to the model and the type of channel.  Note
//    // the non-linear mapping of conductance to the openness factor for
//    // the channels.  This is to make the gates appear to snap open and
//    // closed more rapidly, which was requested by the IPHY folks after
//    // seeing some demos.
//    double normalizedConductance =
//           Math.min(Math.abs(hodgkinHuxleyModel.get_delayed_n4(staggerDelay))/N4_WHEN_FULLY_OPEN, 1);
//    double openness = 1 - Math.pow(normalizedConductance - 1, 2);
//    if (openness > 0 && openness < 1){
//      // Trim off some digits, otherwise we are continuously making
//      // tiny changes to this value due to internal gyrations of the
//      // HH model.
//      openness = MathUtils.round(openness, 2);
//    }
//    if (openness != getOpenness()){
//      setOpenness(openness);
//      if (isOpen() && getCaptureCountdownTimer() == Double.POSITIVE_INFINITY){
//        // We have just transitioned to the open state, so it is time
//        // to start capturing ions.
//        restartCaptureCountdownTimer(true);
//      }
//    }
//  }
//
//  @Override
//  protected ParticleType getParticleTypeToCapture() {
//    return ParticleType.POTASSIUM_ION;
//  }
//
//  @Override
//  protected MembraneCrossingDirection chooseCrossingDirection() {
//    return MembraneCrossingDirection.IN_TO_OUT;
//  }
//}
