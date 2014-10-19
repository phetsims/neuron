// Copyright 2002-2011, University of Colorado

/**
 * Abstract base class for a simulated particle.  It is intended that this be subclassed
 * for each specific particle type used in the simulation.
 * This class  serves as a Fadable  element  that can fade in or out of
 * existence in based on different  fade strategies.
 * Also functions as a "Movable" element that can be move differently based on different motion strategies.
 *
 * @author John Blanco
 * @Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var ViewableParticle = require( 'NEURON/neuron/model/ViewableParticle' );
  var Property = require( 'AXON/Property' );
  var StillnessMotionStrategy = require( 'NEURON/neuron/model/StillnessMotionStrategy' );
  var NullFadeStrategy = require( 'NEURON/neuron/model/NullFadeStrategy' );
  var MembraneTraversalMotionStrategy = require( 'NEURON/neuron/model/MembraneTraversalMotionStrategy' );
  var ParticlePlaybackMemento = require( 'NEURON/neuron/model/ParticlePlaybackMemento' );


  var DEFAULT_PARTICLE_RADIUS = 0.75;  // In nanometers.

  /**
   * Construct a particle.
   *
   * @param xPos - Initial X position of this particle.
   * @param yPos - Initial Y position of this particle.
   */
  function Particle( xPos, yPos ) {
    xPos = xPos || 0;
    yPos = yPos || 0;

    ViewableParticle.call( this, {} );

    // particles while removing themselves will set this property to false
    this.continueExistingProperty = new Property( true );

    // Location in space of this particle, units are nano-meters.
    this.position = new Vector2( xPos, yPos );
    // Opaqueness value, ranges from 0 (completely transparent) to 1
    // (completely opaque).
    this.opaqueness = 1;

    // Motion strategy for moving this particle around.StillnessMotionStrategy is stateless so use the singleton instance
    this.motionStrategy = StillnessMotionStrategy.getInstance();

    // Fade strategy for fading in and out.
    this.fadeStrategy = NullFadeStrategy.getInstance();

  }

  return inherit( ViewableParticle, Particle, {

    stepInTime: function( dt ) {
      this.motionStrategy.move( this, this, dt );
      this.fadeStrategy.updateOpaqueness( this, dt );
      if ( !this.fadeStrategy.shouldContinueExisting( this ) ) {
        // This particle has faded out of existence, so send out a
        // notification that indicates that it is being removed from the
        // model.  The thinking here is that everyone with a reference to
        // this particle should listen for this notification and do any
        // cleanup and removal of references needed.  If they don't, there
        // will be memory leaks.
        this.continueExistingProperty.value = false;
      }
    },
    getPosition: function() {
      // return new Vector2( this.position.x, this.position.y ); // TODO why new Position everytime? The State object copies the position, so no need to return a clone
      return this.position;
    },

    isPositionEqual: function( otherX, otherY ) {
      return this.position.x === otherX && this.position.y === otherY;
    },

    getPositionX: function() {
      return this.position.x;
    },
    getPositionY: function() {
      return this.position.y;
    },

    /**
     * Get a reference to the current position of the model element.  Be
     * careful with this.  It is provided primarily for optimization purposes,
     * and the value should not be changed.
     *
     */
    getPositionReference: function() {
      return this.position;
    },
    /**
     * Get the radius of the object being moved.  This is generally used when
     * the object needs to "bounce" (i.e. change direction because some limit
     * has been reached).  Note that this assumes a circular object or one that
     * is fairly close to circular.  If this assumption of approximate
     * roundness proves to be too much of a limitation at some point in the
     * future, this may need to be generalized to be a bounding rectangle or
     * some such thing.
     */
    getRadius: function() {
      return DEFAULT_PARTICLE_RADIUS;   // Default value, override if needed to support other particles.
    },
    /**
     * Set the fade strategy for the element.
     */
    setFadeStrategy: function( fadeStrategy ) {
      this.fadeStrategy = fadeStrategy;
    },
    setMotionStrategy: function( motionStrategy ) {
      this.motionStrategy = motionStrategy;
    },
    setPosition: function( x, y ) {

      if ( !y ) {
        this.position.set( x );// x is vector
        return;
      }
      this.position.setXY( x, y );

    },

    isAvailableForCapture: function() {
      // If the particle is not in the process of trying to traverse a
      // membrane channel, then it should be considered to be available for
      // capture.
      return !(this.motionStrategy instanceof MembraneTraversalMotionStrategy);
    },

    /**
     * Get a playback memento, which can be used when doing playback of
     * previous model states.  Note that the memento does not capture all of
     * the particle's state, just enough to support playback.
     */
    getPlaybackMemento: function() {
      return new ParticlePlaybackMemento( this );
    },

    setOpaqueness: function( opaqueness ) {
      this.opaqueness = opaqueness;
    },

    getOpaqueness: function() {
      return this.opaqueness;
    }
  } );
} );


//public abstract class Particle implements IMovable, IFadable, IViewableParticle {
//
//  //------------------------------------------------------------------------
//  // Class data
//  //------------------------------------------------------------------------
//

//
//  //------------------------------------------------------------------------
//  // Instance data
//  //------------------------------------------------------------------------
//
//  protected ArrayList<IParticleListener> listeners = new ArrayList<IParticleListener>();
//

//
//  // Motion strategy for moving this particle around.
//  private MotionStrategy motionStrategy = new StillnessMotionStrategy();
//


//
//  // Fade strategy for fading in and out.
//  private FadeStrategy fadeStrategy = new NullFadeStrategy();
//
//  //------------------------------------------------------------------------
//  // Constructors
//  //------------------------------------------------------------------------
//
//  /**
//   * Construct a particle.
//   *
//   * @param xPos - Initial X position of this particle.
//   * @param yPos - Initial Y position of this particle.
//   */
//  public Particle(double xPos, double yPos) {
//    position = new Point2D.Double(xPos, yPos);
//  }
//
//  public Particle(){
//    this(0,0);
//  }
//
//  //------------------------------------------------------------------------
//  // Methods
//  //------------------------------------------------------------------------
//

//


//
//  /* (non-Javadoc)
//   * @see edu.colorado.phet.neuron.model.IViewableParticle#getOpaqueness()
//   */

//
//  /**
//   * Set the fade strategy for the element.
//   */
//  public void setFadeStrategy(FadeStrategy fadeStrategy){
//    this.fadeStrategy = fadeStrategy;
//  }
//
//  protected boolean isAvailableForCapture() {
//    // If the particle is not in the process of trying to traverse a
//    // membrane channel, then it should be considered to be available for
//    // capture.
//    return !(motionStrategy instanceof MembraneTraversalMotionStrategy);
//  }
//
//  /**
//   * Get a playback memento, which can be used when doing playback of
//   * previous model states.  Note that the memento does not capture all of
//   * the particle's state, just enough to support playback.
//   */
//  public ParticlePlaybackMemento getPlaybackMemento(){
//    return new ParticlePlaybackMemento( this );
//  }
//
//  protected void notifyPositionChanged(){
//    // Notify all listeners of the position change.
//    for (IParticleListener listener : listeners)
//    {
//      listener.positionChanged();
//    }
//  }
//
//  protected void notifyAppearanceChanged(){
//    // Notify all listeners of the opaqueness change.
//    for (IParticleListener listener : listeners)
//    {
//      listener.appearanceChanged();
//    }
//  }
//
//  /* (non-Javadoc)
//   * @see edu.colorado.phet.neuron.model.IViewableParticle#removeFromModel()
//   */
//  public void removeFromModel(){
//    notifyRemoved();
//  }
//
//  /**
//   * Inform all listeners that this element has been removed from the model.
//   */
//  private void notifyRemoved(){
//    // Copy the list to avoid concurrent modification exceptions.
//    ArrayList<IParticleListener> listenersCopy = new ArrayList<IParticleListener>(listeners);
//    // Notify all listeners that this particle was removed from the model.
//    for (IParticleListener listener : listenersCopy)
//    {
//      listener.removedFromModel();
//    }
//  }
//

//

//
//  /* (non-Javadoc)
//   * @see edu.colorado.phet.neuron.model.IViewableParticle#getRepresentationColor()
//   */
//  abstract public Color getRepresentationColor();
//
//  //------------------------------------------------------------------------
//  // Behavior methods
//  //------------------------------------------------------------------------
//
//  /**
//   * Execute any time-based behavior.
//   *
//   * @param dt - delta time in milliseconds.
//   */
//  public void stepInTime(double dt){
//    motionStrategy.move(this, this, dt);
//    fadeStrategy.updateOpaqueness(this, dt);
//    if (!fadeStrategy.shouldContinueExisting(this)){
//      // This particle has faded out of existence, so send out a
//      // notification that indicates that it is being removed from the
//      // model.  The thinking here is that everyone with a reference to
//      // this particle should listen for this notification and do any
//      // cleanup and removal of references needed.  If they don't, there
//      // will be memory leaks.
//      notifyRemoved();
//    }
//  }
//

