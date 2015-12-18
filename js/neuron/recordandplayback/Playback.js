// Copyright 2014-2015, University of Colorado Boulder

/**
 * Type representing the 'playback' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Mode = require( 'NEURON/neuron/recordandplayback/Mode' );
  var BehaviourModeType = require( 'NEURON/neuron/recordandplayback/BehaviourModeType' );

  /**
   * @param {RecordAndPlaybackModel}recordAndPlaybackModel
   * @constructor
   */
  function Playback( recordAndPlaybackModel ) {
    var thisPlayBack = this;
    thisPlayBack.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  return inherit( Mode, Playback, {

    step: function( simulationTimeChange ) {

      if ( simulationTimeChange > 0 ) {
        if ( this.recordAndPlaybackModel.getTime() < this.recordAndPlaybackModel.getMaxRecordedTime() ) {
          this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.time + simulationTimeChange );
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
          this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.time + simulationTimeChange );
        }
      }
    },

    toString: function() {
      return 'Playback';
    }
  } );
} );