// Copyright 2002-2011, University of Colorado
/**
 * The DataPoint is the basic data structure in recording, it keeps track of a state  (which should be immutable)
 * and pairs it with a time at which the state occurred.
 *
 * The type of the state (should be immutable), possibly a memento pattern for recording a model state.
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @param {number} time
   * @param {Object} state
   * @constructor
   */
  function DataPoint( time, state ) {
    this.time = time; // The  time at which the state occurred
    this.state = state;
  }

  return inherit( Object, DataPoint, {

    getTime: function() {
      return this.time;
    },

    getState: function() {
      return this.state;
    },

    toString: function() {
      return "time = " + this.time + ", state = " + this.state;
    }
  } );

} );