// Copyright 2014-2019, University of Colorado Boulder

/**
 * A strategy that controls fading in for a particle based on time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';
import FadeStrategy from './FadeStrategy.js';
import NullFadeStrategy from './NullFadeStrategy.js';

/**
 * Constructor that assumes full fade in.
 *
 * @param {number} fadeTime - time, in seconds of sim time, for this to fade in
 * @constructor
 */
function TimedFadeInStrategy( fadeTime ) {
  this.fadeTime = fadeTime; // @private
  this.fadeCountdownTimer = fadeTime; // @private
  this.opacityTarget = 1; // @private
}

neuron.register( 'TimedFadeInStrategy', TimedFadeInStrategy );

export default inherit( FadeStrategy, TimedFadeInStrategy, {

  // @public, @override
  updateOpacity: function( fadableModelElement, dt ) {
    fadableModelElement.setOpacity( Math.min( ( 1 - this.fadeCountdownTimer / this.fadeTime ) * this.opacityTarget, 1 ) );
    this.fadeCountdownTimer -= dt;
    if ( this.fadeCountdownTimer < 0 ) {
      this.fadeCountdownTimer = 0;
      // Done with the fade in, so set a null fade strategy.
      fadableModelElement.setFadeStrategy( NullFadeStrategy.getInstance() );
    }
  }

} );