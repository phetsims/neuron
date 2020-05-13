// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model representation of a membrane channel through which potassium 'leaks', meaning that it is always passing
 * through and there is no gating action.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import Color from '../../../../scenery/js/util/Color.js';
import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import AbstractLeakChannel from './AbstractLeakChannel.js';
import MembraneChannelTypes from './MembraneChannelTypes.js';
import MembraneCrossingDirection from './MembraneCrossingDirection.js';
import ParticleType from './ParticleType.js';
import PieSliceShapedCaptureZone from './PieSliceShapedCaptureZone.js';

// constants
const CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
const CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.
const BASE_COLOR = Color.interpolateRGBA( NeuronConstants.POTASSIUM_COLOR, new Color( 0, 200, 255 ), 0.6 );
const DEFAULT_PARTICLE_VELOCITY = 5000; // In nanometers per sec of sim time.

// constants that define the rate and variability of particle capture.
const MIN_INTER_PARTICLE_CAPTURE_TIME = 0.002; // In seconds of sim time.
const MAX_INTER_PARTICLE_CAPTURE_TIME = 0.004; // In seconds of sim time.

/**
 * @param {NeuronModel} modelContainingParticles
 * @param {ModifiedHodgkinHuxleyModel} hodgkinHuxleyModel
 * @constructor
 */
function PotassiumLeakageChannel( modelContainingParticles, hodgkinHuxleyModel ) {
  AbstractLeakChannel.call( this, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );

  // Set the speed at which particles will move through the channel.
  this.setParticleVelocity( DEFAULT_PARTICLE_VELOCITY );

  // Set up the capture zones for this channel.
  this.setInteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterPosition(), CHANNEL_WIDTH * 5, Math.PI, Math.PI * 0.5 ) );
  this.setExteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterPosition(), CHANNEL_WIDTH * 5, 0, Math.PI * 0.5 ) );

  // Set the rate of particle capture for leakage.
  this.setMinInterCaptureTime( MIN_INTER_PARTICLE_CAPTURE_TIME );
  this.setMaxInterCaptureTime( MAX_INTER_PARTICLE_CAPTURE_TIME );

  this.channelColor = BASE_COLOR.colorUtilsDarker( 0.2 );

  // Start the capture timer now, since leak channels are always capturing particles.
  this.restartCaptureCountdownTimer( false );
}

neuron.register( 'PotassiumLeakageChannel', PotassiumLeakageChannel );

inherit( AbstractLeakChannel, PotassiumLeakageChannel, {

  // @public
  stepInTime: function( dt ) {
    const prevOpenness = this.openness;
    const prevInActivationAmt = this.inactivationAmount;
    AbstractLeakChannel.prototype.stepInTime.call( this, dt );
    this.notifyIfMembraneStateChanged( prevOpenness, prevInActivationAmt );
  },

  // @public
  getChannelColor: function() {
    return this.channelColor;
  },

  // @public
  getEdgeColor: function() {
    return BASE_COLOR;
  },

  // @public
  getParticleTypeToCapture: function() {
    return ParticleType.POTASSIUM_ION;
  },

  // @public
  getChannelType: function() {
    return MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL;
  },

  // @public, @override
  chooseCrossingDirection: function() {
    // Generally, this channel leaks from in to out, since the concentration of potassium is greater on the inside of
    // the cell. However, the IPHY people requested that there should occasionally be some leakage in the other
    // direction for greater realism, hence the random choice below.
    let direction = MembraneCrossingDirection.IN_TO_OUT;
    if ( phet.joist.random.nextDouble() < 0.2 ) {
      direction = MembraneCrossingDirection.OUT_TO_IN;
    }
    return direction;
  }

} );

export default PotassiumLeakageChannel;
