// Copyright 2014-2017, University of Colorado Boulder

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
  var neuron = require( 'NEURON/neuron' );

  /**
   * @param {RecordAndPlaybackModel} recordAndPlaybackModel
   * @constructor
   */
  function Live( recordAndPlaybackModel ) {
    this.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  neuron.register( 'Live', Live );

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