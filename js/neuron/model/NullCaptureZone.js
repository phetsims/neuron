// Copyright 2014-2015, University of Colorado Boulder

/**
 * Class that defines a capture zone that contains nothing.  This is useful when wanting to avoid having to do a bunch
 * of null checks.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var CaptureZone = require( 'NEURON/neuron/model/CaptureZone' );

  /**
   * @constructor
   */
  function NullCaptureZone() {
    CaptureZone.call( this, {} );
  }

  return inherit( CaptureZone, NullCaptureZone, {

    // @public
    getShape: function() {
      return new Shape().ellipse( 0, 0, 0, 0 );
    },

    // @public
    isPointInZone: function( x, y ) {
      return false;
    },

    // @public - assign a random point that is somewhere within the shape.
    assignNewParticleLocation: function( particle ) {
      particle.setPosition( 0, 0 );
    },

    // @public
    getOriginPoint: function() {
      return null;
    },

    // @public
    setRotationalAngle: function( angle ) {
      // necessary to override, but does nothing in this particular subclass
    },

    // @public
    setOriginPoint: function( centerPoint ) {
      // necessary to override, but does nothing in this particular subclass
    }

  } );
} );
