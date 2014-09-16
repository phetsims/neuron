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

  var SIDE_HEIGHT_TO_CHANNEL_HEIGHT_RATIO = 1.3;
  var DEFAULT_PARTICLE_VELOCITY = 40000; // In nanometers per sec of sim time.

  /**
   * @param  channelWidth
   * @param  channelHeight
   * @param {ParticleCapture} modelContainingParticles
   * @constructor
   */
  function MembraneChannel( channelWidth, channelHeight, modelContainingParticles ) {
    var thisChannel = this;

    PropertySet.call( thisChannel, {
      //position of the channel
      centerLocation: new Vector2(),
      // Variable that defines how open the channel is.Valid range is 0 to 1, 0 means fully closed, 1 is fully open.
      openness: 0,
      // Variable that defines how inactivated the channel is, which is distinct from openness.
      // Valid range is 0 to 1, 0 means completely active, 1 is completely inactive.
      inactivationAmt: 0
    } );

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

  }

  return inherit( PropertySet, MembraneChannel, {
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
    }
  } );

} );
//
//package edu.colorado.phet.neuron.model;
//
//import java.awt.Color;
//import java.awt.Shape;
//import java.awt.geom.AffineTransform;
//import java.awt.geom.Dimension2D;
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//import java.util.ArrayList;
//import java.util.Random;
//
//import edu.umd.cs.piccolo.util.PDimension;
//
//

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
//  /**
//   * Static factory method for creating a membrane channel of the specified
//   * type.
//   */
//  public static MembraneChannel createMembraneChannel(MembraneChannelTypes channelType, IParticleCapture particleModel,
//    IHodgkinHuxleyModel hodgkinHuxleyModel){
//
//    MembraneChannel membraneChannel = null;
//
//    switch (channelType){
//      case SODIUM_LEAKAGE_CHANNEL:
//        membraneChannel = new SodiumLeakageChannel(particleModel, hodgkinHuxleyModel);
//        break;
//
//      case SODIUM_GATED_CHANNEL:
//        membraneChannel = new SodiumDualGatedChannel(particleModel, hodgkinHuxleyModel);
//        break;
//
//      case POTASSIUM_LEAKAGE_CHANNEL:
//        membraneChannel = new PotassiumLeakageChannel(particleModel, hodgkinHuxleyModel);
//        break;
//
//      case POTASSIUM_GATED_CHANNEL:
//        membraneChannel = new PotassiumGatedChannel(particleModel, hodgkinHuxleyModel);
//        break;
//    }
//
//    assert membraneChannel != null; // Should be able to create all types of channels.
//    return membraneChannel;
//  }
//
//  abstract protected ParticleType getParticleTypeToCapture();
//

//
//  /**
//   * Determine whether the provided point is inside the channel.
//   *
//   * @param pt
//   * @return
//   */
//  public boolean isPointInChannel(Point2D pt){
//    // Note: A rotational angle of zero is considered to be lying on the
//    // side.  Hence the somewhat odd-looking use of height and width in
//    // the determination of the channel shape.
//    Shape channelShape = new Rectangle2D.Double(
//        centerLocation.getX() - channelSize.getHeight() / 2,
//        centerLocation.getY() - channelSize.getWidth() / 2,
//      channelSize.getHeight(),
//      channelSize.getWidth());
//    AffineTransform transform = AffineTransform.getRotateInstance(rotationalAngle, centerLocation.getX(), centerLocation.getY());
//    Shape rotatedChannelShape = transform.createTransformedShape(channelShape);
//    return rotatedChannelShape.contains(pt);
//  }
//
//  /**
//   * Gets a values that indicates whether this channel has an inactivation
//   * gate.  Most of the channels in this sim do not have these, so the
//   * default is to return false.  This should be overridden in subclasses
//   * that add inactivation gates to the channels.
//   *
//   * @return
//   */
//  public boolean getHasInactivationGate(){
//    return false;
//  }
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
//  /**
//   * Implements the time-dependent behavior of the gate.
//   *
//   * @param dt - Amount of time step, in milliseconds.
//   */
//  public void stepInTime(double dt){
//    if (captureCountdownTimer != Double.POSITIVE_INFINITY){
//
//      if (isOpen()){
//        captureCountdownTimer -= dt;
//        if (captureCountdownTimer <= 0){
//          modelContainingParticles.requestParticleThroughChannel(getParticleTypeToCapture(), this, particleVelocity, chooseCrossingDirection());
//          restartCaptureCountdownTimer(false);
//        }
//      }
//      else{
//        // If the channel is closed, the countdown timer shouldn't be
//        // running, so this code is generally hit when the membrane
//        // just became closed.  Turn off the countdown timer by
//        // setting it to infinity.
//        captureCountdownTimer = Double.POSITIVE_INFINITY;
//      }
//    }
//  }
//
//  /**
//   * Set the motion strategy for a particle that will cause the particle to
//   * traverse the channel.  This version is the one that implements the
//   * behavior for crossing through the neuron membrane.
//   *
//   * @param particle
//   * @param maxVelocity
//   */
//  public void moveParticleThroughNeuronMembrane(Particle particle, double maxVelocity){
//    particle.setMotionStrategy(new TraverseChannelAndFadeMotionStrategy(this, particle.getPositionReference(), maxVelocity));
//  }
//
//  protected double getParticleVelocity() {
//    return particleVelocity;
//  }
//
//  protected void setParticleVelocity(double particleVelocity) {
//    this.particleVelocity = particleVelocity;
//  }
//
//  /**
//   * Start or restart the countdown timer which is used to time the event
//   * where a particle is captured for movement across the membrane.  A
//   * boolean parameter controls whether a particle capture should occur
//   * immediately in addition to setting this timer.
//   *
//   * @param captureNow - Indicates whether a capture should be initiated
//   * now in addition to resetting the timer.  This is often set to true
//   * kicking of a cycle of particle captures.
//   */
//  protected void restartCaptureCountdownTimer(boolean captureNow){
//    if (minInterCaptureTime != Double.POSITIVE_INFINITY && maxInterCaptureTime != Double.POSITIVE_INFINITY){
//      assert maxInterCaptureTime >= minInterCaptureTime;
//      captureCountdownTimer = minInterCaptureTime + RAND.nextDouble() * (maxInterCaptureTime - minInterCaptureTime);
//    }
//    else{
//      captureCountdownTimer = Double.POSITIVE_INFINITY;
//    }
//
//    if (captureNow){
//      modelContainingParticles.requestParticleThroughChannel(getParticleTypeToCapture(), this, particleVelocity,
//        chooseCrossingDirection());
//    }
//  }
//
//  /**
//   * Set the "capture zone", which is a shape that represents the space
//   * from which particles may be captured.  If null is returned, this
//   * channel has no capture zone.
//   */
//  public CaptureZone getInteriorCaptureZone(){
//    return interiorCaptureZone;
//  }
//
//  protected void setInteriorCaptureZone(CaptureZone captureZone){
//    this.interiorCaptureZone = captureZone;
//  }
//
//  public CaptureZone getExteriorCaptureZone(){
//    return exteriorCaptureZone;
//  }
//
//  protected void setExteriorCaptureZone(CaptureZone captureZone){
//    this.exteriorCaptureZone = captureZone;
//  }
//
//  public Dimension2D getChannelSize(){
//    return new PDimension(channelSize);
//  }
//
//  public Point2D getCenterLocation(){
//    return new Point2D.Double(centerLocation.getX(), centerLocation.getY());
//  }
//
//  public void setCenterLocation(Point2D newCenterLocation) {
//    if (!newCenterLocation.equals(centerLocation)){
//      centerLocation.setLocation(newCenterLocation);
//      interiorCaptureZone.setOriginPoint(newCenterLocation);
//      exteriorCaptureZone.setOriginPoint(newCenterLocation);
//      notifyPositionChanged();
//    }
//  }
//
//  public void setRotationalAngle(double rotationalAngle){
//    this.rotationalAngle = rotationalAngle;
//    interiorCaptureZone.setRotationalAngle(rotationalAngle);
//    exteriorCaptureZone.setRotationalAngle(rotationalAngle);
//  }
//
//  public double getRotationalAngle(){
//    return rotationalAngle;
//  }
//
//  /**
//   * Get the overall 2D size of the channel, which includes both the part
//   * that the particles travel through as well as the edges.
//   *
//   * @return
//   */
//  public Dimension2D getOverallSize(){
//    return overallSize;
//  }
//
//  public double getOpenness() {
//    return openness;
//  }
//
//  protected void setOpenness(double openness) {
//    if (this.openness != openness){
//      this.openness = openness;
//      notifyOpennessChanged();
//    }
//  }
//
//  public double getInactivationAmt(){
//    return inactivationAmt;
//  }
//
//  protected void setInactivationAmt(double inactivationAmt) {
//    if (this.inactivationAmt != inactivationAmt){
//      this.inactivationAmt = inactivationAmt;
//      notifyInactivationAmtChanged();
//    }
//  }
//
//  public Color getChannelColor(){
//    return Color.MAGENTA;
//  }
//
//  public Color getEdgeColor(){
//    return Color.RED;
//  }
//
//  public void addListener(Listener listener){
//    listeners.add(listener);
//  }
//
//  public void removeListener(Listener listener){
//    listeners.remove(listener);
//  }
//
//  /**
//   * Choose the direction of crossing for the next particle to cross the
//   * membrane.  If particles only cross in one direction, this will always
//   * return the same thing.  If they can vary, this can return a different
//   * value.
//   */
//  protected abstract MembraneCrossingDirection chooseCrossingDirection();
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
//  private void notifyRemoved(){
//    for (Listener listener : listeners){
//      listener.removed();
//    }
//  }
//
//  private void notifyOpennessChanged(){
//    for (Listener listener : listeners){
//      listener.opennessChanged();
//    }
//  }
//
//  private void notifyInactivationAmtChanged(){
//    for (Listener listener : listeners){
//      listener.inactivationAmtChanged();
//    }
//  }
//
//  private void notifyPositionChanged(){
//    for (Listener listener : listeners){
//      listener.positionChanged();
//    }
//  }
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
//  protected double getMaxInterCaptureTime() {
//    return maxInterCaptureTime;
//  }
//
//  protected void setMaxInterCaptureTime(double maxInterCaptureTime) {
//    this.maxInterCaptureTime = maxInterCaptureTime;
//  }
//
//  protected void setMinInterCaptureTime(double minInterCaptureTime) {
//    this.minInterCaptureTime = minInterCaptureTime;
//  }
//
//  protected double getCaptureCountdownTimer() {
//    return captureCountdownTimer;
//  }
//
//  /**
//   * Get the state of this membrane channel as needed for support of record-
//   * and-playback functionality.  Note that this is not the complete state
//   * of a membrane channel, just enough to support playback.
//   */
//  public MembraneChannelState getState(){
//    return new MembraneChannelState( this );
//  }
//
//  /**
//   * Set the state of a membrane channel.  This is generally used in support
//   * of the record-and-playback functionality.
//   */
//  public void setState(MembraneChannelState state){
//    setOpenness( state.getOpenness() );
//    setInactivationAmt( state.getInactivationAmt() );
//  }
//
//  /**
//   * Class that stores the state of a membrane channel and can be used to
//   * restore it when needed.  This is generally used in support of the
//   * record-and-playback functionality.
//   */
//  public static class MembraneChannelState {
//
//    private final double openness;
//    private final double inactivationAmt;
//    // Note: There are a number of other state variables that exist for a
//    // membrane channel, but at the time of this writing (late June 2010),
//    // they never change after construction.  It may be necessary to add
//    // some or all of them later if this changes, or if membrane channels
//    // need to come and go dynamically.
//
//    public MembraneChannelState(MembraneChannel membraneChannel){
//      openness = membraneChannel.getOpenness();
//      inactivationAmt = membraneChannel.getInactivationAmt();
//    }
//
//    public double getOpenness() {
//      return openness;
//    }
//
//    public double getInactivationAmt() {
//      return inactivationAmt;
//    }
//  }
//}
