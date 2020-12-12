// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class contains enough state information to support particle motion and
 * appearance for the playback feature.  It does NOT contain enough state
 * information to store everything about the particle such that it could
 * resume the simulation.  For instance, the particles motion strategy is
 * not stored.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf
 */

import neuron from '../../neuron.js';

class ParticlePlaybackMemento {

  /**
   * @param {Particle} particle
   */
  constructor( particle ) {
    this.positionX = particle.getPositionX();
    this.positionY = particle.getPositionY();
    this.opacity = particle.getOpacity();
    this.particleType = particle.getType();
    this.radius = particle.getRadius();
    this.representationColor = particle.getRepresentationColor();
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
  getOpacity() {
    return this.opacity;
  }

  // @public
  getParticleType() {
    return this.particleType;
  }

  // @public
  getRadius() {
    return this.radius;
  }

  // @public
  getRepresentationColor() {
    return this.representationColor;
  }
}

neuron.register( 'ParticlePlaybackMemento', ParticlePlaybackMemento );

export default ParticlePlaybackMemento;