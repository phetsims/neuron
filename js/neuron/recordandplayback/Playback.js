// Copyright 2014-2017, University of Colorado Boulder

/**
 * Type representing the 'playback' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var BehaviourModeType = require( 'NEURON/neuron/recordandplayback/BehaviourModeType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Mode = require( 'NEURON/neuron/recordandplayback/Mode' );
  var neuron = require( 'NEURON/neuron' );

  /**
   * @param {RecordAndPlaybackModel} recordAndPlaybackModel
   * @constructor
   */
  function Playback( recordAndPlaybackModel ) {
    this.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  neuron.register( 'Playback', Playback );

  return inherit( Mode, Playback, {

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
} );