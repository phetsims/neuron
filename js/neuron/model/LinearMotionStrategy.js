// Copyright 2014-2019, University of Colorado Boulder
/**
 * A simple motion strategy for moving in a straight line.  This was created primarily for testing and, if it is no
 * longer used, can be removed.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';
import MotionStrategy from './MotionStrategy.js';

/**
 * @param {Vector2} velocity
 * @constructor
 */
function LinearMotionStrategy( velocity ) {
  this.velocity = velocity; // @private, in nanometers per second of simulation time
}

neuron.register( 'LinearMotionStrategy', LinearMotionStrategy );

export default inherit( MotionStrategy, LinearMotionStrategy, {

  // @public
  move: function( movableModelElement, fadableModelElement, dt ) {
    const currentPositionRefX = movableModelElement.getPositionX();
    const currentPositionRefY = movableModelElement.getPositionY();
    movableModelElement.setPosition( currentPositionRefX + this.velocity.x * dt,
      currentPositionRefY + this.velocity.y * dt );
  }

} );