// Copyright 2002-2011, University of Colorado

define( function( require ) {
  'use strict';
  function MathUtils() {

  }

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

