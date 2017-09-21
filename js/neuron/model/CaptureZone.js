// Copyright 2014-2016, University of Colorado Boulder
/**
 * Abstract base class for "Capture Zones", which are essentially two dimensional spaces where particles can be
 * captured.
 *
 *@author John Blanco
 *@author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );

  /**
   * @constructor
   */
  function CaptureZone() {}

  neuron.register( 'CaptureZone', CaptureZone );

  return inherit( Object, CaptureZone, {

    // @public
    isPointInZone: function( x, y ) {
      throw new Error( 'isPointInZone should be implemented in descendant classes.' );
    },

    // @public, assign a random point that is somewhere within the shape.
    assignNewParticleLocation: function( particle ) {
      particle.setPosition( 0, 0 );
    },

    // @public
    getOriginPoint: function() {
      throw new Error( 'getOriginPoint should be implemented in descendant classes.' );
    },

    // @public
    setRotationalAngle: function( angle ) {
      throw new Error( 'setRotationalAngle should be implemented in descendant classes.' );
    },

    // @public
    setOriginPoint: function( centerPoint ) {
      throw new Error( 'setOriginPoint should be implemented in descendant classes.' );
    }
  } );
} );
