// Copyright 2014-2020, University of Colorado Boulder

/**
 * A strategy that controls how a visible object fades out.  For this particular strategy, fading is based completely
 * on time, as opposed to position or some other parameter.  Works in conjunction with model elements that have the
 * appropriate API for fading.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import FadeStrategy from './FadeStrategy.js';

class TimedFadeAwayStrategy extends FadeStrategy {

  /**
   * @param {number} fadeTime - time, in seconds of sim time, for this to fade away
   */
  constructor( fadeTime ) {
    super();
    this.fadeTime = fadeTime; // @private
    this.fadeCountdownTimer = fadeTime;  // @private
  }

  // @public, @override
  updateOpacity( fadableModelElement, dt ) {
    fadableModelElement.setOpacity( Math.min( Math.max( this.fadeCountdownTimer / this.fadeTime, 0 ), fadableModelElement.getOpacity() ) );
    this.fadeCountdownTimer -= dt;
  }

  // @public, @override
  shouldContinueExisting( fadeableModelElement ) {
    return fadeableModelElement.getOpacity() > 0;
  }
}

neuron.register( 'TimedFadeAwayStrategy', TimedFadeAwayStrategy );

export default TimedFadeAwayStrategy;