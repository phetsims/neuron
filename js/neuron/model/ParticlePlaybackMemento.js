// Copyright 2002-2013, University of Colorado Boulder

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

  //imports
  var inherit = require( 'PHET_CORE/inherit' );


  /**
   *
   * @constructor
   * @param {Particle} particle
   */
  function ParticlePlaybackMemento( particle ) {
    this.positionX = particle.getPositionX();
    this.positionY = particle.getPositionY();
    this.opaqueness = particle.getOpaqueness();
    this.particleType = particle.getType();
    this.radius = particle.getRadius();
    this.representationColor = particle.getRepresentationColor();

  }

  return inherit( Object, ParticlePlaybackMemento, {
    getPositionX: function() {
      return this.positionX;
    },
    getPositionY: function() {
      return this.positionY;
    },
    getOpaqueness: function() {
      return this.opaqueness;
    },
    getParticleType: function() {
      return this.particleType;
    },
    getRadius: function() {
      return this.radius;
    },
    getRepresentationColor: function() {
      return this.representationColor;
    }
  } );
} );

