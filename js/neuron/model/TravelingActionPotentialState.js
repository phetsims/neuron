// Copyright 2014-2017, University of Colorado Boulder

/**
 * State of the action potential that is traveling down the axon.  This is used primarily to support record and
 * playback.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );

  /**
   * @param {number} travelTimeCountdownTimer
   * @param {number} lingerCountdownTimer
   * @constructor
   */
  function TravelingActionPotentialState( travelTimeCountdownTimer, lingerCountdownTimer ) {
    this.travelTimeCountdownTimer = travelTimeCountdownTimer; // @private
    this.lingerCountdownTimer = lingerCountdownTimer; // @private
  }

  neuron.register( 'TravelingActionPotentialState', TravelingActionPotentialState );

  return inherit( Object, TravelingActionPotentialState, {

    // @public
    getLingerCountdownTimer: function() {
      return this.lingerCountdownTimer;
    },

    // @public
    getTravelTimeCountdownTimer: function() {
      return this.travelTimeCountdownTimer;
    }

  } );
} );