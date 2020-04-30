// Copyright 2014-2020, University of Colorado Boulder

/**
 * The clock for this simulation, which provide support for normal operation, play and pause, stepping backwards in
 * time, and playback of previously recorded data.  Because the neuron simulation depicts action potentials far more
 * slowly than they occur in real live, this class adapts the real clock time to a slower rate when clocking the model.
 *
 * Note: The whole approach of using explicit clocks and clock adapters is a holdover from PhET's Java days, and is
 * present in this sim because the sim was ported from a Java version.  Use of this technique is not recommended for
 * new HTML5/JavaScript simulations.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import inherit from '../../../../phet-core/js/inherit.js';
import TimeControlSpeed from '../../../../scenery-phet/js/TimeControlSpeed.js';
import neuron from '../../neuron.js';

// the following constants could easily be turned into options if there was a need to reuse and thus generalize
// this class.
const TIME_ADJUSTMENT_FACTOR = 7.32E-4; // in seconds, applied to the incoming dt values to scale it up or down
const NOMINAL_TICK_TIME = ( 1 / 60 ) * TIME_ADJUSTMENT_FACTOR; // used for single stepping, based on assumed frame rate of 60 fps
const TICKS_PER_SINGLE_STEP = 4;

// Max time that the simulation model can handle in a single tick.  This was determined through testing the
// simulation and is intended to prevent odd looking graphs and incorrect behavior, see
// https://github.com/phetsims/neuron/issues/114 and https://github.com/phetsims/neuron/issues/109.
const MAX_SIM_TICK_TIME = NOMINAL_TICK_TIME * 10; // empirically determined through testing of the simulation

/**
 * Creates a NeuronClockModelAdapter.
 * @param {NeuronModel} model - model whose simulation timing is controlled by this adapter.  Note that the Adapter is
 * generic and doesn't have any dependency on the model it controls.
 * @constructor
 */
function NeuronClockModelAdapter( model ) {

  this.model = model;

  Object.call( this );

  this.playingProperty = new Property( true ); // linked to playPause button

  // @public {EnumerationProperty.<TimeControlSpeed>}
  this.timeControlSpeedProperty = new EnumerationProperty( TimeControlSpeed, TimeControlSpeed.NORMAL );

  // @public {DerivedProperty.<number>} - factor controlling simulation clock speed
  this.speedProperty = new DerivedProperty( [ this.timeControlSpeedProperty ], timeControlSpeed => {
    const speed = timeControlSpeed === TimeControlSpeed.FAST ? 2 :
                  timeControlSpeed === TimeControlSpeed.NORMAL ? 1 :
                  timeControlSpeed === TimeControlSpeed.SLOW ? 0.5 :
                  null;
    assert && assert( speed !== null, 'no speed found for TimeControlSpeed ' + timeControlSpeed );
    return speed;
  } );

  this.stepCallbacks = [];
  this.resetCallBacks = [];
  this.residualTime = 0;
}

neuron.register( 'NeuronClockModelAdapter', NeuronClockModelAdapter );

inherit( Object, NeuronClockModelAdapter, {

  // @public
  step: function( dt ) {

    // If the step is large, it probably means that the screen was hidden for a while, so just ignore it.
    if ( dt > 0.5 ) {
      return;
    }

    if ( this.playingProperty.get() ) {

      // 'tick' the simulation, adjusting for dt values that are higher than the sim model can handle
      let simTickTime = dt * TIME_ADJUSTMENT_FACTOR * this.speedProperty.get();
      let numTicks = 1;
      if ( simTickTime > MAX_SIM_TICK_TIME ) {

        // this is a larger tick than the sim model can handle, so break it into multiple ticks
        numTicks = Math.floor( simTickTime / MAX_SIM_TICK_TIME );
        this.residualTime += simTickTime % MAX_SIM_TICK_TIME;
        simTickTime = MAX_SIM_TICK_TIME;
      }
      if ( this.residualTime >= simTickTime ) {
        numTicks++;
        this.residualTime = this.residualTime - simTickTime;
      }
      for ( let i = 0; i < numTicks; i++ ) {
        this.tick( simTickTime );
      }
    }
  },

  // @public
  reset: function() {
    this.playingProperty.reset();
    this.timeControlSpeedProperty.reset();
    this.lastSimulationTime = 0.0;
    this.simulationTime = 0.0;

    //fire reset event callback
    for ( let i = 0; i < this.resetCallBacks.length; i++ ) {
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
    for ( let i = 0; i < this.stepCallbacks.length; i++ ) {
      this.stepCallbacks[ i ]( simulationTimeChange );
    }
  },

  /**
   * advance the clock by a fixed amount used when stepping manually
   * @public
   */
  stepClockWhilePaused: function() {
    const self = this;
    _.times( TICKS_PER_SINGLE_STEP, function() { self.tick( NOMINAL_TICK_TIME ); } );
  },

  /**
   * Move the clock backwards by the tickOnceTimeChange.
   * @public
   */
  stepClockBackWhilePaused: function() {
    const self = this;
    _.times( TICKS_PER_SINGLE_STEP, function() { self.tick( -NOMINAL_TICK_TIME ); } );
  }

} );

export default NeuronClockModelAdapter;