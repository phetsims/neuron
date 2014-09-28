// Copyright 2002-2011, University of Colorado

/**
 * Interface for a particle that can be viewed, i.e. displayed to the user.
 * @author John Blanco
 * @Sharfudeen Ashraf (for Ghnet University)
 */

define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  function ViewableParticle() {

  }

  return inherit( PropertySet, ViewableParticle, {

    //subclasses must implement
    getType: function() {
      throw new Error( 'getType should be implemented in descendant classes.' );
    },
    getPosition: function() {
      throw new Error( 'getPosition should be implemented in descendant classes.' );
    },
    getPositionReference: function() {
      throw new Error( 'getPositionReference should be implemented in descendant classes.' );
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
