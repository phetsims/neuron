// Copyright 2014-2017, University of Colorado Boulder

/**
 * Class that is used in the model to represent particles during playback.  It
 * is similar to a full blown particle but contains less data and implements
 * less capability, and this is faster and easier to create.  This is intended
 * for use as part of the implementation of the record-and-playback feature.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );
  const PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  const ViewableParticle = require( 'NEURON/neuron/model/ViewableParticle' );

  /**
   * Construct a playback particle.
   * @param {Particle} particle - Real particle from which this playback particle should be constructed.
   * @constructor
   */
  function PlaybackParticle( particle ) {
    particle = particle || new PotassiumIon();// Construct as potassium by default.  This choice is arbitrary.

    ViewableParticle.call( this, {
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

  neuron.register( 'PlaybackParticle', PlaybackParticle );

  return inherit( ViewableParticle, PlaybackParticle, {

    /**
     *
     * @param {ParticlePlaybackMemento} memento
     */
    restoreFromMemento: function( memento ) {
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
    },

    // @public
    getPositionX: function() {
      return this.positionX;
    },

    // @public
    getPositionY: function() {
      return this.positionY;
    },

    // @public
    setPosition: function( x, y ) {
      this.positionX = x;
      this.positionY = y;
    },

    // @public
    getRepresentationColor: function() {
      return this.representationColor;
    },

    // @public
    getOpacity: function() {
      return this.opacity;
    },

    // @public
    getRadius: function() {
      return this.radius;
    },

    // @public
    getType: function() {
      return this.particleType;
    }
  } );
} );

