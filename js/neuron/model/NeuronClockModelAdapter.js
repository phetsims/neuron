// Copyright 2002-2015, University of Colorado Boulder

/**
 * The clock for this simulation, which provide support for normal operation, play and pause, stepping backwards in
 * time, and playback of previously recorded data.  Because the neuron simulation depicts action potentials far more
 * slowly than they occur in real live, this class adapts the real clock time to a slower rate when clocking the model.
 * <p/>
 * Note: The whole approach of using explicit clocks and clock adapters is a holdover from PhET's Java days, and is
 * present in this sim because the sim was ported from a Java version.  Use of this technique is not recommended for
 * new HTML5/JavaScript simulations.
 * <p/>
 * @author Chris Malley (cmalley@pixelzoom.com)
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  // the following constants could easily be turned into options if there was a need to reuse and thus generalize
  // this class.
  var TIME_ADJUSTMENT_FACTOR = 7.32E-4; // in seconds, applied to the incoming dt values to scale it up or down
  var NOMINAL_TICK_TIME = ( 1 / 60 ) * TIME_ADJUSTMENT_FACTOR; // used for single stepping, based on assumed frame rate of 60 fps
  var TICKS_PER_SINGLE_STEP = 4;

  // TODO: Get rid of unused params in constructor
  /**
   * Creates a NeuronClockModelAdapter.
   * @param {NeuronModel} model - model whose simulation timing is controlled by this adapter, Note - the Adapter is
   * generic and doesn't have any dependency on the model it controls
   * @constructor
   */
  function NeuronClockModelAdapter( model ) {

    var self = this;
    self.model = model;

    PropertySet.call( this, {
        playing: true, // linked to playPause button
        speed: 1 // factor controlling simulation clock speed
      }
    );

    self.stepCallbacks = [];
    self.resetCallBacks = [];
  }

  return inherit( PropertySet, NeuronClockModelAdapter, {

    // @public
    step: function( dt ) {

      // If the step is large, it probably means that the screen was hidden for a while, so just ignore it.
      if ( dt > 1 ) {
        return;
      }

      if ( this.playing ) {
        this.tick( dt * TIME_ADJUSTMENT_FACTOR * this.speed );
      }
    },

    // @public
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
     * @public
     */
    registerStepCallback: function( callback ) {
      this.stepCallbacks.push( callback );
    },

    /**
     * Registers a callback that will be notified when the clock is reset
     * @public
     */
    registerResetCallback: function( callback ) {
      this.resetCallBacks.push( callback );
    },

    /**
     * Update the clock, updating the wall time and possibly simulation time.
     * @public
     */
    tick: function( simulationTimeChange ) {
      //fire step event callback
      for ( var i = 0; i < this.stepCallbacks.length; i++ ) {
        this.stepCallbacks[ i ]( simulationTimeChange );
      }
    },

    // @private below this line

    fireChanged: function() {
      var changedCallbacks = this.changedCallbacks.slice( 0 ); // copy to prevent concurrent modification
      for ( var i = 0; i < changedCallbacks.length; i++ ) {
        changedCallbacks[ i ]( this );
      }
    },

    setSimulationTimeNoUpdate: function( simulationTime ) {
      this.lastSimulationTime = this.simulationTime;
      this.simulationTime = simulationTime;
    },

    /**
     * Advance the clock by the tickOnceTimeChange.
     */
    stepClockWhilePaused: function() {
      _.times( TICKS_PER_SINGLE_STEP, function() { this.tick( NOMINAL_TICK_TIME ); }, this );
    },

    /**
     * Move the clock backwards by the tickOnceTimeChange.
     */
    stepClockBackWhilePaused: function() {
      _.times( TICKS_PER_SINGLE_STEP, function() { this.tick( -NOMINAL_TICK_TIME ); }, this );
    }

  } );
} );