// Copyright 2014-2020, University of Colorado Boulder
/**
 * Motion strategy that does not do any motion, i.e. just leaves the model element in the same position.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import MotionStrategy from './MotionStrategy.js';

class StillnessMotionStrategy extends MotionStrategy {

  constructor() {
    super();
  }

  // @public, @override
  move( movableModelElement, fadableModelElement, dt ) {
    // Does nothing, since the object is not moving.
  }

  // @public
  static getInstance() {
    if ( !StillnessMotionStrategy.instance ) {
      // No need to create new instance of StillnessMotionStrategy , it is stateless
      // Using a single strategy instance to avoid allocation
      StillnessMotionStrategy.instance = new StillnessMotionStrategy();
    }
    return StillnessMotionStrategy.instance;
  }
}

neuron.register( 'StillnessMotionStrategy', StillnessMotionStrategy );

export default StillnessMotionStrategy;
