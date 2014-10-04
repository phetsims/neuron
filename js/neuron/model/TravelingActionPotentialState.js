//  Copyright 2002-2014, University of Colorado Boulder

/**
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );


  function TravelingActionPotentialState( travelTimeCountdownTimer, lingerCountdownTimer ) {
    this.travelTimeCountdownTimer = travelTimeCountdownTimer;
    this.lingerCountdownTimer = lingerCountdownTimer;
  }

  return inherit( Object, TravelingActionPotentialState, {
    getLingerCountdownTimer: function() {
      return this.lingerCountdownTimer;
    },

    getTravelTimeCountdownTimer: function() {
      return this.travelTimeCountdownTimer;
    }
  } );

} );