// Copyright 2014-2021, University of Colorado Boulder

/**
 * A gated channel through which potassium passes when the channel is open.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import neuron from '../../neuron.js';
import MathUtils from '../common/MathUtils.js';
import NeuronConstants from '../common/NeuronConstants.js';
import GatedChannel from './GatedChannel.js';
import MembraneChannelTypes from './MembraneChannelTypes.js';
import MembraneCrossingDirection from './MembraneCrossingDirection.js';
import ParticleType from './ParticleType.js';
import PieSliceShapedCaptureZone from './PieSliceShapedCaptureZone.js';

// constants
const CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
const CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.

// constants that control the rate at which this channel will capture ions when it is open.  Smaller numbers here will
// increase the capture rate and thus make the flow appear to be faster.
const MIN_INTER_CAPTURE_TIME = 0.00006; // In seconds of sim time.
const MAX_INTER_CAPTURE_TIME = 0.00025; // In seconds of sim time.

// Constant used when calculating how open this gate should be based on a value that exists within the Hodgkin-Huxley
// model.  This was empirically determined.
const N4_WHEN_FULLY_OPEN = 0.35;

// Delay range - used to make the timing of the instances of this gate vary a little bit in terms of when they open
// and close.
const MAX_STAGGER_DELAY = NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT * 10; // In seconds of sim time.

class PotassiumGatedChannel extends GatedChannel {

  /**
   * @param {NeuronModel} modelContainingParticles
   * @param {ModifiedHodgkinHuxleyModel} hodgkinHuxleyModel
   */
  constructor( modelContainingParticles, hodgkinHuxleyModel ) {
    super( CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );
    this.staggerDelay = dotRandom.nextDouble() * MAX_STAGGER_DELAY;
    this.hodgkinHuxleyModel = hodgkinHuxleyModel;
    this.setInteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterPosition(), CHANNEL_WIDTH * 5, Math.PI, Math.PI * 0.5 ) );
    this.channelColor = NeuronConstants.POTASSIUM_COLOR.colorUtilsDarker( 0.2 );
    this.reset();
  }

  // @public
  stepInTime( dt ) {
    const prevOpenness = this.openness;
    const prevInActivationAmt = this.inactivationAmount;
    super.stepInTime( dt );

    // Update the openness factor based on the state of the HH model. This is very specific to the model and the type
    // of channel.  Note the non-linear mapping of conductance to the openness factor for the channels.  This is to
    // make the gates appear to snap open and closed more rapidly, which was requested by the IPHY folks after seeing
    // some demos.
    const normalizedConductance =
      Math.min( Math.abs( this.hodgkinHuxleyModel.get_delayed_n4( this.staggerDelay ) ) / N4_WHEN_FULLY_OPEN, 1 );
    let openness = 1 - Math.pow( normalizedConductance - 1, 2 );
    if ( openness > 0 && openness < 1 ) {
      // Trim off some digits, otherwise we are continuously making tiny changes to this value due to internal
      // gyrations of the HH model.
      openness = MathUtils.round( openness, 2 );
    }
    if ( openness !== this.getOpenness() ) {
      this.setOpenness( openness );
      if ( this.isOpen() && this.getCaptureCountdownTimer() === Number.POSITIVE_INFINITY ) {
        // We have just transitioned to the open state, so it is time to start capturing ions.
        this.restartCaptureCountdownTimer( true );
      }
    }

    this.notifyIfMembraneStateChanged( prevOpenness, prevInActivationAmt );
  }

  // @public, @override
  reset() {
    super.reset();
    // Set up the capture time range, which will be used to control the rate of particle capture when this gate is
    // open.
    this.setMinInterCaptureTime( MIN_INTER_CAPTURE_TIME );
    this.setMaxInterCaptureTime( MAX_INTER_CAPTURE_TIME );
  }

  // @public
  getChannelColor() {
    return this.channelColor;
  }

  // @public
  getEdgeColor() {
    return NeuronConstants.POTASSIUM_COLOR;
  }

  // @public
  getParticleTypeToCapture() {
    return ParticleType.POTASSIUM_ION;
  }

  // @public
  chooseCrossingDirection() {
    return MembraneCrossingDirection.IN_TO_OUT;
  }

  // @public
  getChannelType() {
    return MembraneChannelTypes.POTASSIUM_GATED_CHANNEL;
  }
}

neuron.register( 'PotassiumGatedChannel', PotassiumGatedChannel );

export default PotassiumGatedChannel;
