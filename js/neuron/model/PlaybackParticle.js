// Copyright 2002-2011, University of Colorado

/**
 * Class that is used in the model to represent particles during playback.  It
 * is similar to a full blown particle but contains less data and implements
 * less capability, and this is faster and easier to create.  This is intended
 * for use as part of the implementation of the record-and-playback feature.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  //import
  var inherit = require( 'PHET_CORE/inherit' );
  var ViewableParticle = require( 'NEURON/neuron/model/ViewableParticle' );
  var PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );


  /**
   * Construct a playback particle.
   *
   * @param {Particle}particle - Real particle from which this playback particle
   * should be constructed.
   * @constructor
   */
  function PlaybackParticle( particle ) {

    //ViewableParticle is a PropertySet
    ViewableParticle.call( this, {
      appearanceChanged: false,
      position: particle.getPosition().copy()
    } );

    particle = particle || new PotassiumIon();// Construct as potassium by default.  This choice is arbitrary.
    this.opaqueness = particle.getOpaqueness();
    this.representationColor = particle.getRepresentationColor();
    this.radius = particle.getRadius();
    this.particleType = particle.getType();
  }

  return inherit( ViewableParticle, PlaybackParticle, {

    /**
     *
     * @param {ParticlePlaybackMemento}memento
     */
    restoreFromMemento: function( memento ) {
      this.setPosition( memento.getPositionRef() );
      // Note - setting the position will take care of the notification.

      var appearanceChanged = false;
      if ( this.opaqueness !== memento.getOpaqueness() ) {
        this.opaqueness = memento.getOpaqueness();
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

    getPosition: function() {
      return this.position.copy();
    },

    getPositionReference: function() {
      return this.position;
    },

    setPosition: function( newPos ) {
      this.position = newPos.copy();
    },

    getRepresentationColor: function() {
      return this.representationColor;
    },

    getOpaqueness: function() {
      return this.opaqueness;
    },

    getRadius: function() {
      return this.radius;
    },

    getType: function() {
      return this.particleType;
    }
  } );
} );

