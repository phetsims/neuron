// Copyright 2014-2021, University of Colorado Boulder
/**
 * Abstract base class for membrane channels, which represent any channel through which atoms can go through to cross a
 * membrane.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { Color } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';
import NullCaptureZone from './NullCaptureZone.js';
import TraverseChannelAndFadeMotionStrategy from './TraverseChannelAndFadeMotionStrategy.js';

// constants
const SIDE_HEIGHT_TO_CHANNEL_HEIGHT_RATIO = 1.3;
const DEFAULT_PARTICLE_VELOCITY = 40000; // In nanometers per sec of sim time.

class MembraneChannel {

  /**
   * @param {number} channelWidth
   * @param {number} channelHeight
   * @param {NeuronModel} modelContainingParticles
   */
  constructor( channelWidth, channelHeight, modelContainingParticles ) {

    // If the channel's Openness and ActivationAmt is different from its previous values, flag the channel's state as
    // changed. The canvas implementation of the membrane channel node will repaint if any one of the channel's state
    // is found to be have been changed.
    this.channelStateChangedProperty = new Property( false );// @public

    // All the channel states are updated at once at the end stepInTime. This was done for performance reasons.
    this.representationChangedProperty = new Property( false );// @public

    // position of the channel
    this.centerPosition = new Vector2( 0, 0 ); // @public

    // Variable that defines how open the channel is. Valid range is 0 to 1, 0 means fully closed, 1 is fully open.
    this.openness = 0; // @public

    // Variable that defines how inactivated the channel is, which is distinct from openness. Valid range is 0 to 1, 0
    // means completely active, 1 is completely inactive.
    this.inactivationAmount = 0; // @public

    // Reference to the model that contains that particles that will be moving through this channel.
    this.modelContainingParticles = modelContainingParticles; // @protected
    this.rotationalAngle = 0; // @public, in radians

    // Size of channel interior, i.e. where the atoms pass through.
    this.channelSize = new Dimension2( channelWidth, channelHeight ); // @public
    this.overallSize = new Dimension2( channelWidth * 2.1, channelHeight * SIDE_HEIGHT_TO_CHANNEL_HEIGHT_RATIO ); // @public

    // Capture zones, which is where particles can be captured by this channel.  There are two, one for inside the cell
    // and one for outside. There is generally no enforcement of which is which, so it is the developer's responsibility
    // to position the channel appropriately on the cell membrane.

    // Set the initial capture zone, which is a shape that represents the space from which particles may be captured.
    // If null is returned, this channel has no capture zone.
    this.interiorCaptureZone = new NullCaptureZone(); // @private
    this.exteriorCaptureZone = new NullCaptureZone(); // @private

    // Time values that control how often this channel requests an ion to move through it.  These are initialized here
    // to values that will cause the channel to never request any ions and must be set by the descendant classes in
    // order to make capture events occur.
    this.captureCountdownTimer = Number.POSITIVE_INFINITY; // @private
    this.minInterCaptureTime = Number.POSITIVE_INFINITY; // @protected
    this.maxInterCaptureTime = Number.POSITIVE_INFINITY; // @private

    // Velocity for particles that move through this channel.
    this.particleVelocity = DEFAULT_PARTICLE_VELOCITY; // @private

    // Perform the initial update the shape of the channel rectangle.
    this.updateChannelRect();
  }

  /**
   * Implements the time-dependent behavior of the channel.
   * @param {number} dt - Amount of time step, in milliseconds.
   * @public
   */
  stepInTime( dt ) {
    if ( this.captureCountdownTimer !== Number.POSITIVE_INFINITY ) {
      if ( this.isOpen() ) {
        this.captureCountdownTimer -= dt;
        if ( this.captureCountdownTimer <= 0 ) {
          this.modelContainingParticles.requestParticleThroughChannel( this.getParticleTypeToCapture(), this, this.particleVelocity, this.chooseCrossingDirection() );
          this.restartCaptureCountdownTimer( false );
        }
      }
      else {
        // If the channel is closed, the countdown timer shouldn't be
        // running, so this code is generally hit when the membrane
        // just became closed.  Turn off the countdown timer by
        // setting it to infinity.
        this.captureCountdownTimer = Number.POSITIVE_INFINITY;
      }
    }

  }

  /**
   * The rotated channel rect was getting calculated for every particle.This method does it only
   * once (This is done for performance reasons - Ashraf)
   * @private
   */
  updateChannelRect() {
    const channelRect = new Rectangle( this.centerPosition.x - this.channelSize.height / 2,
      this.centerPosition.y - this.channelSize.width / 2, this.channelSize.height, this.channelSize.width );
    const rotationTransform = Matrix3.rotationAround( this.rotationalAngle, this.centerPosition.x, this.centerPosition.y );
    this.rotatedChannelRect = channelRect.transformed( rotationTransform );
  }

  // @public - reset the channel
  reset() {
    this.captureCountdownTimer = Number.POSITIVE_INFINITY;
  }

  /**
   * Returns a boolean value that says whether or not the channel should be considered open.
   * @private
   */
  isOpen() {
    // The threshold values used here are empirically determined, and can be changed if necessary.
    return ( this.openness > 0.2 && this.inactivationAmount < 0.7 );
  }

  // @protected
  getParticleTypeToCapture() {
    throw new Error( 'getParticleTypeToCapture should be implemented in descendant classes.' );
  }

  /**
   * Determine whether the provided point is inside the channel.
   * @public
   */
  isPointInChannel( x, y ) {
    return this.rotatedChannelRect.containsCoordinates( x, y );
  }

  // @public
  getChannelSize() {
    return this.channelSize;
  }

  /**
   * Get the overall 2D size of the channel, which includes both the part that the particles travel through as well as
   * the edges.
   * @public
   */
  getOverallSize() {
    return this.overallSize;
  }

  // @public
  getInactivationAmount() {
    return this.inactivationAmount;
  }

  // @public
  getCenterPosition() {
    return this.centerPosition;
  }

  /**
   * Choose the direction of crossing for the next particle to cross the membrane.  If particles only cross in one
   * direction, this will always return the same thing.  If they can vary, this can return a different value.
   * @public
   */
  chooseCrossingDirection() {
    throw new Error( 'chooseCrossingDirection should be implemented in descendant classes.' );
  }

  /**
   * Start or restart the countdown timer which is used to time the event where a particle is captured for movement
   * across the membrane.  A boolean parameter controls whether a particle capture should occur immediately in
   * addition to setting this timer.
   * @param {boolean} captureNow - Indicates whether a capture should be initiated now in addition to resetting the
   * timer.  This is often set to true kicking of a cycle of particle captures.
   * @public
   */
  restartCaptureCountdownTimer( captureNow ) {
    if ( this.minInterCaptureTime !== Number.POSITIVE_INFINITY && this.maxInterCaptureTime !== Number.POSITIVE_INFINITY ) {
      assert && assert( this.maxInterCaptureTime >= this.minInterCaptureTime );
      this.captureCountdownTimer = this.minInterCaptureTime + dotRandom.nextDouble() * ( this.maxInterCaptureTime - this.minInterCaptureTime );
    }
    else {
      this.captureCountdownTimer = Number.POSITIVE_INFINITY;
    }
    if ( captureNow ) {
      this.modelContainingParticles.requestParticleThroughChannel( this.getParticleTypeToCapture(), this, this.particleVelocity,
        this.chooseCrossingDirection() );
    }
  }

  // @public
  getChannelColor() {
    return Color.MAGENTA;
  }

  // @public
  getEdgeColor() {
    return PhetColorScheme.RED_COLORBLIND;
  }

  //@protected
  setParticleVelocity( particleVelocity ) {
    this.particleVelocity = particleVelocity;
  }

  // @protected
  getParticleVelocity() {
    return this.particleVelocity;
  }

  // @protected
  setInteriorCaptureZone( captureZone ) {
    this.interiorCaptureZone = captureZone;
  }

  // @public
  getInteriorCaptureZone() {
    return this.interiorCaptureZone;
  }

  //@protected
  setExteriorCaptureZone( captureZone ) {
    this.exteriorCaptureZone = captureZone;
  }

  // @public
  getExteriorCaptureZone() {
    return this.exteriorCaptureZone;
  }

  //@protected
  setMinInterCaptureTime( minInterCaptureTime ) {
    this.minInterCaptureTime = minInterCaptureTime;
  }

  //@protected
  setMaxInterCaptureTime( maxInterCaptureTime ) {
    this.maxInterCaptureTime = maxInterCaptureTime;
  }

  //@protected
  getCaptureCountdownTimer() {
    return this.captureCountdownTimer;
  }

  // @public
  getMaxInterCaptureTime() {
    return this.maxInterCaptureTime;
  }

  /**
   * Gets a values that indicates whether this channel has an inactivation
   * gate.  Most of the channels in this sim do not have these, so the
   * default is to return false.  This should be overridden in subclasses
   * that add inactivation gates to the channels.
   * @public
   */
  getHasInactivationGate() {
    return false;
  }

  // @protected, convenience method
  setInactivationAmount( inactivationAmount ) {
    this.inactivationAmount = inactivationAmount;
  }

  // @protected, convenience method
  getOpenness() {
    return this.openness;
  }

  // @protected, convenience method
  setOpenness( openness ) {
    this.openness = openness;
  }

  // @protected, convenience method
  setCaptureCountdownTimer( captureCountdownTimer ) {
    this.captureCountdownTimer = captureCountdownTimer;
  }

  // @public
  setRotationalAngle( rotationalAngle ) {
    this.rotationalAngle = rotationalAngle;
    this.interiorCaptureZone.setRotationalAngle( rotationalAngle );
    this.exteriorCaptureZone.setRotationalAngle( rotationalAngle );
  }

  // @public
  getRotationalAngle() {
    return this.rotationalAngle;
  }

  // @public
  setCenterPosition( newCenterPosition ) {
    if ( !newCenterPosition.equals( this.centerPosition ) ) {
      this.centerPosition = newCenterPosition;
      this.interiorCaptureZone.setOriginPoint( newCenterPosition );
      this.exteriorCaptureZone.setOriginPoint( newCenterPosition );
    }
  }

  /**
   * Set the motion strategy for a particle that will cause the particle to traverse the channel.  This version is the
   * one that implements the behavior for crossing through the neuron membrane.
   * @param {Particle} particle
   * @param {number} maxVelocity
   * @public
   */
  moveParticleThroughNeuronMembrane( particle, maxVelocity ) {
    particle.setMotionStrategy( new TraverseChannelAndFadeMotionStrategy( this, particle.getPositionX(), particle.getPositionY(), maxVelocity ) );
  }

  /**
   * Get the state of this membrane channel as needed for support of record- and-playback functionality.  Note that
   * this is may not be the complete state of a membrane channel, just enough to support playback.  This is
   * overridden in descendant classes if more information is needed.
   * @public
   */
  getState() {
    return {
      type: this.getChannelType(), // for checking during state restoration
      openness: this.openness,
      inactivationAmount: this.inactivationAmount,
      captureCountdownTimer: this.captureCountdownTimer
    };
  }

  /**
   * Set the state of a membrane channel.  This is generally used in support of the record-and-playback functionality.
   * @public
   */
  setState( state ) {
    assert && assert( state.type === this.getChannelType(), 'attempt to restore state from incorrect channel type' );
    const prevOpenness = this.getOpenness();
    const prevInactivationAmount = this.getInactivationAmount();
    this.setOpenness( state.openness );
    this.setInactivationAmount( state.inactivationAmount );
    this.setCaptureCountdownTimer( state.captureCountdownTimer );
    this.notifyIfMembraneStateChanged( prevOpenness, prevInactivationAmount );
  }

  /**
   * This method triggers a notification that the state of the membrane channel has changed.  This was done as an
   * optimization, since testing showed that having the view observe the various properties individually was a bit
   * too costly and caused performance issues.
   * @param {number} prevOpenness
   * @param {number} prevInActivationAmt
   * @public
   */
  notifyIfMembraneStateChanged( prevOpenness, prevInActivationAmt ) {
    this.channelStateChangedProperty.set( prevOpenness !== this.openness || prevInActivationAmt !== this.inactivationAmount );
  }

  // @public
  getChannelType() {
    throw new Error( 'getChannelType should be implemented in descendant classes.' );
  }
}

neuron.register( 'MembraneChannel', MembraneChannel );

export default MembraneChannel;
