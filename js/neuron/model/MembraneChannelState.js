//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Class that stores the state of a membrane channel and can be used to
 * restore it when needed.  This is generally used in support of the
 * record-and-playback functionality.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @param {MembraneChannel} membraneChannel
   * @constructor
   */
  function MembraneChannelState( membraneChannel ) {
    // Note: There are a number of other state variables that exist for a
    // membrane channel, but at the time of this writing (late June 2010),
    // they never change after construction.  It may be necessary to add
    // some or all of them later if this changes, or if membrane channels
    // need to come and go dynamically.
    this.openness = membraneChannel.getOpenness(); // @private
    this.inactivationAmt = membraneChannel.getInactivationAmt();  // @private
  }

  return inherit( Object, MembraneChannelState, {
    getOpenness: function() {
      return this.openness;
    },
    getInactivationAmt: function() {
      return this.inactivationAmt;
    }
  } );

} );