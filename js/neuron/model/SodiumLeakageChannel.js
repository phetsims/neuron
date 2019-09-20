// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model representation of a membrane channel through which sodium 'leaks', meaning that it is always passing through
 * and there is no gating action.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( require => {
  'use strict';

  // modules
  const AbstractLeakChannel = require( 'NEURON/neuron/model/AbstractLeakChannel' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MathUtils = require( 'NEURON/neuron/common/MathUtils' );
  const MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );
  const MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  const neuron = require( 'NEURON/neuron' );
  const NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  const ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  const PieSliceShapedCaptureZone = require( 'NEURON/neuron/model/PieSliceShapedCaptureZone' );

  // constants
  const CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
  const CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.
  const BASE_COLOR = Color.interpolateRGBA( NeuronConstants.SODIUM_COLOR, Color.YELLOW, 0.5 );
  const DEFAULT_PARTICLE_VELOCITY = 7000; // In nanometers per sec of sim time.

  // Controls the rate of leakage when no action potential is occurring.
  // Higher values mean more leakage, with 1 as the max.
  const NOMINAL_LEAK_LEVEL = 0.005;

  // A scaling factor that is used to normalize the amount of leak channel
  // current to a value between 0 and 1.  This value was determined by
  // testing the Hodgkin-Huxley model.
  const PEAK_NEGATIVE_CURRENT = 3.44;

  /**
   * @param {number} channelWidth
   * @param {NeuronModel} modelContainingParticles
   * @param {ModifiedHodgkinHuxleyModel} hodgkinHuxleyModel
   * @constructor
   */
  function SodiumLeakageChannel( modelContainingParticles, hodgkinHuxleyModel ) {
    AbstractLeakChannel.call( this, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );
    this.previousNormalizedLeakCurrent = 0;
    this.hodgkinHuxleyModel = hodgkinHuxleyModel;

    // Set the speed at which particles will move through the channel.
    this.setParticleVelocity( DEFAULT_PARTICLE_VELOCITY );

    // Set up the capture zones for this channel.
    this.setExteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterLocation(), CHANNEL_WIDTH * 5, 0, Math.PI * 0.6 ) );
    this.setInteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterLocation(), CHANNEL_WIDTH * 5, Math.PI, Math.PI * 0.8 ) );

    // Update the capture times.
    this.updateParticleCaptureRate( NOMINAL_LEAK_LEVEL );
    this.channelColor = BASE_COLOR.colorUtilsDarker( 0.15 );

    // Start the capture timer now, since leak channels are always
    // capturing particles.
    this.restartCaptureCountdownTimer( false );
  }

  neuron.register( 'SodiumLeakageChannel', SodiumLeakageChannel );

  return inherit( AbstractLeakChannel, SodiumLeakageChannel, {

    // @public, @override
    stepInTime: function( dt ) {
      const prevOpenness = this.openness;
      const prevInActivationAmt = this.inactivationAmount;

      AbstractLeakChannel.prototype.stepInTime.call( this, dt );
      // Since this is a leak channel, it is always open, so the openness
      // is not updated as it is for the gated channels.  However, we DO
      // want more sodium to flow through when the leak current in the
      // HH model goes up, so the following code accomplishes that goal.

      let normalizedLeakCurrent = MathUtils.round( this.hodgkinHuxleyModel.get_l_current() / PEAK_NEGATIVE_CURRENT, 2 );
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

    // @public, @override
    getChannelColor: function() {
      return this.channelColor;
    },

    // @public, @override
    getEdgeColor: function() {
      return BASE_COLOR;
    },

    // @public, @override
    getParticleTypeToCapture: function() {
      return ParticleType.SODIUM_ION;
    },

    // @public, @override
    chooseCrossingDirection: function() {
      let result = MembraneCrossingDirection.OUT_TO_IN;
      if ( this.previousNormalizedLeakCurrent === 0 ) {
        // The cell is idle, not recovering from an action potential, so
        // everyone once in a while a sodium atom should leak the opposite
        // direction.  This was requested by the IPHY people in the review
        // held mid-April 2010.
        if ( phet.joist.random.nextDouble() < 0.2 ) {
          result = MembraneCrossingDirection.IN_TO_OUT;
        }
      }
      return result;
    },

    // @public, @override
    getChannelType: function() {
      return MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL;
    },

    /**
     * Update the rate of particle capture based on the supplied normalized value.
     * @param {number} normalizedRate - A value between 0 and 1 where 0 represents the minimum capture rate for
     * particles and 1 represents the max.
     * @private
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
        const absoluteMinInterCaptureTime = 0.0002;
        const variableMinInterCaptureTime = 0.002;
        const captureTimeRange = 0.005;
        const minInterCaptureTime = absoluteMinInterCaptureTime + (1 - normalizedRate) * (variableMinInterCaptureTime);
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
