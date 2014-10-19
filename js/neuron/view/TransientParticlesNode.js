// Copyright 2002-2011, University of Colorado
/**
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ParticlesNode = require( 'NEURON/neuron/view/ParticlesNode' );

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2}bounds
   * @constructor
   */
  function TransientParticlesNode( neuronModel, modelViewTransform, bounds ) {
    var thisNode = this;
    thisNode.neuronModel = neuronModel;
    ParticlesNode.call( thisNode, modelViewTransform, bounds );
    // if during a step we change, then trigger a repaint
    //Use Particles Canvas Node to render all the particles directly
       neuronModel.particlesStateChangedProperty.link( function( newValue ) {
      thisNode.invalidatePaint();
    } );

  }

  return inherit( ParticlesNode, TransientParticlesNode, {

    getParticlesToRender: function() {
      var allTransientParticles = this.neuronModel.transientParticles.getArray().slice();
      allTransientParticles = allTransientParticles.concat( this.neuronModel.playbackParticles.getArray().slice() );
      return allTransientParticles;
    }

  } );

} );
    