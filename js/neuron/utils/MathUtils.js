// Copyright 2002-2011, University of Colorado
/**
 * A utility class - Has methods to do certain Math operations without creating new Vector2 instances
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var Vector2 = require( 'DOT/Vector2' );

  // Theses vectors is used as a temporary object for  calculating distance
  // without creating new Vector Instances, see createTraversalPoint method
  var distanceCalculatorVectorLHS = new Vector2();
  var distanceCalculatorVectorRHS = new Vector2();

  var MathUtils = {
    /**
     * A method to calculate distance by reusing vector instances.
     * This method is created to reduce Vector2 instance allocation during distance calcualtion
     * @param {number} posX
     * @param {number} posY
     * @param {number} otherPosX
     * @param {number} otherPosY
     * @returns {number}
     */
    distanceBetween: function( posX, posY, otherPosX, otherPosY ) {
      distanceCalculatorVectorLHS.x = posX;
      distanceCalculatorVectorLHS.y = posY;
      distanceCalculatorVectorRHS.x = otherPosX;
      distanceCalculatorVectorRHS.y = otherPosY;
      return distanceCalculatorVectorLHS.distance( distanceCalculatorVectorRHS );
    },

    round: function( val, places ) {
      var factor = Math.pow( 10, places );

      // Shift the decimal the correct number of places
      // to the right.
      val = val * factor;

      // Round to the nearest integer.
      var tmp = Math.round( val );

      // Shift the decimal the correct number of places
      // back to the left.
      return tmp / factor;
    }
  };
  return MathUtils;
} );

