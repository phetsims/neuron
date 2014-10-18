//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The clock for this simulation.
 * The simulation time change (dt) on each clock tick is constant,
 * regardless of when (in wall time) the ticks actually happen.
 *
 *
 * @author Chris Malley (cmalley@pixelzoom.com)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var EventTimer = require( 'PHET_CORE/EventTimer' );

  // Constant Clock internally used
  var DEFAULT_FRAMES_PER_SECOND = 30.0;


  /**
   * Constructor.
   * Creates a NeuronClock based on a number of requested frames per second.
   * This uses the same value for elapsed simulation time, and should be used for simulations
   * that run in real time (e.g. one sim time second equals one wall clock second)
   * @param model (whose simulation timing is controlled by this adapter)
   * @param framesPerSecond the number of frames per second
   * @param dt constant simulation time change between ticks
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
        paused: false,//linked to playPause button
        simulationTimeReset: false
      }
    );

    //private
    thisModel.stepCallbacks = [];

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
      this.eventTimer.step( 1 / 60 );
    },

    constantStep: function( timeElapsed ) {
      if ( !this.isPaused() ) {
        this.tick( this.simulationTimeChange );
      }
    },
    reset: function() {
      this.lastSimulationTime = 0.0;
      this.simulationTime = 0.0;
      PropertySet.prototype.reset.call( this );
    },
    /**
     * Registers a callback that will be notified when the step simulation occurs
     * Neuron Clock uses specialized real time step simulation
     * @param  callback has a {dt} parameter
     */
    registerStepCallback: function( callback ) {
      this.stepCallbacks.push( callback );
    },

    isPaused: function() {
      return this.paused;
    },
    /**
     * Update the clock, updating the wall time and possibly simulation time.
     */
    tick: function( simulationTimeChange ) {
      this.setSimulationTimeNoUpdate( this.simulationTime + simulationTimeChange );
      //fire step event callback
      for ( var i = 0; i < this.stepCallbacks.length; i++ ) {
        this.stepCallbacks[i]( this.getSimulationTimeChange() );
      }


    },
// @private
    fireChanged: function() {
      var changedCallbacks = this.changedCallbacks.slice( 0 ); // copy to prevent concurrent modification
      for ( var i = 0; i < changedCallbacks.length; i++ ) {
        changedCallbacks[i]( this );
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

} )
;