// Copyright 2002-2011, University of Colorado

/**
 * Class representing Record Mode
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Mode = require( 'NEURON/neuron/recordandplayback/Mode' );
  var DataPoint = require( 'NEURON/neuron/recordandplayback/DataPoint' );

  /**
   * @param {RecordAndPlaybackModel}recordAndPlaybackModel
   * @constructor
   */
  function Record( recordAndPlaybackModel ) {
    Mode.call( this, {} );
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
      return "Record";
    }
  } );

} );