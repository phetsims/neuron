// Copyright 2002-2011, University of Colorado

/**
 * Interface for a particle that can be viewed, i.e. displayed to the user.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @constructor
   */
  function ViewableParticle() {

  }

  return inherit( Object, ViewableParticle, {

    //subclasses must implement
    getType: function() {
      throw new Error( 'getType should be implemented in descendant classes.' );
    },
    getPositionX: function() {
      throw new Error( 'getPositionX should be implemented in descendant classes.' );
    },
    getPositionY: function() {
      throw new Error( 'getPositionY should be implemented in descendant classes.' );
    },

    /**
     * Get the radius of this particle in nano meters.  This is approximate in
     * the case of non-round particles.
     */
    getRadius: function() {
      throw new Error( 'getRadius should be implemented in descendant classes.' );
    },
    /**
     * Get the base color to be used when representing this particle.
     */
    getRepresentationColor: function() {
      throw new Error( 'getRepresentationColor should be implemented in descendant classes.' );
    },
    getOpaqueness: function() {
      throw new Error( 'getOpaqueness should be implemented in descendant classes.' );
    }

  } );

} );
