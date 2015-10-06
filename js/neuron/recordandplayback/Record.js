// Copyright 2002-2015, University of Colorado Boulder

/**
 * Type representing the 'record' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Mode = require( 'NEURON/neuron/recordandplayback/Mode' );
  var DataPoint = require( 'NEURON/neuron/recordandplayback/DataPoint' );

  /**
   * @param {RecordAndPlaybackModel}recordAndPlaybackModel
   * @constructor
   */
  function Record( recordAndPlaybackModel ) {
    this.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  return inherit( Mode, Record, {

    step: function( simulationTimeChange ) {
      this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.getTime() + simulationTimeChange );
      var state = this.recordAndPlaybackModel.stepInTime( simulationTimeChange );
      // only record the point if we have space
      this.recordAndPlaybackModel.addRecordedPoint( new DataPoint( this.recordAndPlaybackModel.getTime(), state ) );
    },

    toString: function() {
      return 'Record';
    }

  } );
} );