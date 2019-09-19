// Copyright 2014-2017, University of Colorado Boulder
/**
 * Fade strategy that does nothing.  Useful for avoiding having to check for null values of fade strategy all the time.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const FadeStrategy = require( 'NEURON/neuron/model/FadeStrategy' );
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );

  /**
   * @constructor
   */
  function NullFadeStrategy() {}

  neuron.register( 'NullFadeStrategy', NullFadeStrategy );

  return inherit( FadeStrategy, NullFadeStrategy, {

      // @public, @override
      updateOpacity: function( fadableModelElement, dt ) {
        // Does nothing.
      }

    },

    //static
    {
      // @public
      getInstance: function() {
        if ( !NullFadeStrategy.instance ) {
          // No need to create new instance of NullFadeStrategy , it is stateless
          // Using a single strategy instance to avoid allocation
          NullFadeStrategy.instance = new NullFadeStrategy();
        }
        return NullFadeStrategy.instance;
      }
    }
  );
} );

