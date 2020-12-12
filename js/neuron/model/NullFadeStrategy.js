// Copyright 2014-2020, University of Colorado Boulder
/**
 * Fade strategy that does nothing.  Useful for avoiding having to check for null values of fade strategy all the time.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import FadeStrategy from './FadeStrategy.js';

class NullFadeStrategy extends FadeStrategy {

  constructor() {
    super();
  }

  // @public, @override
  updateOpacity( fadableModelElement, dt ) {
    // Does nothing.
  }

  // @public
  static getInstance() {
    if ( !NullFadeStrategy.instance ) {
      // No need to create new instance of NullFadeStrategy , it is stateless
      // Using a single strategy instance to avoid allocation
      NullFadeStrategy.instance = new NullFadeStrategy();
    }
    return NullFadeStrategy.instance;
  }
}

neuron.register( 'NullFadeStrategy', NullFadeStrategy );

export default NullFadeStrategy;