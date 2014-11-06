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

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
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
   * @param {number} xPos - Initial X position of this particle.
   * @param {number} yPos - Initial Y position of this particle.
   */
  function Particle( xPos, yPos ) {
    xPos = xPos || 0;
    yPos = yPos || 0;

    ViewableParticle.call( this, {} );

    // particles while removing themselves will set this property to false
    this.continueExistingProperty = new Property( true );

    // Location in space of this particle, units are nano-meters.
    this.positionX = xPos;
    this.positionY = yPos;

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


    isPositionEqual: function( otherX, otherY ) {
      return this.positionX === otherX && this.positionY === otherY;
    },

    getPositionX: function() {
      return this.positionX;
    },
    getPositionY: function() {
      return this.positionY;
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
      this.positionX = x;
      this.positionY = y;
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
