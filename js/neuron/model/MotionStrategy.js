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

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @constructor
   */
  function MotionStrategy() {

  }

  return inherit( Object, MotionStrategy, {

    /**
     * Move the associated model element according to the specified amount of
     * time and the nature of the motion strategy.  The fadable interface is
     * also passed in, since it is possible for the motion strategy to update
     * the fade strategy.
     *
     * @param{Movable} movableModelElement
     * @param {IFadable} fadableModelElement
     * @param dt
     */
    move: function( movableModelElement, fadableModelElement, dt ) {
      //REVIEW: Should throw exception if called in base class, otherwise it's kind of pointless to have.

    }

  } );
} );

