// Copyright 2014-2017, University of Colorado Boulder

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
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );

  /**
   * @param {Particle} particle
   * @constructor
   */
  function ParticlePlaybackMemento( particle ) {
    this.positionX = particle.getPositionX();
    this.positionY = particle.getPositionY();
    this.opacity = particle.getOpacity();
    this.particleType = particle.getType();
    this.radius = particle.getRadius();
    this.representationColor = particle.getRepresentationColor();
  }

  neuron.register( 'ParticlePlaybackMemento', ParticlePlaybackMemento );

  return inherit( Object, ParticlePlaybackMemento, {

    // @public
    getPositionX: function() {
      return this.positionX;
    },

    // @public
    getPositionY: function() {
      return this.positionY;
    },

    // @public
    getOpacity: function() {
      return this.opacity;
    },

    // @public
    getParticleType: function() {
      return this.particleType;
    },

    // @public
    getRadius: function() {
      return this.radius;
    },

    // @public
    getRepresentationColor: function() {
      return this.representationColor;
    }

  } );
} );

