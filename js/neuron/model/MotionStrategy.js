// Copyright 2014-2019, University of Colorado Boulder
/**
 * Base class for motion strategies that can be used to set the type of motion for elements within the model.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';

function MotionStrategy() { }

neuron.register( 'MotionStrategy', MotionStrategy );

export default inherit( Object, MotionStrategy, {

  /**
   * Move the associated model element according to the specified amount of time and the nature of the motion
   * strategy.  The fadable interface is also passed in, since it is possible for the motion strategy to update the
   * fade strategy.
   * @param {Movable} movableModelElement
   * @param {Object} fadableModelElement
   * @param {number} dt
   * @public
   */
  move: function( movableModelElement, fadableModelElement, dt ) {
    throw new Error( 'move should be implemented in descendant classes of MotionStrategy.' );
  }

} );