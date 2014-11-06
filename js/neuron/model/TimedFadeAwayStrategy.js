// Copyright 2002-2011, University of Colorado
/*
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var FadeStrategy = require( 'NEURON/neuron/model/FadeStrategy' );


  /**
   *
   * @param {number} fadeTime - time, in seconds of sim time, for this to fade away.
   * @constructor
   */
  function TimedFadeAwayStrategy( fadeTime ) {
    this.fadeTime = fadeTime;
    this.fadeCountdownTimer = fadeTime;
  }

  return inherit( FadeStrategy, TimedFadeAwayStrategy, {

    //@Override
    updateOpaqueness: function( fadableModelElement, dt ) {
      fadableModelElement.setOpaqueness( Math.min( Math.max( this.fadeCountdownTimer / this.fadeTime, 0 ), fadableModelElement.getOpaqueness() ) );
      this.fadeCountdownTimer -= dt;
    },

    //@Override
    shouldContinueExisting: function( fadeableModelElement ) {
      return fadeableModelElement.getOpaqueness() > 0;
    }

  } );
} );
