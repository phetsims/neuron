// Copyright 2014-2020, University of Colorado Boulder
/**
 * A simple motion strategy for moving in a straight line.  This was created primarily for testing and, if it is no
 * longer used, can be removed.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import MotionStrategy from './MotionStrategy.js';

class LinearMotionStrategy extends MotionStrategy {

  /**
   * @param {Vector2} velocity
   */
  constructor( velocity ) {
    super();
    this.velocity = velocity; // @private, in nanometers per second of simulation time
  }

  // @public
  move( movableModelElement, fadableModelElement, dt ) {
    const currentPositionRefX = movableModelElement.getPositionX();
    const currentPositionRefY = movableModelElement.getPositionY();
    movableModelElement.setPosition( currentPositionRefX + this.velocity.x * dt,
      currentPositionRefY + this.velocity.y * dt );
  }
}

neuron.register( 'LinearMotionStrategy', LinearMotionStrategy );

export default LinearMotionStrategy;