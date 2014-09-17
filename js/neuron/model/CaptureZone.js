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
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   *
   * @constructor
   */
  function CaptureZone( captureZoneOptions ) {
    captureZoneOptions = _.extend( {rotationalAngle: 0, originPoint: Vector2.ZERO}, captureZoneOptions || {} );
    var thisZone = this;
    PropertySet.call( thisZone, captureZoneOptions );

    thisZone.addDerivedProperty( "zoneShape", ['rotationalAngle', 'originPoint'], function( rotationalAngle, originPoint ) {
      return thisZone.deriveZoneShape();
    } );
  }

  return inherit( PropertySet, CaptureZone, {
    isPointInZone: function( pt ) {
      throw new Error( 'isPointInZone should be implemented in descendant classes.' );
    },
    // Suggest a location for placing a new or relocated particle into this capture zone.
    getSuggestedNewParticleLocation: function() {
      return Vector2.ZERO;
    },
    //Derived Property 'zoneShape' derivation function  (dependents - originPoint and RotationAngle)
    deriveZoneShape: function() {
      throw new Error( 'deriveZoneShape should be implemented in descendant classes.' );
    }
  } );
} );
