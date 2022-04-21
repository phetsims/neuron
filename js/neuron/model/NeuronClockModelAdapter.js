// Copyright 2014-2022, University of Colorado Boulder

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
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
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

class NeuronClockModelAdapter {

  /**
   * Creates a NeuronClockModelAdapter.
   * @param {NeuronModel} model - model whose simulation timing is controlled by this adapter.  Note that the Adapter is
   * generic and doesn't have any dependency on the model it controls.
   */
  constructor( model ) {

    this.model = model;

    this.playingProperty = new Property( true ); // linked to playPause button

    // @public {EnumerationDeprecatedProperty.<TimeSpeed>}
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL );

    // @public {DerivedProperty.<number>} - factor controlling simulation clock speed
    this.speedProperty = new DerivedProperty( [ this.timeSpeedProperty ], timeSpeed => {
      const speed = timeSpeed === TimeSpeed.FAST ? 2 :
                    timeSpeed === TimeSpeed.NORMAL ? 1 :
                    timeSpeed === TimeSpeed.SLOW ? 0.5 :
                    null;
      assert && assert( speed !== null, `no speed found for TimeSpeed ${timeSpeed}` );
      return speed;
    } );

    this.stepCallbacks = [];
    this.resetCallBacks = [];
    this.residualTime = 0;
  }

  // @public
  step( dt ) {

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
  }

  // @public
  reset() {
    this.playingProperty.reset();
    this.timeSpeedProperty.reset();
    this.lastSimulationTime = 0.0;
    this.simulationTime = 0.0;

    //fire reset event callback
    for ( let i = 0; i < this.resetCallBacks.length; i++ ) {
      this.resetCallBacks[ i ]();
    }
    this.model.reset();
  }

  /**
   * Registers a callback that will be notified when the step simulation occurs
   * Neuron Clock uses specialized real time step simulation
   * @param  {function} - callback that has a {dt} parameter
   * @public
   */
  registerStepCallback( callback ) {
    this.stepCallbacks.push( callback );
  }

  /**
   * Registers a callback that will be notified when the clock is reset
   * @public
   */
  registerResetCallback( callback ) {
    this.resetCallBacks.push( callback );
  }

  /**
   * Perform one 'tick' of the clock, which fires all callbacks with the provided simulation time
   * @private
   */
  tick( simulationTimeChange ) {
    // fire step event callback
    for ( let i = 0; i < this.stepCallbacks.length; i++ ) {
      this.stepCallbacks[ i ]( simulationTimeChange );
    }
  }

  /**
   * advance the clock by a fixed amount used when stepping manually
   * @public
   */
  stepClockWhilePaused() {
    _.times( TICKS_PER_SINGLE_STEP, () => { this.tick( NOMINAL_TICK_TIME ); } );
  }

  /**
   * Move the clock backwards by the tickOnceTimeChange.
   * @public
   */
  stepClockBackWhilePaused() {
    _.times( TICKS_PER_SINGLE_STEP, () => { this.tick( -NOMINAL_TICK_TIME ); } );
  }
}

neuron.register( 'NeuronClockModelAdapter', NeuronClockModelAdapter );

export default NeuronClockModelAdapter;