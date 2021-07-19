// Copyright 2014-2021, University of Colorado Boulder

/**
 * This is the main model base class for sims that support recording and playing back.  This is done by recording
 * discrete states, then being able to set re-apply them to the model.  This library does not currently provide support
 * for interpolation between states.
 *
 * This mixture of side-effects and state capturing seems to simplify graphics updating of normal model updating,
 * though it can create additional complexity during playback.
 *
 * @author Sharfudeen Ashraf
 * @author Sam Reid (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import neuron from '../../neuron.js';
import Live from './Live.js';
import Playback from './Playback.js';
import Record from './Record.js';

class RecordAndPlaybackModel {

  constructor( maxRecordPoints ) {

    this.playingProperty = new Property( true ); // True if playing, false if paused
    this.timeProperty = new Property( 0 ); // Current time of recording or playback
    this.historyRemainderClearedProperty = new Property( false );
    this.historyClearedProperty = new Property( false );
    this.modeProperty = new Property( null ); // The current operational mode, valid values are playback, record or live

    this.maxRecordPoints = maxRecordPoints;

    // @private - the history of data points that have been recorded from the model.
    this.recordHistory = createObservableArray();

    this.recordMode = new Record( this ); // @private - samples data from the mode and stores it
    this.playbackMode = new Playback( this ); // @private - plays back recorded data
    this.liveMode = new Live( this ); // @private - runs the model without recording it

    this.timeProperty.lazyLink( () => {
      this.updateRecordPlayBack();
    } );
  }

  /**
   * Update the simulation model (should cause side effects to update the view), returning a snapshot of the state after the update.
   * The returned state could be ignored if the simulation is not in record mode.
   * @public
   * @abstract
   * @param {number} dt - the amount of time to update the simulation (in whatever units the simulation model is using).
   * @returns the updated state, which can be used to restore the model during playback
   */
  stepInTime( dt ) {
    throw new Error( 'stepInTime should be implemented in descendant classes.' );
  }

  /**
   * Called by the Animation Loop
   * @public
   * @param {number} dt
   */
  step( dt ) {
    if ( this.playingProperty.get() ) {
      this.stepMode( dt );
    }
  }

  /**
   * Steps the currently active mode by the specified amount of time.
   * @private
   * @param {number} dt - the amount of time to step the current mode
   */
  stepMode( dt ) {
    this.modeProperty.get().step( dt );
  }

  /**
   * @public
   * @returns {boolean}
   */
  isPlayback() {
    return this.modeProperty.get() === this.playbackMode;
  }

  /**
   * @abstract
   * @protected
   */
  updateRecordPlayBack() {
    throw new Error( 'updateRecordPlayBack should be implemented in descendant classes.' );
  }

  /**
   * @public
   * @returns {boolean}
   */
  isRecord() {
    return this.modeProperty.get() === this.recordMode;
  }

  /**
   * @protected
   * @returns {boolean}
   */
  isLive() {
    return this.modeProperty.get() === this.liveMode;
  }

  /**
   * @public
   * @param {boolean} playing
   */
  setPlaying( playing ) {
    this.playingProperty.set( playing );
  }

  /**
   * @public
   * @returns {boolean}
   */
  isRecordingFull() {
    return this.recordHistory.length >= this.getMaxRecordPoints();
  }

  /**
   * @public
   * @returns {number}
   */
  getRecordedTimeRange() {
    if ( this.recordHistory.length === 0 ) {
      return 0;
    }
    return this.recordHistory.get( this.recordHistory.length - 1 ).getTime() - this.recordHistory.get( 0 ).getTime();

  }

  /**
   * @public
   * @returns {number}
   */
  getTime() {
    return this.timeProperty.get();
  }

  /**
   * @public
   * @returns {number}
   */
  getMaxRecordedTime() {
    if ( this.recordHistory.length === 0 ) { return 0.0; }
    return this.recordHistory.get( this.recordHistory.length - 1 ).getTime();
  }

  /**
   * @public
   * @returns {number}
   */
  getMinRecordedTime() {
    if ( this.recordHistory.length === 0 ) { return 0.0; }
    return this.recordHistory.get( 0 ).getTime();
  }

  /**
   * @public
   * @param {Mode} mode
   */
  setMode( mode ) {
    this.modeProperty.set( mode );
  }

  /**
   * @public
   */
  setModeLive() {
    this.setMode( this.liveMode );
  }

  /**
   * @public
   */
  setModeRecord() {
    this.setMode( this.recordMode );
  }

  /**
   * @public
   */
  setModePlayback() {
    this.setMode( this.playbackMode );
  }

  /**
   * @public
   * @param {number} t
   */
  setTime( t ) {
    this.timeProperty.set( t );
    const isPlayBackVal = this.isPlayback();
    const recordPtsLength = this.getNumRecordedPoints();
    if ( isPlayBackVal && ( recordPtsLength > 0 ) ) { // Only restore state if during playback and state has been recorded
      this.setPlaybackState( this.getPlaybackState().getState() ); // Sets the model state to reflect the current playback index
    }
  }

  /**
   * This method should populate the model + view of the application with the data from the specified state.
   * This state was obtained through playing back or stepping the recorded history.
   * @private
   * @param {Object} state - the state to display
   */
  setPlaybackState( state ) {
    throw new Error( 'setPlaybackState should be implemented in descendant classes.' );
  }

  /**
   * @private
   * @returns {number}
   */
  getNumRecordedPoints() {
    return this.recordHistory.length;
  }

  /**
   * @public
   */
  startRecording() {
    this.setModeRecord();
    this.setPlaying( true );
  }

  /**
   * @public
   */
  clearHistory() {
    this.recordHistory.clear();
    this.setTime( 0.0 );// for some reason, time has to be reset to 0.0 here, or charts don't clear in motion-series on first press of clear button
    this.historyClearedProperty.set( !this.historyClearedProperty.get() );
  }

  /**
   * Empty function handle, which can be overridden to provide custom functionality when record was pressed
   * during playback.  This is useful since many sims have other data (or charts) that must be cleared when
   * record is pressed during playback.
   * @abstract
   * @public
   */
  handleRecordStartedDuringPlayback() {
  }

  /**
   * Look up a recorded state based on the specified time
   * @private
   */
  getPlaybackState() {
    const sortedHistory = this.recordHistory.slice();

    sortedHistory.sort( ( o1, o2 ) => compare( Math.abs( o1.getTime() - this.timeProperty.get() ), Math.abs( o2.getTime() - this.timeProperty.get() ) ) );

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
  }

  /**
   * @private
   * @returns {number}
   */
  getPlaybackDT() {
    if ( this.getNumRecordedPoints() === 0 ) { return 0; }
    else if ( this.getNumRecordedPoints() === 1 ) { return this.recordHistory.get( 0 ).getTime(); }
    else { return ( this.recordHistory.get( this.recordHistory.length - 1 ).getTime() - this.recordHistory.get( 0 ).getTime() ) / this.recordHistory.length; }
  }

  /**
   * Switches to playback mode.  This is a no-op if already in that mode.
   * @public
   */
  setPlayback() {
    this.setRecord( false );
  }

  /**
   * @public
   */
  rewind() {
    this.setTime( this.getMinRecordedTime() );
  }

  /**
   * @public
   * @param {DataPoint} point
   */
  addRecordedPoint( point ) {
    this.recordHistory.add( point );
  }

  /**
   * @public
   * @param {number} point index of the item to be removed
   */
  removeHistoryPoint( point ) {
    this.recordHistory.remove( this.recordHistory[ point ] );
  }

  /**
   * @public
   * @param {boolean} rec
   * use setmode
   */
  setRecord( rec ) {
    if ( rec && this.modeProperty.get() !== this.recordMode ) {
      this.clearHistoryRemainder();
      this.handleRecordStartedDuringPlayback();
      this.modeProperty.set( this.recordMode );
    }
    else if ( !rec && this.modeProperty.get() !== this.playbackMode ) {
      this.modeProperty.set( this.playbackMode );
    }
  }

  /**
   * @private
   */
  clearHistoryRemainder() {
    this.historyRemainderClearedProperty.set( false );
    const keep = [];
    this.recordHistory.forEach( dataPoint => {
      if ( dataPoint.getTime() < this.timeProperty.get() ) {
        keep.push( dataPoint );
      }
    } );

    this.recordHistory.clear();
    this.recordHistory.addAll( keep.slice() );
    this.historyRemainderClearedProperty.set( true );
  }

  /**
   * @public
   */
  resetAll() {
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
}

neuron.register( 'RecordAndPlaybackModel', RecordAndPlaybackModel );

export default RecordAndPlaybackModel;