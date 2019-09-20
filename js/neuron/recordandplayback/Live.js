// Copyright 2014-2019, University of Colorado Boulder

/**
 * Type representing the 'live' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const Mode = require( 'NEURON/neuron/recordandplayback/Mode' );
  const neuron = require( 'NEURON/neuron' );

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