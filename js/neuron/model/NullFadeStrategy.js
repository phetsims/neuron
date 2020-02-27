// Copyright 2014-2019, University of Colorado Boulder
/**
 * Fade strategy that does nothing.  Useful for avoiding having to check for null values of fade strategy all the time.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';
import FadeStrategy from './FadeStrategy.js';

/**
 * @constructor
 */
function NullFadeStrategy() {}

neuron.register( 'NullFadeStrategy', NullFadeStrategy );

export default inherit( FadeStrategy, NullFadeStrategy, {

    // @public, @override
    updateOpacity: function( fadableModelElement, dt ) {
      // Does nothing.
    }

  },

  //static
  {
    // @public
    getInstance: function() {
      if ( !NullFadeStrategy.instance ) {
        // No need to create new instance of NullFadeStrategy , it is stateless
        // Using a single strategy instance to avoid allocation
        NullFadeStrategy.instance = new NullFadeStrategy();
      }
      return NullFadeStrategy.instance;
    }
  }
);