// Copyright 2015-2019, University of Colorado Boulder

/**
 * Sim-specific code for profiling, created for testing optimizations.  This profiler can be triggered via a method call
 * and will then gather profiling data for the specified amount of time, and then log the collected information to the
 * console.  On iOS devices, it displays the information in an "alert" window.
 */

import Utils from '../../../../dot/js/Utils.js';
import inherit from '../../../../phet-core/js/inherit.js';
import platform from '../../../../phet-core/js/platform.js';
import neuron from '../../neuron.js';

/**
 * @param {Sim} sim - reference to the simulation being profiled
 * @param {number} setting - profiling to be done, values are:
 *    1=profile from when the traveling action potential reaches cross section until all or most of the dynamically
 *      created particles are gone
 *    2=profile from neuron stimulated until traveling action potential reaches the cross section
 *    3=profile from neuron stimulated until all or most of the dynamically created particles have disappeared
 * @constructor
 */
function NeuronProfiler( sim, setting ) {

  assert && assert( setting >= 1 && setting <= 3, 'invalid profiler setting, value = ' + setting );

  const self = this;
  this.setting = setting; // @public, read only

  this.frameCount = 0;
  this.dataCollectionInProgress = false; // @private
  this.dataCollectionStartTime = Number.NEGATIVE_INFINITY; // @private, in milliseconds
  this.dataCollectionDuration = Number.POSITIVE_INFINITY; // @private, in milliseconds
  this.frameStartedTimes = []; // @private, in milliseconds
  this.frameEndedTimes = []; // @private, in milliseconds
  this.frameProcessingTimes = []; // @private, time between frame started and frame completed events in milliseconds

  sim.frameStartedEmitter.addListener( function() {
    if ( self.dataCollectionInProgress ) {
      self.frameStartedTimes[ self.frameCount ] = new Date().getTime();
    }
  } );

  sim.frameEndedEmitter.addListener( function() {
    if ( self.dataCollectionInProgress && self.frameStartedTimes.length !== 0 ) {
      const currentTime = new Date().getTime();
      self.frameEndedTimes[ self.frameCount ] = currentTime;
      self.frameProcessingTimes[ self.frameCount ] = currentTime - self.frameStartedTimes[ self.frameCount ];
      self.frameCount++;

      // check if the data collection is complete
      if ( new Date().getTime() > self.dataCollectionStartTime + self.dataCollectionDuration ) {

        self.dataCollectionInProgress = false; // clear the collection flag

        // process the collected data
        const testDurationInSeconds = self.dataCollectionDuration / 1000;
        let maxFrameProcessingTime = 0;
        let totalFrameProcessingTime = 0;
        for ( let i = 0; i < self.frameCount; i++ ) {
          totalFrameProcessingTime += self.frameProcessingTimes[ i ];
          if ( self.frameProcessingTimes[ i ] > maxFrameProcessingTime ) {
            maxFrameProcessingTime = self.frameProcessingTimes[ i ];
          }
        }
        const averageFrameProcessingTime = totalFrameProcessingTime / self.frameCount;

        // compose the message that will present the data
        const message =
          'average FPS over previous ' + testDurationInSeconds + ' seconds = ' +
          Utils.toFixed( self.frameCount / ( self.dataCollectionDuration / 1000 ), 2 ) + '\n' +
          'average frame processing time = ' + Utils.toFixed( averageFrameProcessingTime, 2 ) + ' ms\n' +
          'max frame processing time = ' + Utils.toFixed( maxFrameProcessingTime, 2 ) + ' ms\n';

        // display the message
        if ( platform.mobileSafari ) {
          // pop up the message in an alert dialog, since the console is not available
          alert( message );
        }
        else {
          console.log( '------------ Profiling Result ------------------' );
          console.log( message );
        }
      }
    }
  } );
}

neuron.register( 'NeuronProfiler', NeuronProfiler );

export default inherit( Object, NeuronProfiler, {

  /**
   * Initiate the collection of data for the specified duration.  Once the specified time has passed, the results
   * will be displayed in a popup dialog.
   * @param {number} duration - in milliseconds
   * @public
   */
  startDataAnalysis: function( duration ) {
    if ( this.dataCollectionInProgress ) {
      throw new Error( 'Attempt to start data collection when already in progress.' );
    }
    this.frameCount = 0;
    this.dataCollectionInProgress = true; // @private
    this.dataCollectionStartTime = new Date().getTime(); // @private, in milliseconds
    this.dataCollectionDuration = duration; // @private, in milliseconds
    this.frameStartedTimes.length = 0;
    this.frameEndedTimes.length = 0;
    this.frameProcessingTimes.length = 0;
  }

} );