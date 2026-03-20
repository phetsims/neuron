// Copyright 2014-2026, University of Colorado Boulder

/**
 * Type representing the 'live' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Mode from './Mode.js';

class Live extends Mode {

  /**
   * @param {RecordAndPlaybackModel} recordAndPlaybackModel
   */
  constructor( recordAndPlaybackModel ) {
    super();
    this.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  // @public, @override
  step( simulationTimeChange ) {
    this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.getTime() + simulationTimeChange );
    this.recordAndPlaybackModel.stepInTime( simulationTimeChange );
  }

  // @public, @override
  toString() {
    return 'Live';
  }
}

export default Live;
