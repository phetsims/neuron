// Copyright 2002-2011, University of Colorado
/**
 * Base class for "Capture Zones", which are essentially two dimensional
 * spaces where particles can be captured.
 *
 *@author John Blanco
 *@author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

//imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );


  /**
   *
   * @constructor
   */
  function CaptureZone() {


  }

  return inherit( Object, CaptureZone, {
    isPointInZone: function( pt ) {
      throw new Error( 'isPointInZone should be implemented in descendant classes.' );
    },
    // Suggest a location for placing a new or relocated particle into this capture zone.
    getSuggestedNewParticleLocation: function() {
      return Vector2.ZERO;
    },

    getOriginPoint: function() {
      throw new Error( 'getOriginPoint should be implemented in descendant classes.' );
    },
    setRotationalAngle: function( angle ) {
      throw new Error( 'setRotationalAngle should be implemented in descendant classes.' );
    },
    setOriginPoint: function( centerPoint ) {
      throw new Error( 'setOriginPoint should be implemented in descendant classes.' );
    }
  } );
} );
