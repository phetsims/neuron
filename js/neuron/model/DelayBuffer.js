// Copyright 2002-2011, University of Colorado
/**
 * This class is a delay buffer that allows information to be put into it
 * and then extracted based on the amount of time in the past that a value
 * is needed.
 *
 * NOTE: If this turns out to be useful for other applications, it should be
 * made to handle generics.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  var DelayElement = require( 'NEURON/neuron/model/DelayElement' );


  // This value is used to tell if two numbers are different.  It was needed
  // due to some floating point resolution problems that were occurring.
  var DIFFERENCE_RESOLUTION = 1E-15;


  function DelayBuffer( maxDelay, minTimeStep ) {
    var thisBuffer = this;
    thisBuffer.numEntries = Math.ceil( maxDelay / minTimeStep );
    thisBuffer.filling = false;
    thisBuffer.allDeltaTimesEqual = true;
    thisBuffer.previousDeltaTime = -1;
    thisBuffer.countAtThisDeltaTime = 0;
    // Allocate the memory that will be used.
    thisBuffer.delayElements = new Array( this.numEntries );

    _.times( this.numEntries, function( idx ) {
      thisBuffer.delayElements[idx] = new DelayElement();
    } );

    // Head and tail pointers for FIFO-type behavior.  FIFO management is
    // done explicitly rather than using the Queue class in order to do some
    // optimizations for performance.
    thisBuffer.head = 0;
    thisBuffer.tail = 0;
    // Set the initial conditions.
    thisBuffer.clear();
  }

  DelayBuffer.prototype = {

    addValue: function( value, deltaTime ) {
      this.delayElements[this.head].setValueAndTime( value, deltaTime );
      this.head = (this.head + 1) % this.numEntries;
      if ( this.head === this.tail ) {
        // The addition of this element has overwritten what was the tail
        // of the queue, so it must be advanced.
        this.tail = (this.tail + 1) % this.numEntries;

        // Once full, it will stay full, since there is no reason to
        // remove values from the queue.
        this.filling = false;
      }

      // Update the flag that determines if all the delta time values
      // currently stored are the same.
      if ( this.previousDeltaTime === -1 ) {
        // First time through, just store the time.
        this.previousDeltaTime = deltaTime;
        this.countAtThisDeltaTime = 1;
      }
      else {
        if ( Math.abs( deltaTime - this.previousDeltaTime ) > DIFFERENCE_RESOLUTION ) {
          // The time increment has changed, so we know that there are
          // different time values in the queue.
          this.allDeltaTimesEqual = false;
          this.countAtThisDeltaTime = 1;
        }
        else {
          if ( !this.allDeltaTimesEqual ) {
            // The new value is equal to the previous value, but the
            // flag says that not all values were the same.  Does the
            // addition of this value make them all equal?
            this.countAtThisDeltaTime++;
            if ( this.countAtThisDeltaTime >= this.numEntries ) {
              // All delta times should now be equal, so set the
              // flag accordingly.
              this.allDeltaTimesEqual = true;
            }
          }
        }
        this.previousDeltaTime = deltaTime;
      }
    },

    getDelayedValue: function( delayAmount ) {
      var delayedValue = 0;
      var index = -1;
      if ( this.previousDeltaTime <= 0 ) {
        // No data has been added yet, return 0.
        delayedValue = 0;
      }
      else if ( this.allDeltaTimesEqual ) {

        // All times in the buffer are equal, so we should be able to
        // simply index to the appropriate location.  The offset must be
        // at least 1, since this buffer doesn't hold a non-delayed value.
        var offset = Math.max( Math.round( delayAmount / this.previousDeltaTime ), 1 );
        if ( (this.filling && offset > this.head) || offset > this.numEntries ) {
          // The user is asking for data that we don't have yet, so
          // give them the oldest data available.
          delayedValue = this.delayElements[this.tail].getValue();
        }
        else {
          index = this.head - offset;
          if ( index < 0 ) {
            // Handle wraparound.
            index = this.numEntries + index;
          }
          delayedValue = this.delayElements[index].getValue();
        }
      }
      else {
        // There is variation in the delta time values in the buffer, so
        // we need to go through them, add the delays, and find the
        // closest data.
        var delayReached = false;
        index = this.head > 0 ? this.head - 1 : this.numEntries - 1;
        var accumulatedDelay = 0;
        while ( !delayReached ) {
          accumulatedDelay += this.delayElements[index].getDeltaTime();
          if ( accumulatedDelay >= delayAmount ) {
            // We've found the data.  Note that it may not be the
            // exact time requested - we're assuming it is close
            // enough.  Might need to add interpolation some day if
            // more accuracy is needed.
            delayReached = true;
          }
          else if ( index === this.tail ) {
            // We've gone through all the data and there isn't enough
            // to obtain the requested delay amount, so return the
            // oldest that is available.
            delayReached = true;
          }
          else {
            // Keep going through the buffer.
            index = index - 1 > 0 ? index - 1 : this.numEntries - 1;
          }
        }
        delayedValue = this.delayElements[index].getValue();
      }

      return delayedValue;
    },
    clear: function() {
      this.head = 0;
      this.tail = 0;
      this.previousDeltaTime = -1;
      this.filling = true;
    }
  };

  return DelayBuffer;


} );//// Copyright 2002-2011, University of Colorado
//
//package edu.colorado.phet.neuron.model;
//
///**
// * This class is a delay buffer that allows information to be put into it
// * and then extracted based on the amount of time in the past that a value
// * is needed.
// *
// * NOTE: If this turns out to be useful for other applications, it should be
// * made to handle generics.
// *
// * @author John Blanco
// */
//public class DelayBuffer {


//

//

//
//  private class DelayElement{
//
//    private double value;
//    private double deltaTime;
//
//
//  }
//}
