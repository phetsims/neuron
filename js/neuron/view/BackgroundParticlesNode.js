// Copyright 2002-2011, University of Colorado
/**
 * //REVIEW - is the comment below correct and up to date?  I'm seeing this used in ParticlesCanvasLayerNode.  Please
 * either update the comment, remove the class, or add documentation that states why it should be kept around even if
 * it isn't used.
 *
 * For performance  reasons, there are multiple Background Particles canvas node each renders a subset of background particles and are rendered in a round robin fashion.
 * The assumption is since Background particles exhibit slow random brownian motion this way of rendering wont affect the realism
 * EXPERIMENTAL CLASS NOT USED because the WebGL version of Particle implementation  is found to be performing far better.
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ParticlesNode = require( 'NEURON/neuron/view/ParticlesNode' );

  /**
   * @param {Array} particles // a slice of background particles array
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} bounds
   * @param {Property.<boolean>} activeCanvasProperty
   * @constructor
   */
  function BackgroundParticlesNode( particles, modelViewTransform, bounds, activeCanvasProperty ) {
    var thisNode = this;
    ParticlesNode.call( thisNode, modelViewTransform, bounds );
    thisNode.particles = particles;

    activeCanvasProperty.link( function( activeCanvas ) {
      if ( activeCanvas ) {
        thisNode.invalidatePaint();
      }
    } );
  }

  return inherit( ParticlesNode, BackgroundParticlesNode, {
    getParticlesToRender: function() {
      return this.particles;
    }
  } );

} );