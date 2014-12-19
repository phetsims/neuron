// Copyright 2002-2011, University of Colorado

/**
 * Abstract base class for fade strategies that can be used to fade model elements in and out
 *
 * @author John Blanco
 * @Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  function FadeStrategy() {}

  return inherit( Object, FadeStrategy, {
    /**
     * Fade the associated model element according to the specified amount of
     * time and the nature of the strategy.
     * @param fadableModelElement
     * @param dt
     */
    updateOpaqueness: function( fadableModelElement, dt ) {
      throw new Error( 'updateOpaqueness should be implemented in descendant classes.' );
    },

    /**
     * Get an indication of whether or not the model element that is
     * associated with this strategy should continue to exist.  This is
     * generally used to figure out when to remove a model element that has
     * faded away.
     */
    shouldContinueExisting: function( fadableModelElement ) {
      return true;
    }
  } );
} );
