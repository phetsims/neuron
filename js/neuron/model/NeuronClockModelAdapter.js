// Copyright 2014-2015, University of Colorado Boulder

/**
 * The clock for this simulation, which provide support for normal operation, play and pause, stepping backwards in
 * time, and playback of previously recorded data.  Because the neuron simulation depicts action potentials far more
 * slowly than they occur in real live, this class adapts the real clock time to a slower rate when clocking the model.
 *
 * Note: The whole approach of using explicit clocks and clock adapters is a holdover from PhET's Java days, and is
 * present in this sim because the sim was ported from a Java version.  Use of this technique is not recommended for
 * new HTML5/JavaScript simulations.
 *
 * @author Chris Malley (cmalley@pixelzoom.com)
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var PropertySet = require( 'AXON/PropertySet' );

  // the following constants could easily be turned into options if there was a need to reuse and thus generalize
  // this class.
  var TIME_ADJUSTMENT_FACTOR = 7.32E-4; // in seconds, applied to the incoming dt values to scale it up or down
  var NOMINAL_TICK_TIME = ( 1 / 60 ) * TIME_ADJUSTMENT_FACTOR; // used for single stepping, based on assumed frame rate of 60 fps
  var TICKS_PER_SINGLE_STEP = 4;

  // Max time that the simulation model can handle in a single tick.  This was determined through testing the
  // simulation and is intended to prevent odd looking graphs and incorrect behavior, see
  // https://github.com/phetsims/neuron/issues/114 and https://github.com/phetsims/neuron/issues/109.
  var MAX_SIM_TICK_TIME = NOMINAL_TICK_TIME * 10; // empirically determined through testing of the simulation

  /**
   * Creates a NeuronClockModelAdapter.
   * @param {NeuronModel} model - model whose simulation timing is controlled by this adapter.  Note that the Adapter is
   * generic and doesn't have any dependency on the model it controls.
   * @constructor
   */
  function NeuronClockModelAdapter( model ) {

    var self = this;
    self.model = model;

    PropertySet.call( this, {
        // @public
        playing: true, // linked to playPause button
        speed: 1 // factor controlling simulation clock speed
      }
    );

    self.stepCallbacks = [];
    self.resetCallBacks = [];
    self.residualTime = 0;
  }

  neuron.register( 'NeuronClockModelAdapter', NeuronClockModelAdapter );

  return inherit( PropertySet, NeuronClockModelAdapter, {

    // @public
    step: function( dt ) {

      // If the step is large, it probably means that the screen was hidden for a while, so just ignore it.
      if ( dt > 0.5 ) {
        return;
      }

      if ( this.playing ) {

        // 'tick' the simulation, adjusting for dt values that are higher than the sim model can handle
        var simTickTime = dt * TIME_ADJUSTMENT_FACTOR * this.speed;
        var numTicks = 1;
        if ( simTickTime > MAX_SIM_TICK_TIME ){

          // this is a larger tick than the sim model can handle, so break it into multiple ticks
          numTicks = Math.floor( simTickTime / MAX_SIM_TICK_TIME );
          this.residualTime += simTickTime % MAX_SIM_TICK_TIME;
          simTickTime = MAX_SIM_TICK_TIME;
        }
        if ( this.residualTime >= simTickTime ){
          numTicks++;
          this.residualTime = this.residualTime - simTickTime;
        }
        for ( var i = 0; i < numTicks; i++ ){
          this.tick( simTickTime );
        }
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
     * @param  {function} - callback that has a {dt} parameter
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
     * Perform one 'tick' of the clock, which fires all callbacks with the provided simulation time
     * @private
     */
    tick: function( simulationTimeChange ) {
      // fire step event callback
      for ( var i = 0; i < this.stepCallbacks.length; i++ ) {
        this.stepCallbacks[ i ]( simulationTimeChange );
      }
    },

    /**
     * advance the clock by a fixed amount used when stepping manually
     * @public
     */
    stepClockWhilePaused: function() {
      _.times( TICKS_PER_SINGLE_STEP, function() { this.tick( NOMINAL_TICK_TIME ); }, this );
    },

    /**
     * Move the clock backwards by the tickOnceTimeChange.
     * @public
     */
    stepClockBackWhilePaused: function() {
      _.times( TICKS_PER_SINGLE_STEP, function() { this.tick( -NOMINAL_TICK_TIME ); }, this );
    }

  } );
} );