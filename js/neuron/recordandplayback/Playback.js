// Copyright 2014-2020, University of Colorado Boulder

/**
 * Type representing the 'playback' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';
import BehaviourModeType from './BehaviourModeType.js';
import Mode from './Mode.js';

/**
 * @param {RecordAndPlaybackModel} recordAndPlaybackModel
 * @constructor
 */
function Playback( recordAndPlaybackModel ) {
  this.recordAndPlaybackModel = recordAndPlaybackModel;
}

neuron.register( 'Playback', Playback );

inherit( Mode, Playback, {

  // @public, @override
  step: function( simulationTimeChange ) {

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
  },

  // @public, @override
  toString: function() {
    return 'Playback';
  }
} );

export default Playback;