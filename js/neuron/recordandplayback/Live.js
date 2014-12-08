// Copyright 2002-2011, University of Colorado


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
    Mode.call( this, {} );
    this.recordAndPlaybackModel = recordAndPlaybackModel;
  }

  return inherit( Mode, Live,
    {
      step: function( simulationTimeChange ) {
        this.recordAndPlaybackModel.setTime( this.recordAndPlaybackModel.getTime() + simulationTimeChange );
        this.recordAndPlaybackModel.stepInTime( simulationTimeChange );
      },
      toString: function() {
        return "Live";
      }
    }
  )
    ;
} );