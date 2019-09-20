// Copyright 2014-2019, University of Colorado Boulder
/**
 * A simple motion strategy for moving in a straight line.  This was created primarily for testing and, if it is no
 * longer used, can be removed.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );
  const neuron = require( 'NEURON/neuron' );

  /**
   * @param {Vector2} velocity
   * @constructor
   */
  function LinearMotionStrategy( velocity ) {
    this.velocity = velocity; // @private, in nanometers per second of simulation time
  }

  neuron.register( 'LinearMotionStrategy', LinearMotionStrategy );

  return inherit( MotionStrategy, LinearMotionStrategy, {

    // @public
    move: function( movableModelElement, fadableModelElement, dt ) {
      const currentPositionRefX = movableModelElement.getPositionX();
      const currentPositionRefY = movableModelElement.getPositionY();
      movableModelElement.setPosition( currentPositionRefX + this.velocity.x * dt,
        currentPositionRefY + this.velocity.y * dt );
    }

  } );
} );
