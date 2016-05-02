// Copyright 2014-2015, University of Colorado Boulder

/**
 * A utility class, contains methods to do certain math operations without creating new Vector2 instances
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var neuron = require( 'NEURON/neuron' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // These vectors are used as temporary objects for calculating distance without creating new Vector2 instances, see
  // the createTraversalPoint method.
  var distanceCalculatorVectorLHS = new Vector2();
  var distanceCalculatorVectorRHS = new Vector2();

  var MathUtils = {

    /**
     * A method to calculate distance by reusing vector instances. This method is created to reduce Vector2 instance
     * allocation during distance calculation.
     * @param {number} posX
     * @param {number} posY
     * @param {number} otherPosX
     * @param {number} otherPosY
     * @returns {number}
     * @public
     */
    distanceBetween: function( posX, posY, otherPosX, otherPosY ) {
      distanceCalculatorVectorLHS.x = posX;
      distanceCalculatorVectorLHS.y = posY;
      distanceCalculatorVectorRHS.x = otherPosX;
      distanceCalculatorVectorRHS.y = otherPosY;
      return distanceCalculatorVectorLHS.distance( distanceCalculatorVectorRHS );
    },

    /**
     * Rounds to a specific number of places
     * @param {number} val
     * @param {number} places
     * @returns {number}
     * @public
     */
    round: function( val, places ) {
      var factor = Math.pow( 10, places );

      // Shift the decimal the correct number of places
      // to the right.
      val = val * factor;

      // Round to the nearest integer.
      var tmp = Util.roundSymmetric( val );

      // Shift the decimal the correct number of places
      // back to the left.
      return tmp / factor;
    }
  };

  neuron.register( 'MathUtils', MathUtils );

  return MathUtils;
} );

