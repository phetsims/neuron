// Copyright 2014-2015, University of Colorado Boulder
/**
 * Abstract base class for membrane channels, which represent any channel through which atoms can go through to cross a
 * membrane.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var NullCaptureZone = require( 'NEURON/neuron/model/NullCaptureZone' );
  var MembraneChannelState = require( 'NEURON/neuron/model/MembraneChannelState' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var TraverseChannelAndFadeMotionStrategy = require( 'NEURON/neuron/model/TraverseChannelAndFadeMotionStrategy' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Color = require( 'SCENERY/util/Color' );

  // constants
  var SIDE_HEIGHT_TO_CHANNEL_HEIGHT_RATIO = 1.3;
  var DEFAULT_PARTICLE_VELOCITY = 40000; // In nanometers per sec of sim time.

  /**
   * @param  {number} channelWidth
   * @param  {number} channelHeight
   * @param {NeuronModel} modelContainingParticles
   * @constructor
   */
  function MembraneChannel( channelWidth, channelHeight, modelContainingParticles ) {
    var thisChannel = this;
    PropertySet.call( thisChannel, {

      // If the channel's Openness and ActivationAmt is different from its previous values, flag the channel's state as
      // changed. The canvas implementation of the membrane channel node will repaint if any one of the channel's state
      // is found to be have been changed.
      channelStateChanged: false, // @public

      // All the channel states are updated at once at the end stepInTime. This was done for performance reasons.
      representationChanged: false // @public
    } );

    // position of the channel
    this.centerLocation = new Vector2(); // @public

    // Variable that defines how open the channel is. Valid range is 0 to 1, 0 means fully closed, 1 is fully open.
    this.openness = 0; // @public

    // Variable that defines how inactivated the channel is, which is distinct from openness. Valid range is 0 to 1, 0
    // means completely active, 1 is completely inactive.
    this.inactivationAmt = 0; // @public

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

  return inherit( PropertySet, MembraneChannel, {

    /**
     * Implements the time-dependent behavior of the channel.
     * @param dt - Amount of time step, in milliseconds.
     * @public
     */
    stepInTime: function( dt ) {
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

    },

    /**
     * The rotated channel rect was getting calculated for every particle.This method does it only
     * once (This is done for performance reasons - Ashraf)
     * @private
     */
    updateChannelRect: function() {
      var channelRect = new Rectangle( this.centerLocation.x - this.channelSize.height / 2,
        this.centerLocation.y - this.channelSize.width / 2, this.channelSize.height, this.channelSize.width );
      var rotationTransform = Matrix3.rotationAround( this.rotationalAngle, this.centerLocation.x, this.centerLocation.y );
      this.rotatedChannelRect = channelRect.transformed( rotationTransform );
    },

    // Reset the channel.
    reset: function() {
      this.captureCountdownTimer = Number.POSITIVE_INFINITY;
    },

    /**
     * Returns a boolean value that says whether or not the channel should be considered open.
     * @private
     */
    isOpen: function() {
      // The threshold values used here are empirically determined, and can be changed if necessary.
      return (this.openness > 0.2 && this.inactivationAmt < 0.7);
    },

    // @protected
    getParticleTypeToCapture: function() {
      throw new Error( 'getParticleTypeToCapture should be implemented in descendant classes.' );
    },

    /**
     * Determine whether the provided point is inside the channel.
     * @public
     */
    isPointInChannel: function( x, y ) {
      return this.rotatedChannelRect.containsCoordinates( x, y );
    },

    // @public
    getChannelSize: function() {
      return this.channelSize;
    },

    /**
     * Get the overall 2D size of the channel, which includes both the part that the particles travel through as well as
     * the edges.
     * @public
     */
    getOverallSize: function() {
      return this.overallSize;
    },

    // @public
    getInactivationAmt: function() {
      return this.inactivationAmt;
    },

    // @public
    getCenterLocation: function() {
      return this.centerLocation;
    },

    /**
     * Choose the direction of crossing for the next particle to cross the membrane.  If particles only cross in one
     * direction, this will always return the same thing.  If they can vary, this can return a different value.
     * @public
     */
    chooseCrossingDirection: function() {
      throw new Error( 'chooseCrossingDirection should be implemented in descendant classes.' );
    },

    /**
     * Start or restart the countdown timer which is used to time the event where a particle is captured for movement
     * across the membrane.  A boolean parameter controls whether a particle capture should occur immediately in
     * addition to setting this timer.
     *
     * @param captureNow - Indicates whether a capture should be initiated now in addition to resetting the timer.  This
     * is often set to true kicking of a cycle of particle captures.
     * @public
     */
    restartCaptureCountdownTimer: function( captureNow ) {
      if ( this.minInterCaptureTime !== Number.POSITIVE_INFINITY && this.maxInterCaptureTime !== Number.POSITIVE_INFINITY ) {
        assert && assert( this.maxInterCaptureTime >= this.minInterCaptureTime );
        this.captureCountdownTimer = this.minInterCaptureTime + Math.random() * (this.maxInterCaptureTime - this.minInterCaptureTime);
      }
      else {
        this.captureCountdownTimer = Number.POSITIVE_INFINITY;
      }
      if ( captureNow ) {
        this.modelContainingParticles.requestParticleThroughChannel( this.getParticleTypeToCapture(), this, this.particleVelocity,
          this.chooseCrossingDirection() );
      }
    },

    // @public
    getChannelColor: function() {
      return Color.MAGENTA;
    },

    // @public
    getEdgeColor: function() {
      return PhetColorScheme.RED_COLORBLIND;
    },

    //@protected
    setParticleVelocity: function( particleVelocity ) {
      this.particleVelocity = particleVelocity;
    },

    // @protected
    getParticleVelocity: function() {
      return this.particleVelocity;
    },

    // @protected
    setInteriorCaptureZone: function( captureZone ) {
      this.interiorCaptureZone = captureZone;
    },

    // @public
    getInteriorCaptureZone: function() {
      return this.interiorCaptureZone;
    },

    //@protected
    setExteriorCaptureZone: function( captureZone ) {
      this.exteriorCaptureZone = captureZone;
    },

    // @public
    getExteriorCaptureZone: function() {
      return this.exteriorCaptureZone;
    },

    //@protected
    setMinInterCaptureTime: function( minInterCaptureTime ) {
      this.minInterCaptureTime = minInterCaptureTime;
    },

    //@protected
    setMaxInterCaptureTime: function( maxInterCaptureTime ) {
      this.maxInterCaptureTime = maxInterCaptureTime;
    },

    //@protected
    getCaptureCountdownTimer: function() {
      return this.captureCountdownTimer;
    },

    // @public
    getMaxInterCaptureTime: function() {
      return this.maxInterCaptureTime;
    },

    /**
     * Gets a values that indicates whether this channel has an inactivation
     * gate.  Most of the channels in this sim do not have these, so the
     * default is to return false.  This should be overridden in subclasses
     * that add inactivation gates to the channels.
     * @public
     */
    getHasInactivationGate: function() {
      return false;
    },

    // @protected, convenience method
    setInactivationAmt: function( inactivationAmt ) {
      this.inactivationAmt = inactivationAmt;
    },

    // @protected, convenience method
    getOpenness: function() {
      return this.openness;
    },

    // @protected, convenience method
    setOpenness: function( openness ) {
      this.openness = openness;
    },

    // @public
    setRotationalAngle: function( rotationalAngle ) {
      this.rotationalAngle = rotationalAngle;
      this.interiorCaptureZone.setRotationalAngle( rotationalAngle );
      this.exteriorCaptureZone.setRotationalAngle( rotationalAngle );
    },

    // @public
    getRotationalAngle: function() {
      return this.rotationalAngle;
    },

    // @public
    setCenterLocation: function( newCenterLocation ) {
      if ( !newCenterLocation.equals( this.centerLocation ) ) {
        this.centerLocation = newCenterLocation;
        this.interiorCaptureZone.setOriginPoint( newCenterLocation );
        this.exteriorCaptureZone.setOriginPoint( newCenterLocation );
      }
    },

    /**
     * Set the motion strategy for a particle that will cause the particle to
     * traverse the channel.  This version is the one that implements the
     * behavior for crossing through the neuron membrane.
     *
     * @param particle
     * @param maxVelocity
     * @public
     */
    moveParticleThroughNeuronMembrane: function( particle, maxVelocity ) {
      particle.setMotionStrategy( new TraverseChannelAndFadeMotionStrategy( this, particle.getPositionX(), particle.getPositionY(), maxVelocity ) );
    },

    /**
     * Get the state of this membrane channel as needed for support of record-
     * and-playback functionality.  Note that this is not the complete state
     * of a membrane channel, just enough to support playback.
     * @public
     */
    getState: function() {
      return new MembraneChannelState( this );
    },

    /**
     * This method triggers a notification that the state of the membrane channel has changed.  This was done as an
     * optimization, since testing showed that having the view observe the various properties individually was a bit
     * too costly and caused performance issues.
     * @param prevOpenness
     * @param prevInActivationAmt
     */
    notifyIfMembraneStateChanged: function( prevOpenness, prevInActivationAmt ) {
      this.channelStateChanged = prevOpenness !== this.openness || prevInActivationAmt !== this.inactivationAmt;
    },

    /**
     * Set the state of a membrane channel.  This is generally used in support of the record-and-playback functionality.
     * @public
     */
    setState: function( state ) {
      var prevOpenness = this.getOpenness();
      var prevInactivationAmt = this.getInactivationAmt();
      this.setOpenness( state.getOpenness() );
      this.setInactivationAmt( state.getInactivationAmt() );
      this.notifyIfMembraneStateChanged( prevOpenness, prevInactivationAmt );
    },

    // @public
    getChannelType: function() {
      throw new Error( 'getChannelType should be implemented in descendant classes.' );
    }

  } );
} );

