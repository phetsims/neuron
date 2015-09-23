// Copyright 2002-2011, University of Colorado

/**
 * A strategy that controls fading in for a particle based on time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var FadeStrategy = require( 'NEURON/neuron/model/FadeStrategy' );
  var NullFadeStrategy = require( 'NEURON/neuron/model/NullFadeStrategy' );

  /**
   * Constructor that assumes full fade in.
   *
   * @param {number} fadeTime - time, in seconds of sim time, for this to fade in.
   * @constructor
   */
  function TimedFadeInStrategy( fadeTime ) {
    this.fadeTime = fadeTime;
    this.fadeCountdownTimer = fadeTime;
    this.opacityTarget = 1;
  }

  return inherit( FadeStrategy, TimedFadeInStrategy, {

    //@Override
    updateOpacity: function( fadableModelElement, dt ) {
      fadableModelElement.setOpacity( Math.min( (1 - this.fadeCountdownTimer / this.fadeTime) * this.opacityTarget, 1 ) );
      this.fadeCountdownTimer -= dt;
      if ( this.fadeCountdownTimer < 0 ) {
        this.fadeCountdownTimer = 0;
        // Done with the fade in, so set a null fade strategy.
        fadableModelElement.setFadeStrategy( NullFadeStrategy.getInstance() );
      }
    }

  } );
} );
