// Copyright 2014-2015, University of Colorado Boulder

/**
 * Base type representing a Mode in Record and PlayBack Model. The mode can be either playback, record or live.
 *
 * @author Sam Reid
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   */
  function Mode() {}

  neuron.register( 'Mode', Mode );

  return inherit( PropertySet, Mode, {

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