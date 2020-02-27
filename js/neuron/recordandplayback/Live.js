// Copyright 2014-2019, University of Colorado Boulder

/**
 * Type representing the 'live' mode within the RecordAndPlaybackModel.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';
import Mode from './Mode.js';

/**
 * @param {RecordAndPlaybackModel} recordAndPlaybackModel
 * @constructor
 */
function Live( recordAndPlaybackModel ) {
  this.recordAndPlaybackModel = recordAndPlaybackModel;
}

neuron.register( 'Live', Live );

export default inherit( Mode, Live, {

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