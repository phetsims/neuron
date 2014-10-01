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
  var Color = require( 'SCENERY/util/Color' );
  var MathUtils = require( 'NEURON/neuron/utils/MathUtils' );
  var AbstractLeakChannel = require( 'NEURON/neuron/model/AbstractLeakChannel' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var PieSliceShapedCaptureZone = require( 'NEURON/neuron/model/PieSliceShapedCaptureZone' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );


  var CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
  var CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.
  var BASE_COLOR = Color.interpolateRBGA( NeuronConstants.SODIUM_COLOR, Color.YELLOW, 0.5 );

  var DEFAULT_PARTICLE_VELOCITY = 7000; // In nanometers per sec of sim time.

  // Controls the rate of leakage when no action potential is occurring.
  // Higher values mean more leakage, with 1 as the max.
  var NOMINAL_LEAK_LEVEL = 0.005;

  // A scaling factor that is used to normalize the amount of leak channel
  // current to a value between 0 and 1.  This value was determined by
  // testing the Hodgkin-Huxley model.
  var PEAK_NEGATIVE_CURRENT = 3.44;

  var RAND = {nextDouble: function() {
    return Math.random();
  }};


  /**
   * @param  channelWidth
   * @param {ParticleCapture} modelContainingParticles
   * @param {IHodgkinHuxleyModel}hodgkinHuxleyModel
   * @constructor
   */
  function SodiumLeakageChannel( modelContainingParticles, hodgkinHuxleyModel ) {
    var thisChannel = this;
    AbstractLeakChannel.call( thisChannel, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );
    thisChannel.previousNormalizedLeakCurrent = 0;
    thisChannel.hodgkinHuxleyModel = hodgkinHuxleyModel;

    // Set the speed at which particles will move through the channel.
    thisChannel.setParticleVelocity( DEFAULT_PARTICLE_VELOCITY );

    // Set up the capture zones for this channel.
    thisChannel.setExteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterLocation(), CHANNEL_WIDTH * 5, 0, Math.PI * 0.6 ) );
    thisChannel.setInteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterLocation(), CHANNEL_WIDTH * 5, Math.PI, Math.PI * 0.8 ) );

    // Update the capture times.
    thisChannel.updateParticleCaptureRate( NOMINAL_LEAK_LEVEL );

    // Start the capture timer now, since leak channels are always
    // capturing particles.
    thisChannel.restartCaptureCountdownTimer( false );
  }

  return inherit( AbstractLeakChannel, SodiumLeakageChannel, {
    stepInTime: function( dt ) {
      var prevCenterLocation = this.centerLocation.copy();
      var prevOpenness = this.openness;
      var prevInActivationAmt = this.inactivationAmt;

      AbstractLeakChannel.prototype.stepInTime.call( this, dt );
      // Since this is a leak channel, it is always open, so the openness
      // is not updated as it is for the gated channels.  However, we DO
      // want more sodium to flow through when the leak current in the
      // HH model goes up, so the following code accomplishes that goal.

      var normalizedLeakCurrent = MathUtils.round( this.hodgkinHuxleyModel.get_l_current() / PEAK_NEGATIVE_CURRENT, 2 );
      if ( normalizedLeakCurrent <= 0.01 ) {
        // Only pay attention to negative values for the current, which
        // we will map to sodium flow back into the cell.  This is a
        // bit of hollywooding.
        normalizedLeakCurrent = Math.max( normalizedLeakCurrent, -1 );
        if ( normalizedLeakCurrent !== this.previousNormalizedLeakCurrent ) {
          this.previousNormalizedLeakCurrent = normalizedLeakCurrent;
          this.updateParticleCaptureRate( Math.max( Math.abs( normalizedLeakCurrent ), NOMINAL_LEAK_LEVEL ) );
        }
      }

      this.notifyIfMembraneStateChanged( prevCenterLocation, prevOpenness, prevInActivationAmt );
    },
    getChannelColor: function() {
      return BASE_COLOR.colorUtilsDarker( 0.15 );
    },
    getEdgeColor: function() {
      return BASE_COLOR;
    },
    getParticleTypeToCapture: function() {
      return ParticleType.SODIUM_ION;
    },
    //@Override
    chooseCrossingDirection: function() {
      var result = MembraneCrossingDirection.OUT_TO_IN;
      if ( this.previousNormalizedLeakCurrent === 0 ) {
        // The cell is idle, not recovering from an action potential, so
        // everyone once in a while a sodium atom should leak the opposite
        // direction.  This was requested by the IPHY people in the review
        // held mid-April 2010.
        if ( RAND.nextDouble() < 0.2 ) {
          result = MembraneCrossingDirection.IN_TO_OUT;
        }
      }
      return result;
    },
    /**
     * Update the rate of particle capture based on the supplied normalized
     * value.
     *
     * @param normalizedRate - A value between 0 and 1 where 0 represents the
     * minimum capture rate for particles and 1 represents the max.
     */
    updateParticleCaptureRate: function( normalizedRate ) {
      if ( normalizedRate <= 0.001 ) {
        // No captures at this rate.
        this.setMinInterCaptureTime( Number.POSITIVE_INFINITY );
        this.setMaxInterCaptureTime( Number.POSITIVE_INFINITY );
        this.restartCaptureCountdownTimer( false );
      }
      else {
        // Tweak the following values for different behavior.
        var absoluteMinInterCaptureTime = 0.0002;
        var variableMinInterCaptureTime = 0.002;
        var captureTimeRange = 0.005;
        var minInterCaptureTime = absoluteMinInterCaptureTime + (1 - normalizedRate) * (variableMinInterCaptureTime);
        this.setMinInterCaptureTime( minInterCaptureTime );
        this.setMaxInterCaptureTime( minInterCaptureTime + (1 - normalizedRate) * captureTimeRange );

        if ( this.getCaptureCountdownTimer() > this.getMaxInterCaptureTime() ) {
          // Only restart the capture countdown if the current values is
          // higher than the max.
          this.restartCaptureCountdownTimer( false );
        }
      }
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
//import edu.colorado.phet.neuron.utils.MathUtils;
//
//public class SodiumLeakageChannel extends AbstractLeakChannel {
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------
//

//

//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//

//
//  //----------------------------------------------------------------------------
//  // Constructor
//  //----------------------------------------------------------------------------

//
//  public SodiumLeakageChannel(){
//    this(null, null);
//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------

//


//

//}
