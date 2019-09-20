// Copyright 2014-2019, University of Colorado Boulder

/**
 * Type representing the 'record' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const DataPoint = require( 'NEURON/neuron/recordandplayback/DataPoint' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Mode = require( 'NEURON/neuron/recordandplayback/Mode' );
  const neuron = require( 'NEURON/neuron' );

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
      const state = this.recordAndPlaybackModel.stepInTime( simulationTimeChange );
      // only record the point if we have space
      this.recordAndPlaybackModel.addRecordedPoint( new DataPoint( this.recordAndPlaybackModel.getTime(), state ) );
    },

    // @public, @override
    toString: function() {
      return 'Record';
    }

  } );
} );