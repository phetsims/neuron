// Copyright 2002-2011, University of Colorado
/**
 * The Delay buffer keeps an array of DelayElements, through which it puts and extracts information based on
 * the amount of elapsed time
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  /**
   *
   * @param {number} value  // calculated by  Hodgkin-Huxley model
   * @param {number} deltaTime
   * @constructor
   */
  function DelayElement( value, deltaTime ) {
    value = value || 0;
    deltaTime = deltaTime || 0;
    this.value = value;
    this.deltaTime = deltaTime;
  }

  DelayElement.prototype = {

    getValue: function() {
      return this.value;
    },
    setValueAndTime: function( value, deltaTime ) {
      this.value = value;
      this.deltaTime = deltaTime;
    },

    getDeltaTime: function() {
      return this.deltaTime;
    }
  };

  return DelayElement;

} );

