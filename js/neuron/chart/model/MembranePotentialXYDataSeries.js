// Copyright 2002-2014, University of Colorado Boulder

/**
 * XY Data Series of Time vs Membrane Potential
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var XYDataSeries = require( 'LIGHTBULB/XYDataSeries' );

  /**
   *
   * @param {Object} options // ex {color:'black'}
   * @constructor
   */
  function MembranePotentialXYDataSeries( options ) {

    XYDataSeries.call( this, options );

    this.clearListeners = [];

  }

  return inherit( XYDataSeries, MembranePotentialXYDataSeries, {
    getX: function( index ) {
      if ( index > this.xPoints.length - 1 ) {
        throw new Error( "No Data Point Exist at this index " + index );
      }
      return this.xPoints[index];

    },
    clear: function() {
      this.xPoints = [];
      this.yPoints = [];
      for ( var i = 0; i < this.clearListeners.length; i++ ) {
        this.clearListeners[i]();
      }
    },
    addDataClearListener: function( listener ) {
      this.clearListeners.push( listener );
    },
    get length() {
      return this.xPoints.length;
    }

  } );
} );