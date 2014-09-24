//  Copyright 2002-2014, University of Colorado Boulder
/**
 * Base class for motion strategies that can be used to set the type of motion
 * for elements within the model.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );

  function MotionStrategy() {

  }

  return inherit( Object, MotionStrategy, {

    /**
     * Move the associated model element according to the specified amount of
     * time and the nature of the motion strategy.  The fadable interface is
     * also passed in, since it is possible for the motion stratagy to update
     * the fade strategy.
     *
     * @param{Movable} moveableModelElement
     * @param {IFadable} fadableModelElement
     * @param dt
     */
    move: function( moveableModelElement, fadableModelElement, dt ) {

    }

  } );
} );

