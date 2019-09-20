// Copyright 2014-2019, University of Colorado Boulder

/**
 * A type that represents the state of the axon membrane, used primarily for record and playback.  It is, at the time
 * of this writing, very simple - so simple that one might wonder whether it makes sense for it to exist at all.  Here
 * is the justification: It exists primarily for consistency with other state variables related to playback and record,
 * and so that it is easy to add new information if the state of the axon membrane were to become more complex.
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
   * @param {TravelingActionPotentialState} travelingActionPotentialState
   * @constructor
   */
  function AxonMembraneState( travelingActionPotentialState ) {
    this.travelingActionPotentialState = travelingActionPotentialState;  // @private
  }

  neuron.register( 'AxonMembraneState', AxonMembraneState );

  return inherit( Object, AxonMembraneState, {

    /**
     * Return the state of the traveling action potential.  If null, no traveling action potential exists.
     * @return
     * @public
     */
    getTravelingActionPotentialState: function() {
      return this.travelingActionPotentialState;
    }
  } );
} );