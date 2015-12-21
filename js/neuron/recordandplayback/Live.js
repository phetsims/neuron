// Copyright 2014-2015, University of Colorado Boulder

/**
 * Type representing the 'live' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Mode = require( 'NEURON/neuron/recordandplayback/Mode' );

  /**
   * @param {RecordAndPlaybackModel}recordAndPlaybackModel
   * @constructor
   */
  function Live( recordAndPlaybackModel ) {
    this.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  return inherit( Mode, Live, {

    // @public, @override
    step: function( simulationTimeChange ) {
      this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.getTime() + simulationTimeChange );
      this.recordAndPlaybackModel.stepInTime( simulationTimeChange );
    },

    // @public, @override
    toString: function() {
      return 'Live';
    }

  } );
} );