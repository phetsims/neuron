// Copyright 2002-2011, University of Colorado
/**
 * This class is an implementation of the Hodgkin-Huxley model that started
 * from an example taken from the web (see Unfuddle #2121 for more info on
 * this) but that was modified significantly to fit the needs of this
 * simulation.  The main change is that the way that the conductance values
 * are calculated is different, and much simpler.
 *
 * @author Anthony Fodor
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var BaseHodgkinHuxleyModel = require( 'NEURON/neuron/model/BaseHodgkinHuxleyModel' );
  var DelayBuffer = require( 'NEURON/neuron/model/DelayBuffer' );
  var NeuronSharedConstants = require( 'NEURON/neuron/common/NeuronSharedConstants' );


  /*
   Amount of time used for each iteration of the model.  This is fixed,
   and when the model is stepped it breaks whether time step is presented
   into units of this duration.  This is needed because below a certain
   time value the model doesn't work - it becomes unstable.*/

  var INTERNAL_TIME_STEP = 0.005; // In milliseconds, not seconds.

  var MAX_DELAY = 0.001; // In seconds of simulation time.

  function ModifiedHodgkinHuxleyModel() {

    var thisModel = this;
    thisModel.perNaChannels = 100;
    thisModel.perKChannels = 100;
    thisModel.elapsedTime = 0;
    thisModel.timeSinceActionPotential = Number.POSITIVE_INFINITY;
    thisModel.m3hDelayBuffer = new DelayBuffer( MAX_DELAY, NeuronSharedConstants.MIN_ACTION_POTENTIAL_CLOCK_DT );
    thisModel.n4DelayBuffer = new DelayBuffer( MAX_DELAY, NeuronSharedConstants.MIN_ACTION_POTENTIAL_CLOCK_DT );

    thisModel.resting_v = 65;// final doesn't change

    // deltas of voltage-dependent gating paramaters
    thisModel.dn = 0;
    thisModel.dm = 0;
    thisModel.dh = 0;

    thisModel.timeRemainder = 0;

    // Ek-Er, Ena - Er, Eleak - Er
    thisModel.vk = 0;
    thisModel.vna = 0;
    thisModel.vl = 0;

    thisModel.n4 = 0;
    thisModel.m3h = 0;
    thisModel.na_current = 0;
    thisModel.k_current = 0;
    thisModel.l_current = 0;

    thisModel.vClampOn = false;

    thisModel.vClampValue = this.convertV( 0 );

    thisModel.reset();// reset and initialize

  }

  return inherit( BaseHodgkinHuxleyModel, ModifiedHodgkinHuxleyModel, {

    reset: function() {
      this.n4DelayBuffer.clear();
      this.m3hDelayBuffer.clear();

      this.cm = 1;// membrane Capacitance
      this.v = 0;// membrane voltage
      this.vna = -115;
      this.vk = 12;
      this.vl = 0; // NOTE: Modified from -10.613 by jblanco on 3/12/2010 in order to make potential stay steady
      // at the desired resting potential.

      //constant leak permeabilties
      this.gna = this.perNaChannels * 120 / 100;
      this.gk = this.perKChannels * 36 / 100;
      this.gl = 0.3;

      // rate constants
      this.bh = 1 / (Math.exp( (this.v + 30) / 10 ) + 1);
      this.ah = 0.07 * Math.exp( this.v / 20 );
      this.bm = 4 * Math.exp( this.v / 18 );
      this.am = 0.1 * (this.v + 25) / (Math.exp( (this.v + 25) / 10 ) - 1);
      this.bn = 0.125 * Math.exp( this.v / 80 );
      this.an = 0.01 * (this.v + 10) / (Math.exp( (this.v + 10) / 10 ) - 1);

      // voltage-dependent gating paramaters
      // start these parameters in steady state
      this.n = this.an / (this.an + this.bn);
      this.m = this.am / (this.am + this.bm);
      this.h = this.ah / (this.ah + this.bh);

      // Time values.
      this.timeSinceActionPotential = Number.POSITIVE_INFINITY;
    },

    stepInTime: function( dt ) {
      var modelIterationsToRun = Math.floor( (dt * 1000) / INTERNAL_TIME_STEP );
      this.timeRemainder += (dt * 1000) % INTERNAL_TIME_STEP;
      if ( this.timeRemainder >= INTERNAL_TIME_STEP ) {
        // Add an additional iteration and reset the time remainder
        // accumulation.  This is kind of like a leap year.
        modelIterationsToRun += 1;
        this.timeRemainder -= INTERNAL_TIME_STEP;
      }

      // Step the model the appropriate number of times.
      _.times( modelIterationsToRun, function( i ) {

        this.dh = (this.ah * (1 - this.h) - this.bh * this.h) * INTERNAL_TIME_STEP;
        this.dm = (this.am * (1 - this.m) - this.bm * this.m) * INTERNAL_TIME_STEP;
        this.dn = (this.an * (1 - this.n) - this.bn * this.n) * INTERNAL_TIME_STEP;

        this.bh = 1 / (Math.exp( (this.v + 30) / 10 ) + 1);
        this.ah = 0.07 * Math.exp( this.v / 20 );
        this.dh = (this.ah * (1 - this.h) - this.bh * this.h) * INTERNAL_TIME_STEP;
        this.bm = 4 * Math.exp( this.v / 18 );
        this.am = 0.1 * (this.v + 25) / (Math.exp( (this.v + 25) / 10 ) - 1);
        this.bn = 0.125 * Math.exp( this.v / 80 );
        this.an = 0.01 * (this.v + 10) / (Math.exp( (this.v + 10) / 10 ) - 1);
        this.dm = (this.am * (1 - this.m) - this.bm * this.m) * INTERNAL_TIME_STEP;
        this.dn = (this.an * (1 - this.n) - this.bn * this.n) * INTERNAL_TIME_STEP;

        // Here is where the main change is that makes this a "modified"
        // version of Hodgkin-Huxley.  Note that the multiplier values
        // were determined empirically from running the more standard HH
        // model.

        // Below, commented out, is the code that a real HH model would use.
        // n4 = n*n*n*n;
        // m3h = m*m*m*h;

        // New values tried by Noah P on 3/10/10
        this.n4 = 0.55 * Math.exp( -1 / 0.55 * Math.pow( this.timeSinceActionPotential - 1.75, 2 ) );
        this.m3h = 0.3 * Math.exp( -1 / 0.2 * Math.pow( this.timeSinceActionPotential - 1.0, 2 ) );

        // If the n4 and m3h values are below a certain level, go ahead
        // and set them to zero.  This helps other parts of the simulation
        // determine when an action potential has ended.  The values used
        // are empirically determined.
        if ( this.n4 < 1E-5 ) {
          this.n4 = 0;
        }
        if ( this.m3h < 1E-5 ) {
          this.m3h = 0;
        }

        // Calculate the currents based on the conductance values.
        this.na_current = this.gna * this.m3h * (this.v - this.vna);
        this.k_current = this.gk * this.n4 * (this.v - this.vk);
        this.l_current = this.gl * (this.v - this.vl);

        this.dv = -1 * INTERNAL_TIME_STEP * ( this.k_current + this.na_current + this.l_current ) / this.cm;

        this.v += this.dv;
        this.h += this.dh;
        this.m += this.dm;
        this.n += this.dn;

        this.elapsedTime += INTERNAL_TIME_STEP;
        if ( this.timeSinceActionPotential < Number.POSITIVE_INFINITY ) {
          this.timeSinceActionPotential += INTERNAL_TIME_STEP;
        }

      }, this );

      this.m3hDelayBuffer.addValue( this.m3h, dt );
      this.n4DelayBuffer.addValue( this.n4, dt );

      if ( this.vClampOn ) {
        this.v = this.vClampValue;
      }
    },


    get_n4: function() { return this.n4; },

    get_delayed_n4: function( delayAmount ) {
      if ( delayAmount <= 0 ) {
        return this.n4;
      }
      else {
        return this.n4DelayBuffer.getDelayedValue( delayAmount );
      }
    },

    get_m3h: function() {
      return this.m3h;
    },

    get_delayed_m3h: function( delayAmount ) {
      var delayedM3h = 0;

      if ( delayAmount <= 0 ) {
        delayedM3h = this.m3h;
      }
      else {
        delayedM3h = this.m3hDelayBuffer.getDelayedValue( delayAmount );
      }

      return delayedM3h;
    },

    getEna: function() {
      return (-1 * (this.vna + this.resting_v));
    },

    getEk: function() {
      return  (-1 * (this.vk + this.resting_v));
    },

    setEna: function( Ena ) {
      this.vna = -1 * Ena - this.resting_v;
    },

    setEk: function( Ek ) {
      this.vk = -1 * Ek - this.resting_v;
    },

    get_na_current: function() {
      return -1 * this.na_current;
    },

    get_k_current: function() {
      return -1 * this.k_current;
    },

    get_l_current: function() {
      return -1 * this.l_current;
    },

    // negative values set to zero
    setPerNaChannels: function( perNaChannels ) {
      if ( perNaChannels < 0 ) {
        this.perNaChannels = 0;
      }
      this.perNaChannels = perNaChannels;
      this.gna = 120 * perNaChannels / 100;
    },

    getPerNaChannels: function() {
      return this.perNaChannels;
    },

    setPerKChannels: function( perKChannels ) {
      if ( perKChannels < 0 ) {
        perKChannels = 0;
      }
      this.perKChannels = perKChannels;
      this.gk = 36 * perKChannels / 100;
    },

    getPerKChannels: function() {
      return this.perKChannels;
    },

    get_gk: function() {
      return this.gk;
    },

    set_gk: function( gk ) {
      this.gk = gk;
    },

    get_gna: function() {
      return this.gna;
    },

    set_gna: function( gna ) {
      this.gna = gna;
    },

    get_gl: function() {
      return this.gl;
    },

    set_gl: function( gl ) {
      this.gl = gl;
    },

    // remember that H&H voltages are -1 * present convention
    // should eventually calculate this instead of setting it
    // convert between internal use of V and the user's expectations
    // the V will be membrane voltage using present day conventions
    // see p. 505 of Hodgkin & Huxley, J Physiol. 1952, 117:500-544
    setV: function( inV ) {
      this.v = -1 * inV - this.resting_v;
    },

    getV: function() {
      return -1 * (this.v + this.resting_v);
    },

    getRestingV: function() {
      return -1 * this.resting_v;
    },

    setCm: function( inCm ) {
      this.cm = inCm;
    },

    getCm: function() {
      return this.cm;
    },

    getElapsedTime: function() {
      return this.elapsedTime;
    },

    resetElapsedTime: function() {
      this.elapsedTime = 0.0;
    },

    getN: function() {
      return this.n;
    },

    getM: function() {
      return this.m;
    },

    getH: function() {
      return this.h;
    },
    /**
     * Converts a voltage from the modern convention to the convention used by the program
     */
    convertV: function( voltage ) {
      return  (-1 * voltage - this.resting_v);
    },

    getVClampOn: function() {
      return this.vClampOn;
    },

    setVClampOn: function( vClampOn ) {
      this.vClampOn = vClampOn;
    },

    get_vClampValue: function() {
      return (-1 * (this.vClampValue + this.resting_v));
    },

    set_vClampValue: function( vClampValue ) {
      this.vClampValue = this.convertV( vClampValue );
    },

    getMembraneVoltage: function() {
      // getV() converts the model's v to present day convention
      return this.getV() / 1000;
    },

    stimulate: function() {
      // Add a fixed amount to the voltage across the membrane.
      this.setV( this.getV() + 15 );
      this.timeSinceActionPotential = 0;
    }

  } );

} );

//// Copyright 2002-2011, University of Colorado
//package edu.colorado.phet.neuron.model;
//
//import edu.colorado.phet.neuron.module.NeuronDefaults;
//
//

//public class ModifiedHodgkinHuxleyModel implements IHodgkinHuxleyModel
//{
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------
//

//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//


//
//  //----------------------------------------------------------------------------
//  // Constructor(s)
//  //----------------------------------------------------------------------------
//
//  public ModifiedHodgkinHuxleyModel()
//  {
//    reset();
//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------
//


//

//
//  /* (non-Javadoc)
//   * @see edu.colorado.phet.neuron.model.IHodgkinHuxleyModel#stepInTime(double)
//   */


//}
