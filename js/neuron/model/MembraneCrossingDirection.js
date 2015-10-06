// Copyright 2002-2015, University of Colorado Boulder
/**
 * Enum that defines the direction for something that is crossing a cell membrane.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function() {
  'use strict';

  var MembraneCrossingDirection = {
    'OUT_TO_IN': 'OUT_TO_IN',
    'IN_TO_OUT': 'IN_TO_OUT'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( MembraneCrossingDirection ); }

  return MembraneCrossingDirection;
} );