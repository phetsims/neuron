// Copyright 2002-2011, University of Colorado

/**
 * Class representing Record Mode
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Mode = require( 'NEURON/neuron/recordandplayback/Mode' );
  var DataPoint = require( 'NEURON/neuron/recordandplayback/DataPoint' );
  var BehaviourModeType = require( 'NEURON/neuron/recordandplayback/BehaviourModeType' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {RecordAndPlaybackModel}recordAndPlaybackModel
   * @constructor
   */
  function Playback( recordAndPlaybackModel ) {
    Mode.call(this,{});
    this.speedProperty = new Property( 0 );//1 is full speed; i.e. the time between the original samples
    this.recordAndPlaybackModel = recordAndPlaybackModel;
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

      this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.getTime() + simulationTimeChange );
      var state = this.recordAndPlaybackModel.stepInTime( simulationTimeChange );
      //todo: only record the point if we have space
      this.recordAndPlaybackModel.addRecordedPoint( new DataPoint( this.recordAndPlaybackModel.getTime(), state ) );
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