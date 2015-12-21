// Copyright 2014-2015, University of Colorado Boulder

/**
 * State of the action potential that is traveling down the axon.  This is used primarily to support record and
 * playback.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {number} travelTimeCountdownTimer
   * @param {number} lingerCountdownTimer
   * @constructor
   */
  function TravelingActionPotentialState( travelTimeCountdownTimer, lingerCountdownTimer ) {
    this.travelTimeCountdownTimer = travelTimeCountdownTimer; // @private
    this.lingerCountdownTimer = lingerCountdownTimer; // @private
  }

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