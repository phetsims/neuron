// Copyright 2014-2016, University of Colorado Boulder
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
  var neuron = require( 'NEURON/neuron' );

  /**
   * @constructor
   */
  function StillnessMotionStrategy() {}

  neuron.register( 'StillnessMotionStrategy', StillnessMotionStrategy );

  return inherit( MotionStrategy, StillnessMotionStrategy, {

      // @public, @override
      move: function( movableModelElement, fadableModelElement, dt ) {
        // Does nothing, since the object is not moving.
      }
    },

    //static.
    {
      // @public
      getInstance: function() {
        if ( !StillnessMotionStrategy.instance ) {
          // No need to create new instance of StillnessMotionStrategy , it is stateless
          // Using a single strategy instance to avoid allocation
          StillnessMotionStrategy.instance = new StillnessMotionStrategy();
        }
        return StillnessMotionStrategy.instance;
      }
    } );
} );

