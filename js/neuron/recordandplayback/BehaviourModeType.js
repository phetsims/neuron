// Copyright 2002-2011, University of Colorado
/**
 *
 * Behavior modes that were decided upon after testing

 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function() {
  'use strict';

  var BehaviourModeType = {
    pauseAtEndOfPlayback: true,
    recordAtEndOfPlayback: false
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( BehaviourModeType ); }

  return BehaviourModeType;
} );