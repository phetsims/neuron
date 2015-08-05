// Copyright 2002-2014, University of Colorado Boulder

/**
 * The clock for this simulation. The simulation time change (dt) on each
 * clock tick is constant, regardless of when (in wall time) the ticks
 * actually happen.
 * <p/>
 * Note: The whole approach of using explicit clocks and clock adapters is
 * a holdover from PhET's Java days, and is present in this sim because the
 * sim was ported from a Java version.  Use of this technique is not
 * recommended for new HTML5/JavaScript simulations.
 * <p/>
 * @author Chris Malley (cmalley@pixelzoom.com)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var EventTimer = require( 'PHET_CORE/EventTimer' );

  // Constant Clock internally used
  var DEFAULT_FRAMES_PER_SECOND = 30.0;

  /**
   * @constructor
   * Creates a NeuronClock based on a number of requested frames per second.
   * This uses the same value for elapsed simulation time, and should be used for simulations
   * that run in real time (e.g. one sim time second equals one wall clock second)
   * @param {NeuronModel} model (whose simulation timing is controlled by this adapter, Note:- The Adapter is generic and doesn't have any dependency on the model it controls)
   * @param {number} framesPerSecond the number of frames per second
   * @param {number} dt constant simulation time change between ticks

   */
  function NeuronClockModelAdapter( model, framesPerSecond, dt ) {

    var thisModel = this;
    thisModel.model = model;
    //delay desired wall time change between ticks
    thisModel.delay = 1000 / framesPerSecond;
    thisModel.simulationTimeChange = dt;
    thisModel.lastSimulationTime = 0.0;
    thisModel.simulationTime = 0.0;

    PropertySet.call( this, {
        playing: true, // linked to playPause button
        speed: 1 // factor controlling simulation clock speed)
      }
    );

    thisModel.stepCallbacks = [];
    thisModel.resetCallBacks = [];
    // The clock for this simulation.
    // The simulation time change (dt) on each clock tick is constant,
    // regardless of when (in wall time) the ticks actually happen.
    this.eventTimer = new EventTimer( new EventTimer.ConstantEventModel( DEFAULT_FRAMES_PER_SECOND ), function( timeElapsed ) {
      thisModel.constantStep( timeElapsed );
    } );
  }

  return inherit( PropertySet, NeuronClockModelAdapter, {

    step: function( dt ) {
      // step one frame, assuming 60fps
      if ( this.playing ) {
        this.eventTimer.step( this.speed / 60 );
      }
    },

    constantStep: function( timeElapsed ) {
      if ( this.playing ) {
        this.tick( this.simulationTimeChange );
      }
    },

    reset: function() {
      this.lastSimulationTime = 0.0;
      this.simulationTime = 0.0;
      this.speed = 1;
      PropertySet.prototype.reset.call( this );

      //fire reset event callback
      for ( var i = 0; i < this.resetCallBacks.length; i++ ) {
        this.resetCallBacks[ i ]();
      }
      this.model.reset();
    },

    /**
     * Registers a callback that will be notified when the step simulation occurs
     * Neuron Clock uses specialized real time step simulation
     * @param  callback has a {dt} parameter
     */
    registerStepCallback: function( callback ) {
      this.stepCallbacks.push( callback );
    },

    /**
     * Registers a callback that will be notified when the clock is reset
     */
    registerResetCallback: function( callback ) {
      this.resetCallBacks.push( callback );
    },

    /**
     * Update the clock, updating the wall time and possibly simulation time.
     */
    tick: function( simulationTimeChange ) {
      this.setSimulationTimeNoUpdate( this.simulationTime + simulationTimeChange );
      //fire step event callback
      for ( var i = 0; i < this.stepCallbacks.length; i++ ) {
        this.stepCallbacks[ i ]( this.getSimulationTimeChange() );
      }


    },

    // @private below this line

    fireChanged: function() {
      var changedCallbacks = this.changedCallbacks.slice( 0 ); // copy to prevent concurrent modification
      for ( var i = 0; i < changedCallbacks.length; i++ ) {
        changedCallbacks[ i ]( this );
      }
    },
    /**
     * Gets the constant simulation time change (dt) between ticks.
     * @return dt
     */
    getDt: function() {
      this.getSimulationTimeChange();//This method uses Constant Time Strategy (The strategy interface itself is not exposed as in Java) Ashraf
    },

    getSimulationTimeChange: function( dt ) {
      return this.simulationTime - this.lastSimulationTime;
    },

    /**
     * Determine how much simulation time should pass if the clock is paused, and the user presses 'frame advance'
     * @return the simulation time.
     */
    getSimulationTimeChangeForPausedClock: function() {
      return this.simulationTimeChange;
    },

    setSimulationTimeNoUpdate: function( simulationTime ) {
      this.lastSimulationTime = this.simulationTime;
      this.simulationTime = simulationTime;
    },

    /**
     * Advance the clock by the tickOnceTimeChange.
     */
    stepClockWhilePaused: function() {
      this.tick( this.getSimulationTimeChangeForPausedClock() );
    },

    /**
     * Move the clock backwards by the tickOnceTimeChange.
     */
    stepClockBackWhilePaused: function() {
      this.tick( -this.getSimulationTimeChangeForPausedClock() );
    }
  } );
} );