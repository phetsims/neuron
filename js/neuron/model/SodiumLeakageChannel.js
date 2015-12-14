// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model representation of a membrane channel through which sodium 'leaks', meaning that it is always passing through
 * and there is no gating action.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var MathUtils = require( 'NEURON/neuron/common/MathUtils' );
  var AbstractLeakChannel = require( 'NEURON/neuron/model/AbstractLeakChannel' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var PieSliceShapedCaptureZone = require( 'NEURON/neuron/model/PieSliceShapedCaptureZone' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );

  // constants
  var CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
  var CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.
  var BASE_COLOR = Color.interpolateRGBA( NeuronConstants.SODIUM_COLOR, Color.YELLOW, 0.5 );
  var DEFAULT_PARTICLE_VELOCITY = 7000; // In nanometers per sec of sim time.

  // Controls the rate of leakage when no action potential is occurring.
  // Higher values mean more leakage, with 1 as the max.
  var NOMINAL_LEAK_LEVEL = 0.005;

  // A scaling factor that is used to normalize the amount of leak channel
  // current to a value between 0 and 1.  This value was determined by
  // testing the Hodgkin-Huxley model.
  var PEAK_NEGATIVE_CURRENT = 3.44;

  /**
   * @param {number} channelWidth
   * @param {NeuronModel} modelContainingParticles
   * @param {ModifiedHodgkinHuxleyModel} hodgkinHuxleyModel
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
    thisChannel.channelColor = BASE_COLOR.colorUtilsDarker( 0.15 );

    // Start the capture timer now, since leak channels are always
    // capturing particles.
    thisChannel.restartCaptureCountdownTimer( false );
  }

  return inherit( AbstractLeakChannel, SodiumLeakageChannel, {

    stepInTime: function( dt ) {
      var prevOpenness = this.openness;
      var prevInActivationAmt = this.inactivationAmount;

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

      this.notifyIfMembraneStateChanged( prevOpenness, prevInActivationAmt );
    },

    getChannelColor: function() {
      return this.channelColor;
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
        if ( Math.random() < 0.2 ) {
          result = MembraneCrossingDirection.IN_TO_OUT;
        }
      }
      return result;
    },

    getChannelType: function() {
      return MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL;
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
