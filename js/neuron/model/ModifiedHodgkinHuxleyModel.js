// Copyright 2014-2020, University of Colorado Boulder
/**
 * This class is an implementation of the Hodgkin-Huxley model that started from an example taken from the web (see
 * Unfuddle #2121 for more info on this) but that was modified significantly to fit the needs of this simulation.  The
 * main change is that the way that the conductance values are calculated is different, and much simpler.
 * <p/>
 * This was used with permission from the original author of the example.
 *
 * @author Anthony Fodor
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import DelayBuffer from './DelayBuffer.js';

/**
 * Amount of time used for each iteration of the model.  This is fixed, and when the model is stepped it breaks
 * whether time step is presented into units of this duration.  This is needed because below a certain time value the
 * model doesn't work - it becomes unstable.
 */
const INTERNAL_TIME_STEP = 0.005; // In milliseconds, not seconds.
const MAX_DELAY = 0.001; // In seconds of simulation time.
class ModifiedHodgkinHuxleyModel {

  constructor() {

    this.perNaChannels = 100; // @private
    this.perKChannels = 100; // @private
    this.elapsedTime = 0; // @private
    this.timeSinceActionPotential = Number.POSITIVE_INFINITY; // @private
    this.m3hDelayBuffer = new DelayBuffer( MAX_DELAY, NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT ); // @private
    this.n4DelayBuffer = new DelayBuffer( MAX_DELAY, NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT ); // @private

    this.resting_v = 65;// @private, final doesn't change

    // deltas of voltage-dependent gating parameters
    this.dn = 0; // @private
    this.dm = 0; // @private
    this.dh = 0; // @private

    this.timeRemainder = 0; // @private

    // Ek-Er, Ena - Er, Eleak - Er
    this.vk = 0; // @private
    this.vna = 0; // @private
    this.vl = 0; // @private

    this.n4 = 0; // @private
    this.m3h = 0; // @private
    this.na_current = 0; // @private
    this.k_current = 0; // @private
    this.l_current = 0; // @private

    this.vClampOn = false; // @private

    this.vClampValue = this.convertV( 0 ); // @private

    this.reset();// reset and initialize
  }

  // @public
  reset() {
    this.n4DelayBuffer.clear();
    this.m3hDelayBuffer.clear();

    this.cm = 1;// membrane capacitance
    this.v = 0;// membrane voltage
    this.vna = -115;
    this.vk = 12;
    this.vl = 0; // NOTE: Modified from -10.613 by jblanco on 3/12/2010 in order to make potential stay steady
    // at the desired resting potential.

    //constant leak permeabilities
    this.gna = this.perNaChannels * 120 / 100;
    this.gk = this.perKChannels * 36 / 100;
    this.gl = 0.3;

    // rate constants
    this.bh = 1 / ( Math.exp( ( this.v + 30 ) / 10 ) + 1 );
    this.ah = 0.07 * Math.exp( this.v / 20 );
    this.bm = 4 * Math.exp( this.v / 18 );
    this.am = 0.1 * ( this.v + 25 ) / ( Math.exp( ( this.v + 25 ) / 10 ) - 1 );
    this.bn = 0.125 * Math.exp( this.v / 80 );
    this.an = 0.01 * ( this.v + 10 ) / ( Math.exp( ( this.v + 10 ) / 10 ) - 1 );

    // voltage-dependent gating parameters - start these parameters in steady state
    this.n = this.an / ( this.an + this.bn );
    this.m = this.am / ( this.am + this.bm );
    this.h = this.ah / ( this.ah + this.bh );

    // Time values.
    this.timeSinceActionPotential = Number.POSITIVE_INFINITY;
  }

  // @public
  stepInTime( dt ) {
    let modelIterationsToRun = Math.floor( ( dt * 1000 ) / INTERNAL_TIME_STEP );
    this.timeRemainder += ( dt * 1000 ) % INTERNAL_TIME_STEP;
    if ( this.timeRemainder >= INTERNAL_TIME_STEP ) {
      // Add an additional iteration and reset the time remainder accumulation.  This is kind of like a leap year.
      modelIterationsToRun += 1;
      this.timeRemainder -= INTERNAL_TIME_STEP;
    }

    // Step the model the appropriate number of times.
    for ( let i = 0; i < modelIterationsToRun; i++ ) {

      this.dh = ( this.ah * ( 1 - this.h ) - this.bh * this.h ) * INTERNAL_TIME_STEP;
      this.dm = ( this.am * ( 1 - this.m ) - this.bm * this.m ) * INTERNAL_TIME_STEP;
      this.dn = ( this.an * ( 1 - this.n ) - this.bn * this.n ) * INTERNAL_TIME_STEP;

      this.bh = 1 / ( Math.exp( ( this.v + 30 ) / 10 ) + 1 );
      this.ah = 0.07 * Math.exp( this.v / 20 );
      this.dh = ( this.ah * ( 1 - this.h ) - this.bh * this.h ) * INTERNAL_TIME_STEP;
      this.bm = 4 * Math.exp( this.v / 18 );
      this.am = 0.1 * ( this.v + 25 ) / ( Math.exp( ( this.v + 25 ) / 10 ) - 1 );
      this.bn = 0.125 * Math.exp( this.v / 80 );
      this.an = 0.01 * ( this.v + 10 ) / ( Math.exp( ( this.v + 10 ) / 10 ) - 1 );
      this.dm = ( this.am * ( 1 - this.m ) - this.bm * this.m ) * INTERNAL_TIME_STEP;
      this.dn = ( this.an * ( 1 - this.n ) - this.bn * this.n ) * INTERNAL_TIME_STEP;

      // Here is where the main change is that makes this a "modified" version of Hodgkin-Huxley.  Note that the
      // multiplier values were determined empirically from running the more standard HH model.

      // Below, commented out, is the code that a real HH model would use.
      // n4 = n*n*n*n;
      // m3h = m*m*m*h;

      // New values tried by Noah P on 3/10/10
      this.n4 = 0.55 * Math.exp( -1 / 0.55 * Math.pow( this.timeSinceActionPotential - 1.75, 2 ) );
      this.m3h = 0.3 * Math.exp( -1 / 0.2 * Math.pow( this.timeSinceActionPotential - 1.0, 2 ) );

      // If the n4 and m3h values are below a certain level, go ahead and set them to zero.  This helps other parts of
      // the simulation determine when an action potential has ended.  The thresholds were empirically determined.
      if ( this.n4 < 1E-5 ) {
        this.n4 = 0;
      }
      if ( this.m3h < 1E-5 ) {
        this.m3h = 0;
      }

      // Calculate the currents based on the conductance values.
      this.na_current = this.gna * this.m3h * ( this.v - this.vna );
      this.k_current = this.gk * this.n4 * ( this.v - this.vk );
      this.l_current = this.gl * ( this.v - this.vl );

      this.dv = -1 * INTERNAL_TIME_STEP * ( this.k_current + this.na_current + this.l_current ) / this.cm;

      this.v += this.dv;
      this.h += this.dh;
      this.m += this.dm;
      this.n += this.dn;

      this.elapsedTime += INTERNAL_TIME_STEP;
      if ( this.timeSinceActionPotential < Number.POSITIVE_INFINITY ) {
        this.timeSinceActionPotential += INTERNAL_TIME_STEP;
      }
    }

    this.m3hDelayBuffer.addValue( this.m3h, dt );
    this.n4DelayBuffer.addValue( this.n4, dt );

    if ( this.vClampOn ) {
      this.v = this.vClampValue;
    }
  }

  // @public
  get_n4() {
    return this.n4;
  }

  /**
   * Get a delayed version of the n^4 amount, which is the variable factor that governs the potassium channel
   * conductance.
   *
   * @param {number} delayAmount - time delay in seconds
   * @returns {number}
   * @public
   */
  get_delayed_n4( delayAmount ) {
    if ( delayAmount <= 0 ) {
      return this.n4;
    }
    else {
      return this.n4DelayBuffer.getDelayedValue( delayAmount );
    }
  }

  // @public
  get_m3h() {
    return this.m3h;
  }

  /**
   * Get a delayed version of the m3h amount, which is the variable factor
   * that governs the sodium channel conductance.
   *
   * @param {number} delayAmount - time delay in seconds
   * @returns {number}
   * @public
   */
  get_delayed_m3h( delayAmount ) {
    let delayedM3h = 0;

    if ( delayAmount <= 0 ) {
      delayedM3h = this.m3h;
    }
    else {
      delayedM3h = this.m3hDelayBuffer.getDelayedValue( delayAmount );
    }

    return delayedM3h;
  }

  // @public
  getEna() {
    return ( -1 * ( this.vna + this.resting_v ) );
  }

  // @public
  getEk() {
    return ( -1 * ( this.vk + this.resting_v ) );
  }

  // NOTE: A number of unused setters were removed from this portion of the code because they were unused and I
  // (@jbphet) felt that if they weren't available via setters I could more safely assume that the didn't need to
  // be maintained as part of the object's serializable state.  See https://github.com/phetsims/neuron/issues/92
  // for more information.

  // @public
  get_na_current() {
    return -1 * this.na_current;
  }

  // @public
  get_k_current() {
    return -1 * this.k_current;
  }

  // @public
  get_l_current() {
    return -1 * this.l_current;
  }

  // @public
  getPerNaChannels() {
    return this.perNaChannels;
  }

  // @public
  getPerKChannels() {
    return this.perKChannels;
  }

  // @public
  get_gk() {
    return this.gk;
  }

  // @public
  get_gna() {
    return this.gna;
  }

  // @public
  get_gl() {
    return this.gl;
  }

  // remember that H&H voltages are -1 * present convention
  // should eventually calculate this instead of setting it
  // convert between internal use of V and the user's expectations
  // the V will be membrane voltage using present day conventions
  // see p. 505 of Hodgkin & Huxley, J Physiol. 1952, 117:500-544
  // @public
  setV( inV ) {
    this.v = -1 * inV - this.resting_v;
  }

  // @public
  getV() {
    return -1 * ( this.v + this.resting_v );
  }

  // @public
  getRestingV() {
    return -1 * this.resting_v;
  }

  // @public
  getCm() {
    return this.cm;
  }

  // @public
  getElapsedTime() {
    return this.elapsedTime;
  }

  // @public
  resetElapsedTime() {
    this.elapsedTime = 0.0;
  }

  // @public
  getN() {
    return this.n;
  }

  // @public
  getM() {
    return this.m;
  }

  // @public
  getH() {
    return this.h;
  }

  /**
   * Converts a voltage from the modern convention to the convention used by the program
   * @private
   */
  convertV( voltage ) {
    return ( -1 * voltage - this.resting_v );
  }

  // @public
  getVClampOn() {
    return this.vClampOn;
  }

  // @public
  get_vClampValue() {
    return ( -1 * ( this.vClampValue + this.resting_v ) );
  }

  // @public
  getMembraneVoltage() {
    // getV() converts the model's v to present day convention
    return this.getV() / 1000;
  }

  /**
   * Get the state of the model.  This is generally used in support of record and playback.
   * @public
   */
  getState() {
    return {
      ah: this.ah,
      h: this.h,
      bh: this.bh,
      am: this.am,
      m: this.m,
      bm: this.bm,
      an: this.an,
      n: this.n,
      bn: this.bn,
      v: this.v,
      timeSinceActionPotential: this.timeSinceActionPotential,
      m3hDelayBuffer: this.m3hDelayBuffer.getCopy(),
      n4DelayBuffer: this.n4DelayBuffer.getCopy()
    };
  }

  /**
   * Set the state of the model.  This is generally used in support of record and playback.
   * @public
   */
  setState( state ) {
    this.ah = state.ah;
    this.h = state.h;
    this.bh = state.bh;
    this.am = state.am;
    this.m = state.m;
    this.bm = state.bm;
    this.an = state.an;
    this.n = state.n;
    this.bn = state.bn;
    this.v = state.v;
    this.timeSinceActionPotential = state.timeSinceActionPotential;

    // For performance reasons, use the actual delay buffer in the state, which should be safe since the states
    // should not have been altered anywhere.
    this.m3hDelayBuffer = state.m3hDelayBuffer;
    this.n4DelayBuffer = state.n4DelayBuffer;
  }

  /**
   * Stimulate the neuron in a way that simulates a depolarization signal
   * coming to this neuron.  If the neuron is in the correct state, this
   * will trigger an action potential.
   * @public
   */
  stimulate() {
    // Add a fixed amount to the voltage across the membrane.
    this.setV( this.getV() + 15 );
    this.timeSinceActionPotential = 0;
  }
}

neuron.register( 'ModifiedHodgkinHuxleyModel', ModifiedHodgkinHuxleyModel );

export default ModifiedHodgkinHuxleyModel;