// Copyright 2014-2020, University of Colorado Boulder
/**
 * DelayElements are used as the individual entries in a DelayBuffer.  Each delay element consists of a value and a time
 * difference, generally from the time of the previous entry.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';

class DelayElement {

  /**
   * @param {number} value
   * @param {number} deltaTime
   */
  constructor( value, deltaTime ) {
    value = value || 0;
    deltaTime = deltaTime || 0;
    this.value = value;
    this.deltaTime = deltaTime;
  }

  // @public
  setValueAndTime( value, deltaTime ) {
    this.value = value;
    this.deltaTime = deltaTime;
  }
}

neuron.register( 'DelayElement', DelayElement );

export default DelayElement;