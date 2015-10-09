// Copyright 2002-2015, University of Colorado Boulder
/**
 * This class is a delay buffer that allows information to be put into it and then extracted based on the amount of
 * time in the past that a value is needed.
 *
 * NOTE: This seems like it might be useful in other simulations.  If this turns out to be true, it will need some
 * work to generalize.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var DelayElement = require( 'NEURON/neuron/model/DelayElement' );
  var Util = require( 'DOT/Util' );

  // This value is used to tell if two numbers are different.  It was needed due to some floating point resolution
  // problems that were occurring.
  var DIFFERENCE_RESOLUTION = 1E-15;

  /**
   * @param {number} maxDelay // In seconds of simulation time.
   * @param {number} minTimeStep // sim the clock rate, often several orders of magnitude slower than real time.
   * @constructor
   */
  function DelayBuffer( maxDelay, minTimeStep ) {
    var thisBuffer = this;
    thisBuffer.numEntries = Math.ceil( maxDelay / minTimeStep ); // @private
    thisBuffer.filling = false; // @private
    thisBuffer.allDeltaTimesEqual = true; // @private
    thisBuffer.previousDeltaTime = -1; // @private
    thisBuffer.countAtThisDeltaTime = 0; // @private
    // Allocate the memory that will be used.
    thisBuffer.delayElements = new Array( this.numEntries ); // @private

    _.times( this.numEntries, function( idx ) {
      thisBuffer.delayElements[ idx ] = new DelayElement();
    } );

    // Head and tail pointers for FIFO-type behavior.
    thisBuffer.head = 0; // @private
    thisBuffer.tail = 0; // @private
    // Set the initial conditions.
    thisBuffer.clear();
  }

  return inherit( Object, DelayBuffer, {

    // @public
    addValue: function( value, deltaTime ) {
      this.delayElements[ this.head ].setValueAndTime( value, deltaTime );
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

    // @public
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
        var offset = Math.max( Util.roundSymmetric( delayAmount / this.previousDeltaTime ), 1 );
        if ( (this.filling && offset > this.head) || offset > this.numEntries ) {
          // The caller is asking for data that we don't have yet, so
          // give them the oldest data available.
          delayedValue = this.delayElements[ this.tail ].value;
        }
        else {
          index = this.head - offset;
          if ( index < 0 ) {
            // Handle wraparound.
            index = this.numEntries + index;
          }
          delayedValue = this.delayElements[ index ].value;
        }
      }
      else {
        // There is variation in the delta time values in the buffer, so
        // we need to go through them, add up the delays, and find the
        // closest data.
        var delayReached = false;
        index = this.head > 0 ? this.head - 1 : this.numEntries - 1;
        var accumulatedDelay = 0;
        while ( !delayReached ) {
          accumulatedDelay += this.delayElements[ index ].deltaTime;
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
        delayedValue = this.delayElements[ index ].value;
      }

      return delayedValue;
    },

    // @public
    clear: function() {
      this.head = 0;
      this.tail = 0;
      this.previousDeltaTime = -1;
      this.filling = true;
    }
  } );
} );