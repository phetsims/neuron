// Copyright 2002-2011, University of Colorado

/**
 * For performance reasons, this sim uses a single canvasNode to render all the particles instead of having nodes that
 * represent each particle. This canvas node class is actually a fallback for when WebGL support is not available on
 * the device.
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Shape} clipArea
   * @constructor
   */
  function ParticlesCanvasNode( neuronModel, modelViewTransform, clipArea ) {
    var thisNode = this;
    CanvasNode.call( thisNode, {
      pickable: false,
      canvasBounds: clipArea.bounds,
      clipArea: clipArea,
      layerSplit: true
    } );
    thisNode.modelViewTransform = modelViewTransform;
    thisNode.neuronModel = neuronModel;

    // Monitor a property that indicates when a particle state has changed and initiate a redraw.
    neuronModel.on( NeuronConstants.PARTICLES_MOVED_EVENT, function() {
      thisNode.invalidatePaint();
    } );
  }

  return inherit( CanvasNode, ParticlesCanvasNode, {

    // @param {CanvasContextWrapper} wrapper
    paintCanvas: function( wrapper ) {

      var context = wrapper.context;

      var thisNode = this;
      var canvasStrokeStyle = Color.BLACK.getCanvasStyle();

      // TODO: This appears to be redefining the function on every paint, which seems crazy.  Can this be moved out?
      function renderParticles( particleTypes ) {

        // group by particle type, this way no need to set the fillStyle for every particle instance
        var particlesGroupedByType = _.groupBy( particleTypes, function( particle ) {
          return particle.getType();
        } );

        _.forOwn( particlesGroupedByType, function( particlesOfSameType, particleType ) {
          switch( particleType ) {
            case ParticleType.SODIUM_ION:
              renderSodiumParticles( particlesOfSameType );
              //renderSodiumParticles( particlesOfSameType );
              break;
            case ParticleType.POTASSIUM_ION:
              renderPotassiumParticles( particlesOfSameType );
              //renderPotassiumParticles( particlesOfSameType );
              break;
          }
        } );

        function renderSodiumParticles( particles ) {
          context.fillStyle = particles[ 0 ].getRepresentationColor().getCanvasStyle();// All sodium ions are of the same color,
          var transformedRadius = thisNode.modelViewTransform.modelToViewDeltaX( particles[ 0 ].getRadius() );
          context.lineWidth = 0.2;
          context.strokeStyle = canvasStrokeStyle;
          particles.forEach( function( particle ) {
            context.globalAlpha = particle.getOpacity();
            context.beginPath();
            var x = thisNode.modelViewTransform.modelToViewX( particle.getPositionX() );
            var y = thisNode.modelViewTransform.modelToViewY( particle.getPositionY() );
            context.arc( x, y, transformedRadius, 0, 2 * Math.PI, true );
            context.closePath();
            context.stroke();
            context.fill();
          } );
        }

        function renderPotassiumParticles( particles ) {
          context.fillStyle = particles[ 0 ].getRepresentationColor().getCanvasStyle();
          var size = thisNode.modelViewTransform.modelToViewDeltaX( particles[ 0 ].getRadius() * 2 ) * 0.75;//was 0.85
          context.lineWidth = 0.2;
          context.strokeStyle = canvasStrokeStyle;
          particles.forEach( function( particle ) {
            context.globalAlpha = particle.getOpacity();
            context.beginPath();
            var x = thisNode.modelViewTransform.modelToViewX( particle.getPositionX() );
            var y = thisNode.modelViewTransform.modelToViewY( particle.getPositionY() );
            context.moveTo( x - size, y );
            context.lineTo( x, y - size );
            context.lineTo( x + size, y );
            context.lineTo( x, y + size );
            context.closePath();
            context.stroke();
            context.fill();
          } );
        }
      }

      renderParticles( this.neuronModel.backgroundParticles.getArray() );
      renderParticles( this.neuronModel.transientParticles.getArray() );
      renderParticles( this.neuronModel.playbackParticles.getArray() );
    }
  } );
} );