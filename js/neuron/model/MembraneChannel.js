// Copyright 2002-2011, University of Colorado
/**
 * Abstract base class for membrane channels, which represent any channel
 * through which atoms can go through to cross a membrane.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var NullCaptureZone = require( 'NEURON/neuron/model/NullCaptureZone' );
  var MembraneChannelState = require( 'NEURON/neuron/model/MembraneChannelState' );
  var TraverseChannelAndFadeMotionStrategy = require( 'NEURON/neuron/model/TraverseChannelAndFadeMotionStrategy' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Color = require( 'SCENERY/util/Color' );

  var SIDE_HEIGHT_TO_CHANNEL_HEIGHT_RATIO = 1.3;
  var DEFAULT_PARTICLE_VELOCITY = 40000; // In nanometers per sec of sim time.
  var RAND = {
    nextDouble: function() {
      return Math.random();
    }
  };

  /**
   * @param  channelWidth
   * @param  channelHeight
   * @param {ParticleCapture} modelContainingParticles
   * @constructor
   */
  function MembraneChannel( channelWidth, channelHeight, modelContainingParticles ) {
    var thisChannel = this;

    PropertySet.call( thisChannel, {
      channelStateChanged: false,
      representationChanged: false // All the channel states are  updated at once at the end stepInTime.This was done for performance reasons.
    } );

    //position of the channel
    this.centerLocation = new Vector2();
    // Variable that defines how open the channel is.Valid range is 0 to 1, 0 means fully closed, 1 is fully open.
    this.openness = 0;
    // Variable that defines how inactivated the channel is, which is distinct from openness.
    // Valid range is 0 to 1, 0 means completely active, 1 is completely inactive.
    this.inactivationAmt = 0;

    // Reference to the model that contains that particles that will be moving
    // through this channel.
    thisChannel.modelContainingParticles = modelContainingParticles;
    thisChannel.rotationalAngle = 0; // In radians.
    // Size of channel only, i.e. where the atoms pass through.
    thisChannel.channelSize = new Dimension2( channelWidth, channelHeight );
    thisChannel.overallSize = new Dimension2( channelWidth * 2.1, channelHeight * SIDE_HEIGHT_TO_CHANNEL_HEIGHT_RATIO );

    // Capture zones, which is where particles can be captured by this
    // channel.  There are two, one for inside the cell and one for outside.
    // There is generally no enforcement of which is which, so it is the
    // developer's responsibility to position the channel appropriately on the
    // cell membrane.

    // Set the "capture zone", which is a shape that represents the space
    // from which particles may be captured.  If null is returned, this
    // channel has no capture zone.
    this.interiorCaptureZone = new NullCaptureZone();

    this.exteriorCaptureZone = new NullCaptureZone();

    // Time values that control how often this channel requests an ion to move
    // through it.  These are initialized here to values that will cause the
    // channel to never request any ions and must be set by the base classes
    // in order to make capture events occur.
    this.captureCountdownTimer = Number.POSITIVE_INFINITY;
    this.minInterCaptureTime = Number.POSITIVE_INFINITY;
    this.maxInterCaptureTime = Number.POSITIVE_INFINITY;

    // Velocity for particles that move through this channel.
    this.particleVelocity = DEFAULT_PARTICLE_VELOCITY;
    this.updateChannelRect();

  }

  return inherit( PropertySet, MembraneChannel, {

    /**
     * Implements the time-dependent behavior of the gate.
     * @param dt - Amount of time step, in milliseconds.
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
    // Returns a boolean value that says whether or not the channel should be considered open.
    isOpen: function() {
      // The threshold values used here are empirically determined, and can
      // be changed if necessary.
      return (this.openness > 0.2 && this.inactivationAmt < 0.7);
    },
    getParticleTypeToCapture: function() {
      throw new Error( 'getParticleTypeToCapture should be implemented in descendant classes.' );
    },
    // Determine whether the provided point is inside the channel.
    isPointInChannel: function( x, y ) {
      // Note: A rotational angle of zero is considered to be lying on the
      // side.  Hence the somewhat odd-looking use of height and width in
      // the determination of the channel Rect.
      return this.rotatedChannelRect.containsCoordinates( x, y );
    },

    getChannelSize: function() {
      return  this.channelSize;
    },
    /**
     * Get the overall 2D size of the channel, which includes both the part
     * that the particles travel through as well as the edges.
     *
     * @return
     */
    getOverallSize: function() {
      return this.overallSize;
    },
    getInactivationAmt: function() {
      return this.inactivationAmt;
    },
    getCenterLocation: function() {
      return this.centerLocation;
    },
    /**
     * Choose the direction of crossing for the next particle to cross the
     * membrane.  If particles only cross in one direction, this will always
     * return the same thing.  If they can vary, this can return a different
     * value.
     */
    chooseCrossingDirection: function() {
      throw new Error( 'chooseCrossingDirection should be implemented in descendant classes.' );
    },
    /**
     * Start or restart the countdown timer which is used to time the event
     * where a particle is captured for movement across the membrane.  A
     * boolean parameter controls whether a particle capture should occur
     * immediately in addition to setting this timer.
     *
     * @param captureNow - Indicates whether a capture should be initiated
     * now in addition to resetting the timer.  This is often set to true
     * kicking of a cycle of particle captures.
     */
    restartCaptureCountdownTimer: function( captureNow ) {
      if ( this.minInterCaptureTime !== Number.POSITIVE_INFINITY && this.maxInterCaptureTime !== Number.POSITIVE_INFINITY ) {
        assert && assert( this.maxInterCaptureTime >= this.minInterCaptureTime );
        this.captureCountdownTimer = this.minInterCaptureTime + RAND.nextDouble() * (this.maxInterCaptureTime - this.minInterCaptureTime);
      }
      else {
        this.captureCountdownTimer = Number.POSITIVE_INFINITY;
      }
      if ( captureNow ) {
        this.modelContainingParticles.requestParticleThroughChannel( this.getParticleTypeToCapture(), this, this.particleVelocity,
          this.chooseCrossingDirection() );
      }
    },
    getChannelColor: function() {
      return Color.MAGENTA;
    },
    getEdgeColor: function() {
      return Color.RED;
    },
    //@protected
    setParticleVelocity: function( particleVelocity ) {
      this.particleVelocity = particleVelocity;
    },

    getParticleVelocity: function() {
      return this.particleVelocity;
    },
    //@protected
    setInteriorCaptureZone: function( captureZone ) {
      this.interiorCaptureZone = captureZone;
    },
    getInteriorCaptureZone: function() {
      return this.interiorCaptureZone;
    },
    //@protected
    setExteriorCaptureZone: function( captureZone ) {
      this.exteriorCaptureZone = captureZone;
    },
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
    getMaxInterCaptureTime: function() {
      return this.maxInterCaptureTime;
    },

    /**
     * Gets a values that indicates whether this channel has an inactivation
     * gate.  Most of the channels in this sim do not have these, so the
     * default is to return false.  This should be overridden in subclasses
     * that add inactivation gates to the channels.
     *
     * @return
     */
    getHasInactivationGate: function() {
      return false;
    },
    //convenience method
    setInactivationAmt: function( inactivationAmt ) {
      this.inactivationAmt = inactivationAmt;//will fire prop change
    },
    //convenience method
    getOpenness: function() {
      return this.openness;
    },
    setOpenness: function( openness ) {
      this.openness = openness;
    },
    setRotationalAngle: function( rotationalAngle ) {
      this.rotationalAngle = rotationalAngle;
      this.interiorCaptureZone.setRotationalAngle( rotationalAngle );
      this.exteriorCaptureZone.setRotationalAngle( rotationalAngle );
    },
    getRotationalAngle: function() {
      return this.rotationalAngle;
    },

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
     */
    moveParticleThroughNeuronMembrane: function( particle, maxVelocity ) {
      particle.setMotionStrategy( new TraverseChannelAndFadeMotionStrategy( this, particle.getPositionX(), particle.getPositionY(), maxVelocity ) );
    },
    /**
     * Get the state of this membrane channel as needed for support of record-
     * and-playback functionality.  Note that this is not the complete state
     * of a membrane channel, just enough to support playback.
     */
    getState: function() {
      return new MembraneChannelState( this );
    },

    /*
     The Membrane Channel Node observed centerLocation,openness and inactivation
     properties separately.This resulted in too many updates to node and degraded the performance.This method checks
     notifies a change in state if one of these properties change.
     */
    notifyIfMembraneStateChanged: function( prevOpenness, prevInActivationAmt ) {
      this.channelStateChanged = false;
      if ( prevOpenness !== this.openness || prevInActivationAmt !== this.inactivationAmt ) {
        this.channelStateChanged = true;
      }
    },

    /**
     * Set the state of a membrane channel.  This is generally used in support
     * of the record-and-playback functionality.
     */
    setState: function( state ) {

      var prevOpenness = this.getOpenness();
      var prevInactivationAmt = this.getInactivationAmt();
      this.setOpenness( state.getOpenness() );
      this.setInactivationAmt( state.getInactivationAmt() );
      this.notifyIfMembraneStateChanged( prevOpenness, prevInactivationAmt );
    },

    //TODO not used at the moment, experimental
    /**
     * check to see if membrane has undergone any state change,
     * if yes trigger a change in representation
     */
    notifyIfRepresentationIsChanged: function() {
      this.representationChanged = false;

      if ( this.channelStateChanged ) {
        this.representationChanged = true;
      }
    },

    getChannelType: function() {
      throw new Error( 'getChannelType should be implemented in descendant classes.' );
    }

  } );
} );


//public abstract class MembraneChannel {
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------

//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//


//
//  // Array of listeners.
//  private ArrayList<Listener> listeners = new ArrayList<Listener>();
//


//
//  //----------------------------------------------------------------------------
//  // Constructor
//  //----------------------------------------------------------------------------
//
//  public MembraneChannel(double channelWidth, double channelHeight, IParticleCapture modelContainingParticles){


//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------
//

//
//  abstract protected ParticleType getParticleTypeToCapture();
//


//

//
//  /**
//   * This method is for debugging, and it provides a shape that represents
//   * the size and location of the channel, i.e. the part where the particle
//   * goes through.  This can be helpful when needing to debug issues with
//   * particles moving through channels.
//   */
//  public Shape getChannelTestShape(){
//    Shape channelShape = new Rectangle2D.Double(
//        centerLocation.getX() - channelSize.getHeight() / 2,
//        centerLocation.getY() - channelSize.getWidth() / 2,
//      channelSize.getHeight(),
//      channelSize.getWidth());
//    AffineTransform transform = AffineTransform.getRotateInstance(rotationalAngle, centerLocation.getX(), centerLocation.getY());
//    Shape rotatedChannelShape = transform.createTransformedShape(channelShape);
//    return rotatedChannelShape;
//  }
//


//

//
//  /**
//   * This is called to remove this channel from the model.  It simply sends
//   * out a notification of removal, and all listeners (including the view)
//   * are expected to act appropriately and to remove all references.
//   */
//  public void removeFromModel(){
//    notifyRemoved();
//  }
//

//
//  public static interface Listener{
//    void removed();
//    void opennessChanged();
//    void inactivationAmtChanged();
//    void positionChanged();
//  }
//
//  public static class Adapter implements Listener {
//    public void removed() {}
//    public void opennessChanged() {}
//    public void inactivationAmtChanged() {}
//    public void positionChanged() {}
//  }
//

//


//}
