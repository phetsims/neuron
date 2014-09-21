// Copyright 2002-2011, University of Colorado
/**
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

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

