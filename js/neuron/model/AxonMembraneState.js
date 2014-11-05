//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A type that represents the state of the axon membrane, used primarily for record and playback.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {TravelingActionPotentialState} travelingActionPotentialState
   * @constructor
   */
  function AxonMembraneState( travelingActionPotentialState ) {
    this.travelingActionPotentialState = travelingActionPotentialState;
  }

  return inherit( Object, AxonMembraneState, {
    /**
     * Return the state of the traveling action potential.  If null, no traveling action potential exists.
     * @return
     */
    getTravelingActionPotentialState: function() {
      return this.travelingActionPotentialState;
    }
  } );
} );