// Copyright 2002-2011, University of Colorado

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
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   */
  function Mode() {

  }

  return inherit( PropertySet, Mode, {
    step: function( simulationTimeChange ) {
      throw new Error( 'step should be implemented in descendant classes.' );
    },
    toString: function() {
      throw new Error( 'toString should be implemented in descendant classes.' );
    }
  } );
} );