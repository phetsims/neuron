// Copyright 2002-2011, University of Colorado
/**
 * Base class used to command the capturing of particles.  This is intended to
 * be used by membrane channels to tell the model that a particle should be
 * captured for movement through the channel.
 *
 *@author John Blanco
 *@author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';
  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  function ParticleCapture() {
    PropertySet.call( this, {} );
  }

  return inherit( PropertySet, ParticleCapture, {
    /**
     * @param {ParticleType}particleType
     * @param {MembraneChannel}membraneChannel
     * @param maxVelocity
     * @param {MembraneCrossingDirection} direction
     */
    requestParticleThroughChannel: function( particleType, membraneChannel, maxVelocity, direction ) {
      throw new Error( 'requestParticleThroughChannel should be implemented in descendant classes.' );
    }

  } );

} );

