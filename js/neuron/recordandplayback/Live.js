// Copyright 2014-2021, University of Colorado Boulder

/**
 * Type representing the 'live' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
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

neuron.register( 'Live', Live );

export default Live;