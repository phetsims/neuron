// Copyright 2015-2016, University of Colorado Boulder

/**
 * Sim-specific code for profiling, created for testing optimizations.
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var platform = require( 'PHET_CORE/platform' );
  var Util = require( 'DOT/Util' );

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

    var self = this;
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
        var currentTime = new Date().getTime();
        self.frameEndedTimes[ self.frameCount ] = currentTime;
        self.frameProcessingTimes[ self.frameCount ] = currentTime - self.frameStartedTimes[ self.frameCount ];
        self.frameCount++;

        // check if the data collection is complete
        if ( new Date().getTime() > self.dataCollectionStartTime + self.dataCollectionDuration ) {

          self.dataCollectionInProgress = false; // clear the collection flag

          // process the collected data
          var testDurationInSeconds = self.dataCollectionDuration / 1000;
          var maxFrameProcessingTime = 0;
          var totalFrameProcessingTime = 0;
          for ( var i = 0; i < self.frameCount; i++ ) {
            totalFrameProcessingTime += self.frameProcessingTimes[ i ];
            if ( self.frameProcessingTimes[ i ] > maxFrameProcessingTime ) {
              maxFrameProcessingTime = self.frameProcessingTimes[ i ];
            }
          }
          var averageFrameProcessingTime = totalFrameProcessingTime / self.frameCount;

          // compose the message that will present the data
          var message =
            'average FPS over previous ' + testDurationInSeconds + ' seconds = ' +
            Util.toFixed( self.frameCount / ( self.dataCollectionDuration / 1000 ), 2 ) + '\n' +
            'average frame processing time = ' + Util.toFixed( averageFrameProcessingTime, 2 ) + ' ms\n' +
            'max frame processing time = ' + Util.toFixed( maxFrameProcessingTime, 2 ) + ' ms\n';

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

  return inherit( Object, NeuronProfiler, {

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
} );