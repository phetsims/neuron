// Copyright 2014-2015, University of Colorado Boulder

/**
 * Type representing the 'record' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var DataPoint = require( 'NEURON/neuron/recordandplayback/DataPoint' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Mode = require( 'NEURON/neuron/recordandplayback/Mode' );
  var neuron = require( 'NEURON/neuron' );

  /**
   * @param {RecordAndPlaybackModel} recordAndPlaybackModel
   * @constructor
   */
  function Record( recordAndPlaybackModel ) {
    this.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  neuron.register( 'Record', Record );

  return inherit( Mode, Record, {

    // @public, @override
    step: function( simulationTimeChange ) {
      this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.getTime() + simulationTimeChange );
      var state = this.recordAndPlaybackModel.stepInTime( simulationTimeChange );
      // only record the point if we have space
      this.recordAndPlaybackModel.addRecordedPoint( new DataPoint( this.recordAndPlaybackModel.getTime(), state ) );
    },

    // @public, @override
    toString: function() {
      return 'Record';
    }

  } );
} );