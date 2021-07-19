// Copyright 2014-2021, University of Colorado Boulder

/**
 * Type representing the 'playback' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import BehaviourModeType from './BehaviourModeType.js';
import Mode from './Mode.js';

class Playback extends Mode {

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

    if ( simulationTimeChange > 0 ) {
      if ( this.recordAndPlaybackModel.getTime() < this.recordAndPlaybackModel.getMaxRecordedTime() ) {
        this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.timeProperty.get() + simulationTimeChange );
      }
      else {
        if ( BehaviourModeType.recordAtEndOfPlayback ) {
          this.recordAndPlaybackModel.setRecord( true );
        }
        else if ( BehaviourModeType.pauseAtEndOfPlayback ) {
          this.recordAndPlaybackModel.setPlaying( false );
        }
      }
    }
    else if ( simulationTimeChange < 0 ) {
      if ( this.recordAndPlaybackModel.getTime() > this.recordAndPlaybackModel.getMinRecordedTime() ) {
        this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.timeProperty.get() + simulationTimeChange );
      }
    }
  }

  /**
   * @override
   * @public
   */
  toString() {
    return 'Playback';
  }
}

neuron.register( 'Playback', Playback );

export default Playback;