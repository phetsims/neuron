// Copyright 2014-2019, University of Colorado Boulder

/**
 * This is the main model base class for sims that support recording and playing back.  This is done by recording
 * discrete states, then being able to set re-apply them to the model.  This library does not currently provide support
 * for interpolation between states.
 *
 * This mixture of side-effects and state capturing seems to simplify graphics updating of normal model updating,
 * though it can create additional complexity during playback.
 *
 * @author Sharfudeen Ashraf
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Live = require( 'NEURON/neuron/recordandplayback/Live' );
  var neuron = require( 'NEURON/neuron' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Playback = require( 'NEURON/neuron/recordandplayback/Playback' );
  var Property = require( 'AXON/Property' );
  var Record = require( 'NEURON/neuron/recordandplayback/Record' );

  /**
   * @param {number} maxRecordPoints
   * @constructor
   */
  function RecordAndPlaybackModel( maxRecordPoints ) {

    var self = this;

    this.playingProperty = new Property( true ); // True if playing, false if paused
    this.timeProperty = new Property( 0 ); // Current time of recording or playback
    this.historyRemainderClearedProperty = new Property( false );
    this.historyClearedProperty = new Property( false );
    this.modeProperty = new Property( null ); // The current operational mode, valid values are playback, record or live

    this.maxRecordPoints = maxRecordPoints;

    // @private - the history of data points that have been recorded from the model.
    this.recordHistory = new ObservableArray();

    this.recordMode = new Record( this ); // @private - samples data from the mode and stores it
    this.playbackMode = new Playback( this ); // @private - plays back recorded data
    this.liveMode = new Live( this ); // @private - runs the model without recording it

    this.timeProperty.link( function() {
      self.updateRecordPlayBack();
    } );

    this.resetAll();
  }

  neuron.register( 'RecordAndPlaybackModel', RecordAndPlaybackModel );

  return inherit( Object, RecordAndPlaybackModel, {

    /**
     * Update the simulation model (should cause side effects to update the view), returning a snapshot of the state after the update.
     * The returned state could be ignored if the simulation is not in record mode.
     *
     * @param {number} dt - the amount of time to update the simulation (in whatever units the simulation model is using).
     * @returns the updated state, which can be used to restore the model during playback
     */
    stepInTime: function( dt ) {
      throw new Error( 'stepInTime should be implemented in descendant classes.' );
    },

    /**
     * Called by the Animation Loop
     * @param {number} dt
     */
    step: function( dt ) {
      if ( this.playingProperty.get() ) {
        this.stepMode( dt );
      }
    },

    /**
     * Steps the currently active mode by the specified amount of time.
     * @param {number} dt - the amount of time to step the current mode
     */
    stepMode: function( dt ) {
      this.modeProperty.get().step( dt );
    },

    isPlayback: function() {
      return this.modeProperty.get() === this.playbackMode;
    },

    updateRecordPlayBack: function() {
      throw new Error( 'updateRecordPlayBack should be implemented in descendant classes.' );
    },

    isRecord: function() {
      return this.modeProperty.get() === this.recordMode;
    },

    isLive: function() {
      return this.modeProperty.get() === this.liveMode;
    },

    setPlaying: function( playing ) {
      this.playingProperty.set( playing );
    },

    isPlaying: function() {
      return this.playingProperty.get();
    },

    isRecordingFull: function() {
      return this.recordHistory.length >= this.getMaxRecordPoints();
    },

    getRecordedTimeRange: function() {
      if ( this.recordHistory.length === 0 ) {
        return 0;
      }
      return this.recordHistory.get( this.recordHistory.length - 1 ).getTime() - this.recordHistory.get( 0 ).getTime();

    },

    getTime: function() {
      return this.timeProperty.get();
    },

    getMaxRecordedTime: function() {
      if ( this.recordHistory.length === 0 ) { return 0.0; }
      return this.recordHistory.get( this.recordHistory.length - 1 ).getTime();
    },

    getMinRecordedTime: function() {
      if ( this.recordHistory.length === 0 ) { return 0.0; }
      return this.recordHistory.get( 0 ).getTime();
    },

    setMode: function( mode ) {
      this.modeProperty.set( mode );
    },

    setModeLive: function() {
      this.setMode( this.liveMode );
    },

    setModeRecord: function() {
      this.setMode( this.recordMode );
    },

    setModePlayback: function() {
      this.setMode( this.playbackMode );
    },

    setTime: function( t ) {
      this.timeProperty.set( t );
      var isPlayBackVal = this.isPlayback();
      var recordPtsLength = this.getNumRecordedPoints();
      if ( isPlayBackVal && ( recordPtsLength > 0) ) { // Only restore state if during playback and state has been recorded
        this.setPlaybackState( this.getPlaybackState().getState() ); // Sets the model state to reflect the current playback index
      }
    },

    /**
     * This method should populate the model + view of the application with the data from the specified state.
     * This state was obtained through playing back or stepping the recorded history.
     * @param {Object} state - the state to display
     */
    setPlaybackState: function( state ) {
      throw new Error( 'setPlaybackState should be implemented in descendant classes.' );
    },

    getNumRecordedPoints: function() {
      return this.recordHistory.length;
    },

    startRecording: function() {
      this.setModeRecord();
      this.setPlaying( true );
    },

    clearHistory: function() {
      this.recordHistory.clear();
      this.setTime( 0.0 );// for some reason, time has to be reset to 0.0 here, or charts don't clear in motion-series on first press of clear button
      this.historyClearedProperty.set( !this.historyClearedProperty.get() );
    },

    /**
     * Empty function handle, which can be overridden to provide custom functionality when record was pressed
     * during playback.  This is useful since many sims have other data (or charts) that must be cleared when
     * record is pressed during playback.
     */
    handleRecordStartedDuringPlayback: function() {
    },

    /**
     * Look up a recorded state based on the specified time
     */
    getPlaybackState: function() {
      var self = this;
      var sortedHistory = this.recordHistory.getArray().slice();

      sortedHistory.sort( function( o1, o2 ) {
        // Though inefficient, this hasn't caused noticeable slowdown during testing.
        return compare( Math.abs( o1.getTime() - self.timeProperty.get() ), Math.abs( o2.getTime() - self.timeProperty.get() ) );
      } );

      function compare( d1, d2 ) {
        if ( d1 < d2 ) {
          return -1;
        }
        if ( d1 > d2 ) {
          return 1;
        }
        return 0;
      }

      return sortedHistory[ 0 ];
    },

    //Estimates what DT should be by the spacing of the data points.
    //This should provide some support for non-equal spaced samples, but other algorithms may be better
    getPlaybackDT: function() {
      if ( this.getNumRecordedPoints() === 0 ) { return 0; }
      else if ( this.getNumRecordedPoints() === 1 ) { return this.recordHistory.get( 0 ).getTime(); }
      else { return ( this.recordHistory.get( this.recordHistory.length - 1 ).getTime() - this.recordHistory.get( 0 ).getTime() ) / this.recordHistory.length; }
    },

    /**
     * Switches to playback mode.  This is a no-op if already in that mode.
     */
    setPlayback: function() {
      this.setRecord( false );
    },

    rewind: function() {
      this.setTime( this.getMinRecordedTime() );
    },

    /**
     * @param {DataPoint} point
     */
    addRecordedPoint: function( point ) {
      this.recordHistory.add( point );
    },

    /**
     * @param {number} point index of the item to be removed
     */
    removeHistoryPoint: function( point ) {
      this.recordHistory.remove( this.recordHistory[ point ] );
    },

    /**
     * @param {boolean} rec
     * use setmode
     */
    setRecord: function( rec ) {
      if ( rec && this.modeProperty.get() !== this.recordMode ) {
        this.clearHistoryRemainder();
        this.handleRecordStartedDuringPlayback();
        this.modeProperty.set( this.recordMode );
      }
      else if ( !rec && this.modeProperty.get() !== this.playbackMode ) {
        this.modeProperty.set( this.playbackMode );
      }
    },

    clearHistoryRemainder: function() {
      this.historyRemainderClearedProperty.set( false );
      var keep = [];
      var self = this;
      this.recordHistory.forEach( function( dataPoint ) {
        if ( dataPoint.getTime() < self.timeProperty.get() ) {
          keep.push( dataPoint );
        }
      } );

      this.recordHistory.clear();
      this.recordHistory.addAll( keep.slice() );
      this.historyRemainderClearedProperty.set( true );
    },

    resetAll: function() {
      this.playingProperty.reset();
      this.timeProperty.reset();
      this.historyRemainderClearedProperty.reset();
      this.historyClearedProperty.reset();
      this.modeProperty.reset();
      this.clearHistory();
      this.setTime( 0.0 );
      this.setRecord( true );
      this.setPlaying( false );
    }

  } );
} );