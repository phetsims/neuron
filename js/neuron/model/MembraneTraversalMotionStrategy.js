/**
 * Base class for all motion strategies that cause particles to traverse
 * through the membrane.
 *
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var MotionStrategy = require( 'NEURON/neuron/model/MotionStrategy' );


  function MembraneTraversalMotionStrategy() {

  }


  MembraneTraversalMotionStrategy.DEFAULT_MAX_VELOCITY = 40000;
  return  inherit( MotionStrategy, MembraneTraversalMotionStrategy, {

  } );


} );