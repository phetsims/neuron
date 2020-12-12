// Copyright 2014-2020, University of Colorado Boulder

/**
 * State of the action potential that is traveling down the axon.  This is used primarily to support record and
 * playback.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';

class TravelingActionPotentialState {

  /**
   * @param {number} travelTimeCountdownTimer
   * @param {number} lingerCountdownTimer
   */
  constructor( travelTimeCountdownTimer, lingerCountdownTimer ) {
    this.travelTimeCountdownTimer = travelTimeCountdownTimer; // @private
    this.lingerCountdownTimer = lingerCountdownTimer; // @private
  }

  // @public
  getLingerCountdownTimer() {
    return this.lingerCountdownTimer;
  }

  // @public
  getTravelTimeCountdownTimer() {
    return this.travelTimeCountdownTimer;
  }
}

neuron.register( 'TravelingActionPotentialState', TravelingActionPotentialState );

export default TravelingActionPotentialState;