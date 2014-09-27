//  Copyright 2002-2014, University of Colorado Boulder

define( function( require ) {
  'use strict';

  function NeuronSharedConstants() {

  }

  // Clock
  NeuronSharedConstants.CLOCK_FRAME_RATE = 15; // fps, frames per second (wall time)

  // TODO var TIME_SPAN = 25; // In seconds.

  // Set up the clock ranges for the various modules.  Note that for this
  // sim the clock rates are often several orders of magnitude slower than
  // real time.

  NeuronSharedConstants.MIN_ACTION_POTENTIAL_CLOCK_DT = (1 / NeuronSharedConstants.CLOCK_FRAME_RATE) / 3000;
  NeuronSharedConstants.MAX_ACTION_POTENTIAL_CLOCK_DT = (1 / NeuronSharedConstants.CLOCK_FRAME_RATE) / 1000;
  NeuronSharedConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT =
  (NeuronSharedConstants.MIN_ACTION_POTENTIAL_CLOCK_DT + NeuronSharedConstants.MAX_ACTION_POTENTIAL_CLOCK_DT) * 0.55;

  return NeuronSharedConstants;

} );