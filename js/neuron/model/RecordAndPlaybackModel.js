//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The Neuron Model delegates all the animations through RecordAndPlaybackModel.
 * This class as of now acts only as a stub and  simply dispatches the step animation back to the Neuron Model
 * This stub is created in order keep NeuronModel's code intact as it makes multiple references to this class
 *
 * @author Sharfudeen Ashraf
 */
define( function( require ) {
  'use strict';
  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   */
  function RecordAndPlaybackModel( props ) {
    PropertySet.call( this, props );
    this.time = 0;//Current time of recording or playback

  }

  return inherit( PropertySet, RecordAndPlaybackModel, {

    reset: function() {
      PropertySet.prototype.reset.call( this );
    },
    step: function( dt ) {

    },
    isPlayback: function() {
      return false; // stubbed value
    },

    isRecord: function() {
      return false;
    },

    isLive: function() {
      return true;
    },
    setPaused: function( p ) {
      this.paused = p;
    },

    isPaused: function() {
      return false;
    },

    isRecordingFull: function() {
      return false;
    },

    getRecordedTimeRange: function() {
      return 0;
    },

    getTime: function() {
      return this.time;
    },

    getMaxRecordedTime: function() {
      return 0.0;
    },

    getMinRecordedTime: function() {
      return 0.0;
    },

    getPlaybackSpeed: function() {
      return 1; // Temp
    },
    /**
     * Switches to playback mode with the specified playback speed.
     *
     * @param speed the speed to use for playback, 1.0 = normal speed
     */
    setPlayback: function( speed ) {
    },

    setModeRecord: function() {
    },

    rewind: function() {
    },

    setTime: function( t ) {
      this.time = t;
    },

    setModeLive: function() {
    },
    clearHistory: function() {
    }
  } );

} );