// Copyright 2014-2026, University of Colorado Boulder
/**
 * The DataPoint is the basic data structure in recording, it keeps track of a state (which should be immutable)
 * and pairs it with a time at which the state occurred.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

class DataPoint {

  /**
   * @param {number} time
   * @param {Object} state
   */
  constructor( time, state ) {
    this.time = time; // @private
    this.state = state; // @private
  }

  // @public
  getTime() {
    return this.time;
  }

  // @public
  getState() {
    return this.state;
  }

  // @public
  toString() {
    return `time = ${this.time}, state = ${this.state}`;
  }
}

export default DataPoint;
