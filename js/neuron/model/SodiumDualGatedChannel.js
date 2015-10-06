// Copyright 2002-2011, University of Colorado
/**
 * A gated channel through which sodium passes when the channel is open.  This
 * implementation has two different gates, which is apparently closer to real-
 * life voltage-gated sodium channels.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var GatedChannel = require( 'NEURON/neuron/model/GatedChannel' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var PieSliceShapedCaptureZone = require( 'NEURON/neuron/model/PieSliceShapedCaptureZone' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var DualGateChannelTraversalMotionStrategy = require( 'NEURON/neuron/model/DualGateChannelTraversalMotionStrategy' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var MathUtils = require( 'NEURON/neuron/utils/MathUtils' );
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );

  var CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
  var CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.

  // Constant used when calculating how open this gate should be based on
  // a value that exists within the Hodgkin-Huxley model.  This was
  // empirically determined.
  var M3H_WHEN_FULLY_OPEN = 0.25;

  // Possible values for internal state.
  var GateState = {
    IDLE: 'IDLE',
    OPENING: 'OPENING',
    BECOMING_INACTIVE: 'BECOMING_INACTIVE',
    INACTIVATED: 'INACTIVATED',
    RESETTING: 'RESETTING'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( GateState ); }

  // Values used for deciding on state transitions.  These were empirically
  // determined.
  var ACTIVATION_DECISION_THRESHOLD = 0.002;
  var FULLY_INACTIVE_DECISION_THRESHOLD = 0.98;

  // Values used for timed state transitions.
  var INACTIVE_TO_RESETTING_TIME = 0.001; // In seconds of sim time.
  var RESETTING_TO_IDLE_TIME = 0.001; // In seconds of sim time.

// constants that control the rate at which this channel will capture ions
// when it is open.  Smaller numbers here will increase the capture rate
// and thus make the flow appear to be faster.
  var MIN_INTER_CAPTURE_TIME = 0.00002; // In seconds of sim time.
  var MAX_INTER_CAPTURE_TIME = 0.00010; // In seconds of sim time.

  // Delay range - used to make the timing of the instances of this gate
  // vary a little bit in terms of when they open and close.
  var MAX_STAGGER_DELAY = NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT * 5; // In seconds of sim time.

  /**
   * @param {number} channelWidth
   * @param {NeuronModel} modelContainingParticles
   * @param {ModifiedHodgkinHuxleyModel} hodgkinHuxleyModel
   * @constructor
   */
  function SodiumDualGatedChannel( modelContainingParticles, hodgkinHuxleyModel ) {
    var thisChannel = this;
    GatedChannel.call( thisChannel, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );
    thisChannel.gateState = GateState.IDLE;
    thisChannel.hodgkinHuxleyModel = hodgkinHuxleyModel;
    thisChannel.stateTransitionTimer = 0;
    thisChannel.staggerDelay = 0;
    this.previousNormalizedConductance = 0;
    thisChannel.setExteriorCaptureZone( new PieSliceShapedCaptureZone( thisChannel.getCenterLocation(), CHANNEL_WIDTH * 5, 0, Math.PI * 0.7 ) );
    thisChannel.reset();
    thisChannel.channelColor = NeuronConstants.SODIUM_COLOR.colorUtilsDarker( 0.2 );
  }

  return inherit( GatedChannel, SodiumDualGatedChannel, {

    stepInTime: function( dt ) {
      // The Membrane Channel Node observed centerLocation,openness and inactivation
      // properties separately.This resulted in too many updates to node and degraded the performance.This method checks
      // notifies a change in state if one of these properties change.
      var prevOpenness = this.openness;
      var prevInActivationAmt = this.inactivationAmt;

      GatedChannel.prototype.stepInTime.call( this, dt );
      // Get the conductance and normalize it from 0 to 1.
      var normalizedConductance = this.calculateNormalizedConductance();

      if ( normalizedConductance >= 0 && normalizedConductance <= 1 ) {
        // Trim off some digits to limit very small changes.
        normalizedConductance = MathUtils.round( normalizedConductance, 4 );
      }
      else {
        // This shouldn't happen, debug it if it does.
        console.log( 'Sodium Dual  Channel Normalized conductance out of range, = ' + normalizedConductance );
        assert && assert( false );
      }

      // Update the state.
      switch( this.gateState ) {
        case GateState.IDLE:
          if ( normalizedConductance > ACTIVATION_DECISION_THRESHOLD ) {
            // We are opening, change to the appropriate state.
            this.setOpenness( this.mapOpennessToNormalizedConductance( normalizedConductance ) );
            this.gateState = GateState.OPENING;
          }
          break;

        case GateState.OPENING:
          if ( this.isOpen() && this.getCaptureCountdownTimer() === Number.POSITIVE_INFINITY ) {
            // We are open enough to start capturing particles.
            this.restartCaptureCountdownTimer( true );
          }
          if ( this.previousNormalizedConductance > normalizedConductance ) {
            // We are on the way down, so set a new state.
            this.gateState = GateState.BECOMING_INACTIVE;
            // Should be fully open at this point.
            this.setOpenness( 1 );
          }
          else {
            // Set the openness based on the normalized conductance value.
            // Note the non-linear mapping.  This was done to make them
            // appear to be fully open earlier in the action potential,
            // which was requested by the IPHY folks.
            this.setOpenness( this.mapOpennessToNormalizedConductance( normalizedConductance ) );
          }
          break;

        case GateState.BECOMING_INACTIVE:
          if ( this.getInactivationAmt() < FULLY_INACTIVE_DECISION_THRESHOLD ) {
            // Not yet fully inactive - update the level.  Note the non-
            // linear mapping to the conductance amount.
            this.setInactivationAmt( 1 - Math.pow( normalizedConductance, 7 ) );
          }
          else {
            // Fully inactive, move to next state.
            this.setInactivationAmt( 1 );
            this.gateState = GateState.INACTIVATED;
            this.stateTransitionTimer = INACTIVE_TO_RESETTING_TIME;
          }
          break;

        case GateState.INACTIVATED:
          this.stateTransitionTimer -= dt;
          if ( this.stateTransitionTimer < 0 ) {
            // Time to start resetting.
            this.gateState = GateState.RESETTING;
            this.stateTransitionTimer = RESETTING_TO_IDLE_TIME;
          }
          break;

        case GateState.RESETTING:
          this.stateTransitionTimer -= dt;
          if ( this.stateTransitionTimer >= 0 ) {
            // Move the values of openness and activation back towards
            // their idle (i.e. resting) states.  The mapping of the
            // inactivation amount as a function of time is very non-
            // linear.  This is because the IPHY people requested that
            // the "little ball doesn't pop out" until the the gate has
            // closed up.
            this.setOpenness( 1 - Math.pow( this.stateTransitionTimer / RESETTING_TO_IDLE_TIME - 1, 10 ) );
            this.setInactivationAmt( 1 - Math.pow( this.stateTransitionTimer / RESETTING_TO_IDLE_TIME - 1, 20 ) );
          }
          else {
            // Go back to the idle, or resting, state.
            this.setOpenness( 0 );
            this.setInactivationAmt( 0 );
            this.updateStaggerDelay();
            this.gateState = GateState.IDLE;
          }
          break;
      }

      // Save values for the next time through.
      this.previousNormalizedConductance = normalizedConductance;

      this.notifyIfMembraneStateChanged( prevOpenness, prevInActivationAmt );
    },

    //@Override
    reset: function() {
      GatedChannel.prototype.reset.call( this );

      // Set up the capture time range, which will be used to control the
      // rate of particle capture when this gate is open.
      this.setMinInterCaptureTime( MIN_INTER_CAPTURE_TIME );
      this.setMaxInterCaptureTime( MAX_INTER_CAPTURE_TIME );

      // Initialize some internal state.
      this.gateState = GateState.IDLE;
      this.stateTransitionTimer = 0;
      if ( this.hodgkinHuxleyModel ) {
        this.previousNormalizedConductance = this.calculateNormalizedConductance();
      }

      // Initialize the stagger delay.
      this.updateStaggerDelay();
    },

    getChannelColor: function() {
      return this.channelColor;
    },

    getEdgeColor: function() {
      return NeuronConstants.SODIUM_COLOR;
    },

    getParticleTypeToCapture: function() {
      return ParticleType.SODIUM_ION;
    },

    updateStaggerDelay: function() {
      this.staggerDelay = Math.random() * MAX_STAGGER_DELAY;
    },

    //@Override
    chooseCrossingDirection: function() {
      return MembraneCrossingDirection.OUT_TO_IN;
    },

    //@Override This membrane channel has an inactivation gate.
    getHasInactivationGate: function() {
      return true;
    },

    //@Override
    moveParticleThroughNeuronMembrane: function( particle, maxVelocity ) {
      particle.setMotionStrategy( new DualGateChannelTraversalMotionStrategy( this, particle.getPositionX(), particle.getPositionY() ) );
    },

    mapOpennessToNormalizedConductance: function( normalizedConductance ) {
      assert && assert( normalizedConductance >= 0 && normalizedConductance <= 1 );
      return 1 - Math.pow( normalizedConductance - 1, 20 );
    },

    calculateNormalizedConductance: function() {
      return Math.min( Math.abs( this.hodgkinHuxleyModel.get_delayed_m3h( this.staggerDelay ) ) / M3H_WHEN_FULLY_OPEN, 1 );
    },

    getChannelType: function() {
      return MembraneChannelTypes.SODIUM_GATED_CHANNEL;
    }

  } );
} );
