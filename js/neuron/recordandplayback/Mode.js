// Copyright 2014-2020, University of Colorado Boulder

/**
 * Base type representing a Mode in Record and PlayBack Model. The mode can be either playback, record or live.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';

/**
 * @constructor
 */
function Mode() {}

neuron.register( 'Mode', Mode );

inherit( Object, Mode, {

  // @public
  step: function( simulationTimeChange ) {
    throw new Error( 'step should be implemented in descendant classes.' );
  },

  // @public
  toString: function() {
    throw new Error( 'toString should be implemented in descendant classes.' );
  }

} );

export default Mode;