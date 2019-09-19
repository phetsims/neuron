// Copyright 2014-2017, University of Colorado Boulder

/**
 * Interface for a particle that can be viewed, i.e. displayed to the user.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );

  /**
   *
   * @constructor
   */
  function ViewableParticle() {}

  neuron.register( 'ViewableParticle', ViewableParticle );

  return inherit( Object, ViewableParticle, {

    // @public, subclasses must implement
    getType: function() {
      throw new Error( 'getType should be implemented in descendant classes.' );
    },

    // @public, subclasses must implement
    getPositionX: function() {
      throw new Error( 'getPositionX should be implemented in descendant classes.' );
    },

    // @public, subclasses must implement
    getPositionY: function() {
      throw new Error( 'getPositionY should be implemented in descendant classes.' );
    },

    /**
     * Get the radius of this particle in nano meters.  This is approximate in the case of non-round particles.
     * @public
     */
    getRadius: function() {
      throw new Error( 'getRadius should be implemented in descendant classes.' );
    },

    /**
     * Get the base color to be used when representing this particle.
     * @public
     */
    getRepresentationColor: function() {
      throw new Error( 'getRepresentationColor should be implemented in descendant classes.' );
    },

    // @public, subclasses must implement
    getOpacity: function() {
      throw new Error( 'getOpacity should be implemented in descendant classes.' );
    }

  } );
} );
