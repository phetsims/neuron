// Copyright 2014-2017, University of Colorado Boulder

/**
 * Base type representing a Mode in Record and PlayBack Model. The mode can be either playback, record or live.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );

  /**
   * @constructor
   */
  function Mode() {}

  neuron.register( 'Mode', Mode );

  return inherit( Object, Mode, {

    // @public
    step: function( simulationTimeChange ) {
      throw new Error( 'step should be implemented in descendant classes.' );
    },

    // @public
    toString: function() {
      throw new Error( 'toString should be implemented in descendant classes.' );
    }

  } );
} );
