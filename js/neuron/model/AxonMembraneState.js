//  Copyright 2002-2014, University of Colorado Boulder

/**
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @param {TravelingActionPotentialState}travelingActionPotentialState
   * @constructor
   */
  function AxonMembraneState( travelingActionPotentialState ) {
    this.travelingActionPotentialState = travelingActionPotentialState;
  }

  return inherit( Object, AxonMembraneState, {
    /**
     * Return the state of the traveling action potential.  If null, no
     * travling action potential exists.
     * @return
     */
    getTravelingActionPotentialState: function() {
      return this.travelingActionPotentialState;
    }
  } );

} );