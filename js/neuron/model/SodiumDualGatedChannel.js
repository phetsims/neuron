// Copyright 2014-2021, University of Colorado Boulder
/**
 * A gated channel through which sodium passes when the channel is open.  This implementation has two different gates,
 * which is apparently closer to real- life voltage-gated sodium channels.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import neuron from '../../neuron.js';
import MathUtils from '../common/MathUtils.js';
import NeuronConstants from '../common/NeuronConstants.js';
import DualGateChannelTraversalMotionStrategy from './DualGateChannelTraversalMotionStrategy.js';
import GatedChannel from './GatedChannel.js';
import MembraneChannelTypes from './MembraneChannelTypes.js';
import MembraneCrossingDirection from './MembraneCrossingDirection.js';
import ParticleType from './ParticleType.js';
import PieSliceShapedCaptureZone from './PieSliceShapedCaptureZone.js';

// constants
const CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
const CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.

// Constant used when calculating how open this gate should be based on a value that exists within the Hodgkin-Huxley
// model.  This was empirically determined.
const M3H_WHEN_FULLY_OPEN = 0.25;

// Possible values for internal state.
const GateState = {
  IDLE: 'IDLE',
  OPENING: 'OPENING',
  BECOMING_INACTIVE: 'BECOMING_INACTIVE',
  INACTIVATED: 'INACTIVATED',
  RESETTING: 'RESETTING'
};

// verify that enum is immutable without the runtime penalty in production code
if ( assert ) { Object.freeze( GateState ); }

// Values used for deciding on state transitions.  These were empirically determined.
const ACTIVATION_DECISION_THRESHOLD = 0.002;
const FULLY_INACTIVE_DECISION_THRESHOLD = 0.98;

// Values used for timed state transitions.
const INACTIVE_TO_RESETTING_TIME = 0.001; // In seconds of sim time.
const RESETTING_TO_IDLE_TIME = 0.001; // In seconds of sim time.

// Constants that control the rate at which this channel will capture ions when it is open.  Smaller numbers here will
// increase the capture rate and thus make the flow appear to be faster.
const MIN_INTER_CAPTURE_TIME = 0.00003; // In seconds of sim time.
const MAX_INTER_CAPTURE_TIME = 0.00013; // In seconds of sim time.

// Delay range - used to make the timing of the instances of this gate vary a little bit in terms of when they open
// and close.
const MAX_STAGGER_DELAY = NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT * 5; // In seconds of sim time.

class SodiumDualGatedChannel extends GatedChannel {

  /**
   * @param {NeuronModel} modelContainingParticles
   * @param {ModifiedHodgkinHuxleyModel} hodgkinHuxleyModel
   */
  constructor( modelContainingParticles, hodgkinHuxleyModel ) {
    super( CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );
    this.gateState = GateState.IDLE;
    this.hodgkinHuxleyModel = hodgkinHuxleyModel;
    this.stateTransitionTimer = 0;
    this.staggerDelay = 0;
    this.previousNormalizedConductance = 0;
    this.setExteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterPosition(), CHANNEL_WIDTH * 5, 0, Math.PI * 0.7 ) );
    this.reset();
    this.channelColor = NeuronConstants.SODIUM_COLOR.colorUtilsDarker( 0.2 );
  }

  // @public
  stepInTime( dt ) {

    // A note to maintainers: originally, several properties were maintained that were observed in the view, such as
    // openness and inactivation.  Handling these separately compromised performance, so a flag was added to mark
    // whether any change occurred, and if so, the view knows to update the representation.
    const prevOpenness = this.openness;
    const prevInActivationAmt = this.inactivationAmount;

    super.stepInTime( dt );

    // Get the conductance normalized from 0 to 1.
    let normalizedConductance = this.calculateNormalizedConductance();

    assert && assert( normalizedConductance >= 0 && normalizedConductance <= 1,
      `SodiumDualGatedChannel normalized conductance out of range, = ${normalizedConductance}` );

    // Trim off some digits to limit very small changes.
    normalizedConductance = MathUtils.round( normalizedConductance, 4 );

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
        // We are on the way down, so set a new state.
        if ( this.isOpen() && this.getCaptureCountdownTimer() === Number.POSITIVE_INFINITY ) {
          // We are open enough to start capturing particles.
          this.restartCaptureCountdownTimer( true );
        }
        if ( this.previousNormalizedConductance > normalizedConductance ) {
          this.gateState = GateState.BECOMING_INACTIVE;
          // Should be fully open at this point.
          this.setOpenness( 1 );
        }
        else {
          // Set the openness based on the normalized conductance value. Note the non-linear mapping.  This was done
          // to make them appear to be fully open earlier in the action potential, which was requested by the
          // Integrated Physiology folks.
          this.setOpenness( this.mapOpennessToNormalizedConductance( normalizedConductance ) );
        }
        break;

      case GateState.BECOMING_INACTIVE:
        if ( this.getInactivationAmount() < FULLY_INACTIVE_DECISION_THRESHOLD ) {
          // Not yet fully inactive - update the level.  Note the non-
          // linear mapping to the conductance amount.
          this.setInactivationAmount( 1 - Math.pow( normalizedConductance, 7 ) );
        }
        else {
          // Fully inactive, move to next state.
          this.setInactivationAmount( 1 );
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
          // Move the values of openness and activation back towards their idle (i.e. resting) states.  The mapping of
          // the inactivation amount as a function of time is very non- linear.  This is because the IPHY people
          // requested that the "little ball doesn't pop out" until the gate has closed up.
          this.setOpenness( 1 - Math.pow( this.stateTransitionTimer / RESETTING_TO_IDLE_TIME - 1, 10 ) );
          this.setInactivationAmount( 1 - Math.pow( this.stateTransitionTimer / RESETTING_TO_IDLE_TIME - 1, 20 ) );
        }
        else {
          // Go back to the idle, or resting, state.
          this.setOpenness( 0 );
          this.setInactivationAmount( 0 );
          this.updateStaggerDelay();
          this.gateState = GateState.IDLE;
        }
        break;

      default:
        throw new Error( `invalid gateState: ${this.gateState}` );
    }

    // Save values for the next time through.
    this.previousNormalizedConductance = normalizedConductance;

    this.notifyIfMembraneStateChanged( prevOpenness, prevInActivationAmt );
  }

  // @public, @override
  reset() {
    super.reset();

    // Set up the capture time range, which will be used to control the rate of particle capture when this gate is open.
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
  }

  // @public, @override
  getState() {
    const state = super.getState();
    state.inactivationAmount = this.inactivationAmount;
    state.previousNormalizedConductance = this.previousNormalizedConductance;
    state.gateState = this.gateState;
    state.stateTransitionTimer = this.stateTransitionTimer;
    return state;
  }

  // @public, @override
  setState( state ) {
    this.gateState = state.gateState;
    this.previousNormalizedConductance = state.previousNormalizedConductance;
    this.stateTransitionTimer = state.stateTransitionTimer;
    super.setState( state );
  }

  // @public, @override
  getChannelColor() {
    return this.channelColor;
  }

  // @public, @override
  getEdgeColor() {
    return NeuronConstants.SODIUM_COLOR;
  }

  // @public, @override
  getParticleTypeToCapture() {
    return ParticleType.SODIUM_ION;
  }

  // @private
  updateStaggerDelay() {
    this.staggerDelay = dotRandom.nextDouble() * MAX_STAGGER_DELAY;
  }

  // @public, @override
  chooseCrossingDirection() {
    return MembraneCrossingDirection.OUT_TO_IN;
  }

  // @public, @override
  getHasInactivationGate() {
    return true;
  }

  // @public, @override
  moveParticleThroughNeuronMembrane( particle, maxVelocity ) {
    particle.setMotionStrategy( new DualGateChannelTraversalMotionStrategy( this, particle.getPositionX(), particle.getPositionY() ) );
  }

  // @private
  mapOpennessToNormalizedConductance( normalizedConductance ) {
    assert && assert( normalizedConductance >= 0 && normalizedConductance <= 1 );
    return 1 - Math.pow( normalizedConductance - 1, 20 );
  }

  // @private
  calculateNormalizedConductance() {
    return Math.min( Math.abs( this.hodgkinHuxleyModel.get_delayed_m3h( this.staggerDelay ) ) / M3H_WHEN_FULLY_OPEN, 1 );
  }

  // @public, @override
  getChannelType() {
    return MembraneChannelTypes.SODIUM_GATED_CHANNEL;
  }
}

neuron.register( 'SodiumDualGatedChannel', SodiumDualGatedChannel );

export default SodiumDualGatedChannel;
