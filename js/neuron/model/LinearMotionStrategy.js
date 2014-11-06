//  Copyright 2002-2014, University of Colorado Boulder
/**
 * A simple motion strategy for moving in a straight line.  This was created
 * primarily for testing and, if it is no longer used, can be removed.
 *
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );

  /**
   *
   * @param {Vector2} velocity
   * @constructor
   */
  function LinearMotionStrategy( velocity ) {
    this.velocity = velocity;// In nanometers per second of simulation time.
  }

  return inherit( MotionStrategy, LinearMotionStrategy, {
    move: function( movableModelElement, fadableModelElement, dt ) {
      var currentPositionRefX = movableModelElement.getPositionX();
      var currentPositionRefY = movableModelElement.getPositionY();
      movableModelElement.setPosition( currentPositionRefX + this.velocity.x * dt,
          currentPositionRefY + this.velocity.y * dt );
    }
  } );
} );
