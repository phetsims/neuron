// Copyright 2014-2016, University of Colorado Boulder

/**
 * A strategy that controls how a visible object fades out.  For this particular strategy, fading is based completely
 * on time, as opposed to position or some other parameter.  Works in conjunction with model elements that have the
 * appropriate API for fading.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var FadeStrategy = require( 'NEURON/neuron/model/FadeStrategy' );
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );

  /**
   * @param {number} fadeTime - time, in seconds of sim time, for this to fade away
   * @constructor
   */
  function TimedFadeAwayStrategy( fadeTime ) {
    this.fadeTime = fadeTime; // @private
    this.fadeCountdownTimer = fadeTime;  // @private
  }

  neuron.register( 'TimedFadeAwayStrategy', TimedFadeAwayStrategy );

  return inherit( FadeStrategy, TimedFadeAwayStrategy, {

    // @public, @override
    updateOpacity: function( fadableModelElement, dt ) {
      fadableModelElement.setOpacity( Math.min( Math.max( this.fadeCountdownTimer / this.fadeTime, 0 ), fadableModelElement.getOpacity() ) );
      this.fadeCountdownTimer -= dt;
    },

    // @public, @override
    shouldContinueExisting: function( fadeableModelElement ) {
      return fadeableModelElement.getOpacity() > 0;
    }

  } );
} );
