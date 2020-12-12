// Copyright 2014-2020, University of Colorado Boulder

/**
 * Abstract base class for a simulated particle.  It is intended that this be subclassed for each specific particle
 * type used in the simulation.
 *
 * This class serves as a Fadable element that can fade in or out of existence in based on different fade strategies.
 * Also functions as a "Movable" element that can be move differently based on different motion strategies.
 *
 * @author John Blanco
 * @Sharfudeen Ashraf (for Ghent University)
 */

import Property from '../../../../axon/js/Property.js';
import neuron from '../../neuron.js';
import MotionStrategy from './MotionStrategy.js';
import NullFadeStrategy from './NullFadeStrategy.js';
import ParticlePlaybackMemento from './ParticlePlaybackMemento.js';
import StillnessMotionStrategy from './StillnessMotionStrategy.js';
import ViewableParticle from './ViewableParticle.js';

// constants
const DEFAULT_PARTICLE_RADIUS = 0.75;  // In nanometers.

class Particle extends ViewableParticle {

  /**
   * Construct a particle.
   * @param {number} xPos - initial X position of this particle
   * @param {number} yPos - initial Y position of this particle
   */
  constructor( xPos, yPos ) {
    xPos = xPos || 0;
    yPos = yPos || 0;

    super( {} );

    // @public, used to signal if and when this particle should be removed from the model
    this.continueExistingProperty = new Property( true );

    // @private, position in space of this particle, units are nanometers, accessed through getter/setter methods
    this.positionX = xPos;
    this.positionY = yPos;

    // @public, opacity value, ranges from 0 (completely transparent) to 1 (completely opaque)
    this.opacity = 1;

    // @public - motion strategy for moving this particle around. StillnessMotionStrategy is stateless so use the
    // singleton instance.
    this.motionStrategy = StillnessMotionStrategy.getInstance();

    // @public - strategy for fading in and out
    this.fadeStrategy = NullFadeStrategy.getInstance();
  }

  // @public
  stepInTime( dt ) {
    this.motionStrategy.move( this, this, dt );
    this.fadeStrategy.updateOpacity( this, dt );
    if ( !this.fadeStrategy.shouldContinueExisting( this ) ) {
      // This particle has faded out of existence, so send out a notification that indicates that it is being removed
      // from the model.  The thinking here is that everyone with a reference to this particle should listen for this
      // notification and do any cleanup and removal of references needed.  If they don't, there will be memory leaks.
      this.continueExistingProperty.value = false;
    }
  }

  // @public
  isPositionEqual( otherX, otherY ) {
    return this.positionX === otherX && this.positionY === otherY;
  }

  // @public
  getPositionX() {
    return this.positionX;
  }

  // @public
  getPositionY() {
    return this.positionY;
  }

  /**
   * Get the radius of the object being moved.  This is generally used when the object needs to "bounce" (i.e. change
   * direction because some limit has been reached).  Note that this assumes a circular object or one that is fairly
   * close to circular.  If this assumption of approximate roundness proves to be too much of a limitation at some
   * point in the future, this may need to be generalized to be a bounding rectangle or some such thing.
   * @public
   */
  getRadius() {
    return DEFAULT_PARTICLE_RADIUS;   // Default value, override if needed to support other particles.
  }

  // @public
  setFadeStrategy( fadeStrategy ) {
    this.fadeStrategy = fadeStrategy;
  }

  // @public
  setMotionStrategy( motionStrategy ) {
    this.motionStrategy = motionStrategy;
  }

  // @public
  setPosition( x, y ) {
    this.positionX = x;
    this.positionY = y;
  }

  // @public
  isAvailableForCapture() {
    // If the particle is not in the process of trying to traverse a membrane channel, then it should be considered
    // to be available for capture.
    return !( this.motionStrategy instanceof MotionStrategy );
  }

  /**
   * Get a playback memento, which can be used when doing playback of previous model states.  Note that the memento
   * does not capture all of the particle's state, just enough to support playback.
   * @public
   */
  getPlaybackMemento() {
    return new ParticlePlaybackMemento( this );
  }

  // @public
  setOpacity( opacity ) {
    this.opacity = opacity;
  }

  // @public
  getOpacity() {
    return this.opacity;
  }
}

neuron.register( 'Particle', Particle );

export default Particle;
