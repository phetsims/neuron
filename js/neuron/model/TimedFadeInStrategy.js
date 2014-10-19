// Copyright 2002-2011, University of Colorado

/*
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var FadeStrategy = require( 'NEURON/neuron/model/FadeStrategy' );
  var NullFadeStrategy = require( 'NEURON/neuron/model/NullFadeStrategy' );

  /**
   * Constructor that assumes full fade in.
   *
   * @param fadeTime - time, in seconds of sim time, for this to fade in.
   */
  function TimedFadeInStrategy( fadeTime ) {
    this.fadeTime = fadeTime;
    this.fadeCountdownTimer = fadeTime;
    this.opaquenessTarget = 1;
  }

  return inherit( FadeStrategy, TimedFadeInStrategy, {
    //@Override
    updateOpaqueness: function( fadableModelElement, dt ) {
      fadableModelElement.setOpaqueness( Math.min( (1 - this.fadeCountdownTimer / this.fadeTime) * this.opaquenessTarget, 1 ) );
      this.fadeCountdownTimer -= dt;
      if ( this.fadeCountdownTimer < 0 ) {
        this.fadeCountdownTimer = 0;
        // Done with the fade in, so set a null fade strategy.
        fadableModelElement.setFadeStrategy( NullFadeStrategy.getInstance() );
      }
    }

  } );

} );
