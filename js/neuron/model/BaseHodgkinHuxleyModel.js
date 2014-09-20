// Copyright 2002-2011, University of Colorado
/**
 * This interface is intended for allowing various instantiations of Hodgkin-
 * Huxley models to be swapped around with minimal code changes.  It may not
 * be needed when a final model is settled upon.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );

  function BaseHodgkinHuxleyModel() {

  }

  return inherit( Object, BaseHodgkinHuxleyModel, {

    /**
     * Advances the model by dt (delta time).
     *
     * @param dt - Delta time in seconds.
     */
    step: function( dt ) {
      //TODO
    },
    /**
     * Get the membrane potential in volts.
     *
     * @return
     */
    getMembraneVoltage: function() {
    },

    /**
     * Stimulate the neuron in a way that simulates a depolarization signal
     * coming to this neuron.  If the neuron is in the correct state, this
     * will trigger an action potential.
     */
    stimulate: function() {
    },

    /**
     * Reset the model back to nominal conditions.
     */
    reset: function() {
    },

    get_n4: function() {
    },

    /**
     * Get a delayed version of the n^4 amount, which is the variable factor
     * that governs the potassium channel conductance.
     *
     * @param delayAmount - Time delay in seconds.
     * @return
     */
    get_delayed_n4: function( delayAmount ) {
    },

    get_m3h: function() {
    },

    /**
     * Get a delayed version of the m3h amount, which is the variable factor
     * that governs the sodium channel conductance.
     *
     * @param delayAmount - Time delay in seconds.
     * @return
     */
    get_delayed_m3h: function( delayAmount ) {
    },

    get_na_current: function() {
    },

    get_k_current: function() {
    },

    get_l_current: function() {
    },

    get_gk: function() {
    },

    get_gna: function() {
    },

    get_gl: function() {
    },

    getElapsedTime: function() {
    },

    getCm: function() {
    },

    setCm: function( cm ) {
    },

    set_gna: function( gna ) {
    },

    set_gk: function( gk ) {
    },

    set_gl: function( gl ) {
    }

  } );

} );


//// Copyright 2002-2011, University of Colorado
//package edu.colorado.phet.neuron.model;
//

//public interface IHodgkinHuxleyModel {
//

//   */
//  public abstract void stepInTime(double dt);
//
//  /**
//   * Get the membrane potential in volts.
//   *
//   * @return
//   */
//  public abstract double getMembraneVoltage();
//
//  /**
//   * Stimulate the neuron in a way that simulates a depolarization signal
//   * coming to this neuron.  If the neuron is in the correct state, this
//   * will trigger an action potential.
//   */
//  public abstract void stimulate();
//
//  /**
//   * Reset the model back to nominal conditions.
//   */
//  public abstract void reset();
//
//  public abstract double get_n4();
//
//  /**
//   * Get a delayed version of the n^4 amount, which is the variable factor
//   * that governs the potassium channel conductance.
//   *
//   * @param delayAmount - Time delay in seconds.
//   * @return
//   */
//  public abstract double get_delayed_n4(double delayAmount);
//
//  public abstract double get_m3h();
//
//  /**
//   * Get a delayed version of the m3h amount, which is the variable factor
//   * that governs the sodium channel conductance.
//   *
//   * @param delayAmount - Time delay in seconds.
//   * @return
//   */
//  public abstract double get_delayed_m3h(double delayAmount);
//
//  public abstract double get_na_current();
//
//  public abstract double get_k_current();
//
//  public abstract double get_l_current();
//
//  public abstract double get_gk();
//
//  public abstract double get_gna();
//
//  public abstract double get_gl();
//
//  public abstract double getElapsedTime();
//
//  public abstract double getCm();
//
//  public abstract void setCm(double cm);
//
//  public abstract void set_gna(double gna);
//
//  public abstract void set_gk(double gk);
//
//  public abstract void set_gl(double gl);
//
//}