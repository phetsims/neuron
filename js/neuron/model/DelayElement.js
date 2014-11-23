// Copyright 2002-2011, University of Colorado
/**
 * DelayElements are used as the individual entries in a DelayBuffer.  Each delay element consists of a value and
 * a time difference, generally from the time of the previous entry.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {number} value
   * @param {number} deltaTime
   * @constructor
   */
  function DelayElement( value, deltaTime ) {
    value = value || 0;
    deltaTime = deltaTime || 0;
    this.value = value;
    this.deltaTime = deltaTime;
  }

  return inherit( Object, DelayElement, {
    setValueAndTime: function( value, deltaTime ) {
      this.value = value;
      this.deltaTime = deltaTime;
    }
  } );

} );

