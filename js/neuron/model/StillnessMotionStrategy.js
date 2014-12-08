//  Copyright 2002-2014, University of Colorado Boulder
/**
 * Motion strategy that does not do any motion, i.e. just leaves the model element in the same location.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );

  /**
   *
   * @constructor
   */
  function StillnessMotionStrategy() {

  }

  return inherit( MotionStrategy, StillnessMotionStrategy, {
      move: function( movableModelElement, fadableModelElement, dt ) {
        // Does nothing, since the object is not moving.
      }
    },
    //static.
    {
      getInstance: function() {
        if ( !this.instance ) {
          // No need to create new instance of StillnessMotionStrategy , it is stateless
          // Using a single strategy instance to avoid allocation
          this.instance = new StillnessMotionStrategy();
        }
        return this.instance;
      }
    } );
} );

