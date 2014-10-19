// Copyright 2002-2011, University of Colorado

define( function( require ) {
  'use strict';

  //imports
  var Vector2 = require( 'DOT/Vector2' );

  //Theses vectors is used as a temporary object for  calculating distance without creating new Vector Instances, see createTraversalPoint method
  var distanceCalculatorVectorLHS = new Vector2();
  var distanceCalculatorVectorRHS = new Vector2();

  function MathUtils() {

  }

  MathUtils.distanceBetween = function( posX, posY, otherPosX, otherPosY ) {
    distanceCalculatorVectorLHS.x = posX;
    distanceCalculatorVectorLHS.y = posY;
    distanceCalculatorVectorRHS.x = otherPosX;
    distanceCalculatorVectorRHS.y = otherPosY;
    return distanceCalculatorVectorLHS.distance( distanceCalculatorVectorRHS );
  };

  MathUtils.round = function( val, places ) {
    var factor = Math.pow( 10, places );

    // Shift the decimal the correct number of places
    // to the right.
    val = val * factor;

    // Round to the nearest integer.
    var tmp = Math.round( val );

    // Shift the decimal the correct number of places
    // back to the left.
    return tmp / factor;
  };

  return MathUtils;
} );

