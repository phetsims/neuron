// Copyright 2014-2020, University of Colorado Boulder

/**
 * Class that is used in the model to represent particles during playback.  It
 * is similar to a full blown particle but contains less data and implements
 * less capability, and this is faster and easier to create.  This is intended
 * for use as part of the implementation of the record-and-playback feature.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import PotassiumIon from './PotassiumIon.js';
import ViewableParticle from './ViewableParticle.js';

class PlaybackParticle extends ViewableParticle {

  /**
   * Construct a playback particle.
   * @param {Particle} particle - Real particle from which this playback particle should be constructed.
   */
  constructor( particle ) {
    particle = particle || new PotassiumIon();// Construct as potassium by default.  This choice is arbitrary.

    super( {
      appearanceChanged: false
    } );

    // @private, accessed through methods defined below
    this.positionX = particle.getPositionX();
    this.positionY = particle.getPositionY();
    this.opacity = particle.getOpacity();
    this.representationColor = particle.getRepresentationColor();
    this.radius = particle.getRadius();
    this.particleType = particle.getType();
  }

  /**
   * @public
   * @param {ParticlePlaybackMemento} memento
   */
  restoreFromMemento( memento ) {
    this.setPosition( memento.getPositionX(), memento.getPositionY() );

    let appearanceChanged = false;
    if ( this.opacity !== memento.getOpacity() ) {
      this.opacity = memento.getOpacity();
      appearanceChanged = true;
    }
    if ( this.particleType !== memento.getParticleType() ) {
      this.particleType = memento.getParticleType();
      appearanceChanged = true;
    }
    if ( this.representationColor !== memento.getRepresentationColor() ) {
      this.representationColor = memento.getRepresentationColor();
      appearanceChanged = true;
    }
    if ( appearanceChanged ) {
      this.appearanceChanged = !this.appearanceChanged;
    }
  }

  // @public
  getPositionX() {
    return this.positionX;
  }

  // @public
  getPositionY() {
    return this.positionY;
  }

  // @public
  setPosition( x, y ) {
    this.positionX = x;
    this.positionY = y;
  }

  // @public
  getRepresentationColor() {
    return this.representationColor;
  }

  // @public
  getOpacity() {
    return this.opacity;
  }

  // @public
  getRadius() {
    return this.radius;
  }

  // @public
  getType() {
    return this.particleType;
  }
}

neuron.register( 'PlaybackParticle', PlaybackParticle );

export default PlaybackParticle;