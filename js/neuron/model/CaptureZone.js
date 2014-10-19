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


  /**
   *
   * @constructor
   */
  function CaptureZone() {


  }

  return inherit( Object, CaptureZone, {
    isPointInZone: function( x,y ) {
      throw new Error( 'isPointInZone should be implemented in descendant classes.' );
    },
    // assign a random point that is somewhere within the shape.
    assignNewParticleLocation: function( particle ) {
      particle.setPosition( 0, 0 );
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
