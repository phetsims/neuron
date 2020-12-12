// Copyright 2014-2020, University of Colorado Boulder

/**
 * A strategy that controls fading in for a particle based on time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import FadeStrategy from './FadeStrategy.js';
import NullFadeStrategy from './NullFadeStrategy.js';

class TimedFadeInStrategy extends FadeStrategy {

  /**
   * Constructor that assumes full fade in.
   *
   * @param {number} fadeTime - time, in seconds of sim time, for this to fade in
   */
  constructor( fadeTime ) {
    super();
    this.fadeTime = fadeTime; // @private
    this.fadeCountdownTimer = fadeTime; // @private
    this.opacityTarget = 1; // @private
  }

  // @public, @override
  updateOpacity( fadableModelElement, dt ) {
    fadableModelElement.setOpacity( Math.min( ( 1 - this.fadeCountdownTimer / this.fadeTime ) * this.opacityTarget, 1 ) );
    this.fadeCountdownTimer -= dt;
    if ( this.fadeCountdownTimer < 0 ) {
      this.fadeCountdownTimer = 0;
      // Done with the fade in, so set a null fade strategy.
      fadableModelElement.setFadeStrategy( NullFadeStrategy.getInstance() );
    }
  }
}

neuron.register( 'TimedFadeInStrategy', TimedFadeInStrategy );

export default TimedFadeInStrategy;