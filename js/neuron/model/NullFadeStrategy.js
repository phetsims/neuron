//  Copyright 2002-2014, University of Colorado Boulder
/**
 * Fade strategy that does nothing.  Useful for avoiding having to check for
 * null values of fade strategy all the time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var FadeStrategy = require( 'NEURON/neuron/model/FadeStrategy' );

  /**
   *
   * @constructor
   */
  function NullFadeStrategy() {
  }

  return inherit( FadeStrategy, NullFadeStrategy, {
      //@Override
      updateOpaqueness: function( fadableModelElement, dt ) {
        // Does nothing.
      }
    },
    //static.
    {
      getInstance: function() {
        if ( !this.instance ) {
          // No need to create new instance of NullFadeStrategy , it is stateless
          // Using a single strategy instance to avoid allocation
          this.instance = new NullFadeStrategy();
        }
        return this.instance;
      }
    }
  );
} );

