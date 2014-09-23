// Copyright 2002-2011, University of Colorado
/**
 * For performance  reason uses a single canvasNode  to render all the particles
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );


  /**
   * @param {Particles} particles
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ParticlesNode( neuronModel, modelViewTransform ) {
    var thisNode = this;

    thisNode.neuronModel = neuronModel;
    thisNode.modelViewTransform = modelViewTransform;

    // Initialize with a self-bounds of activeBounds
    CanvasNode.call( thisNode, { pickable: false } );

    // if during a step we change, then trigger a repaint
    //Use Particles Canvas Node to render all the particles directly
    neuronModel.particlesStateChangedProperty.link( function( newValue ) {
      thisNode.invalidatePaint();
    } );
    thisNode.invalidatePaint();
  }

  return inherit( CanvasNode, ParticlesNode, {

    // @param {CanvasContextWrapper} wrapper
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var allParticles = this.neuronModel.backgroundParticles.getArray();
      allParticles = allParticles.concat( this.neuronModel.transientParticles.getArray() );

      var thisNode = this;

      allParticles.forEach( function( particle ) {
        var color = particle.getRepresentationColor().copy();
        color.alpha = particle.getOpaqueness();

        var particleViewPosition = thisNode.modelViewTransform.modelToViewPosition( particle.position );
        context.save();
        context.beginPath();
        context.fillStyle = color.toCSS();
        switch( particle.getType() ) {
          case ParticleType.SODIUM_ION:
            var transformedRadius = thisNode.modelViewTransform.modelToViewDeltaX( particle.getRadius() );
            context.translate( particleViewPosition.x, particleViewPosition.y );
            context.arc( 0, 0, transformedRadius, 0, 2 * Math.PI, true );
            break;

          case ParticleType.POTASSIUM_ION:
            var size = thisNode.modelViewTransform.modelToViewDeltaX( particle.getRadius() * 2 ) * 1.1;// TODO size  was  0.85 Ashraf
            context.translate( particleViewPosition.x, particleViewPosition.y );
            context.rotate( Math.PI / 4 );
            context.fillRect( -size / 2, -size / 2, size, size );
            break;

          default:
            console.log( particle.getType() + " - Warning: No specific shape for this particle type, defaulting to sphere." );
            var defaultSphereRadius = thisNode.modelViewTransform.modelToViewDeltaX( particle.getRadius() );
            context.translate( particleViewPosition.x, particleViewPosition.y );
            context.arc( 0, 0, defaultSphereRadius, 0, 2 * Math.PI, true );
            break;
        }
        context.closePath();
        context.fill();
        context.restore();
      } );
    }

  } );

} );