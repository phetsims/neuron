// Copyright 2002-2011, University of Colorado

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
  var Property = require( 'AXON/Property' );

  /**
   * @param {RecordAndPlaybackModel}recordAndPlaybackModel
   * @constructor
   */
  function Playback( recordAndPlaybackModel ) {
    var thisPlayBack = this;
    thisPlayBack.speedProperty = new Property( 0 );//1 is full speed; i.e. the time between the original samples
    thisPlayBack.recordAndPlaybackModel = recordAndPlaybackModel;
    thisPlayBack.speedProperty.lazyLink( function() {
      thisPlayBack.recordAndPlaybackModel.updateRecordPlayBack();
    } );
  }

  return inherit( Mode, Playback, {
    step: function( simulationTimeChange ) {

      if ( this.getSpeed() > 0 ) {
        // Playing forwards.
        if ( this.recordAndPlaybackModel.getTime() < this.recordAndPlaybackModel.getMaxRecordedTime() ) {
          this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.time + this.getSpeed() * this.recordAndPlaybackModel.getPlaybackDT() );

        }
        else {
          if ( BehaviourModeType.recordAtEndOfPlayback ) {
            this.recordAndPlaybackModel.setRecord( true );
          }
          if ( BehaviourModeType.pauseAtEndOfPlayback ) {
            this.recordAndPlaybackModel.setPaused( true );
          }
        }
      }
      else if ( this.getSpeed() < 0 ) {
        // Playing backwards.
        if ( this.recordAndPlaybackModel.getTime() > this.recordAndPlaybackModel.getMinRecordedTime() ) {
          this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.time + this.getSpeed() * this.recordAndPlaybackModel.getPlaybackDT() );
        }
      }
    },
    setSpeed: function( speed ) {
      this.speedProperty.set( speed );
    },
    getSpeed: function() {
      return this.speedProperty.value;
    },
    toString: function() {
      return "Playback";
    }
  } );

} );