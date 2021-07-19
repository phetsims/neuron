// Copyright 2014-2021, University of Colorado Boulder

/**
 * Type representing the 'record' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import DataPoint from './DataPoint.js';
import Mode from './Mode.js';

class Record extends Mode {

  /**
   * @param {RecordAndPlaybackModel} recordAndPlaybackModel
   */
  constructor( recordAndPlaybackModel ) {
    super();
    this.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  /**
   * @override
   * @public
   * @param {number} simulationTimeChange
   */
  step( simulationTimeChange ) {
    this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.getTime() + simulationTimeChange );
    const state = this.recordAndPlaybackModel.stepInTime( simulationTimeChange );
    // only record the point if we have space
    this.recordAndPlaybackModel.addRecordedPoint( new DataPoint( this.recordAndPlaybackModel.getTime(), state ) );
  }

  /**
   * @override
   * @public
   */
  toString() {
    return 'Record';
  }
}

neuron.register( 'Record', Record );

export default Record;