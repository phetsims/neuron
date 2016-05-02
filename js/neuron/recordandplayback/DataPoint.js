// Copyright 2014-2015, University of Colorado Boulder
/**
 * The DataPoint is the basic data structure in recording, it keeps track of a state (which should be immutable)
 * and pairs it with a time at which the state occurred.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );

  /**
   * @param {number} time
   * @param {Object} state
   * @constructor
   */
  function DataPoint( time, state ) {
    this.time = time; // @private
    this.state = state; // @private
  }

  neuron.register( 'DataPoint', DataPoint );

  return inherit( Object, DataPoint, {

    // @public
    getTime: function() {
      return this.time;
    },

    // @public
    getState: function() {
      return this.state;
    },

    // @public
    toString: function() {
      return 'time = ' + this.time + ', state = ' + this.state;
    }

  } );
} );