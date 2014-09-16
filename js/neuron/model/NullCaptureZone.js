//// Copyright 2002-2011, University of Colorado
/**
 * Class that defines a capture zone that contains nothing.  This is useful
 * when wanting to avoid having to do a bunch of null checks.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';
  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );
  var CaptureZone = require( 'NEURON/neuron/model/CaptureZone' );

  /**
   *
   * @constructor
   */
  function NullCaptureZone() {
    CaptureZone.call( this, {} );
  }

  return inherit( NullCaptureZone, CaptureZone, {
    //see CaptureZone
    deriveZoneShape: function() {
      return new Shape().ellipse( 0, 0, 0, 0 );
    },
    isPointInZone: function( pt ) {
      return false;
    },
    // Suggest a location for placing a new or relocated particle into this capture zone.
    getSuggestedNewParticleLocation: function() {
      return Vector2.ZERO;
    }
  } );

} );
