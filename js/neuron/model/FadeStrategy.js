// Copyright 2014-2020, University of Colorado Boulder

/**
 * Abstract base class for fade strategies that can be used to fade model elements in and out.
 *
 * @author John Blanco
 * @Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';

function FadeStrategy() {}

neuron.register( 'FadeStrategy', FadeStrategy );

inherit( Object, FadeStrategy, {

  /**
   * Fade the associated model element according to the specified amount of time and the nature of the strategy.
   * @protected
   */
  updateOpacity: function( fadableModelElement, dt ) {
    throw new Error( 'updateOpacity should be implemented in descendant classes.' );
  },

  /**
   * Get an indication of whether or not the model element that is associated with this strategy should continue to
   * exist.  This is generally used to figure out when to remove a model element that has faded away.
   * @public
   */
  shouldContinueExisting: function( fadableModelElement ) {
    return true;
  }
} );

export default FadeStrategy;