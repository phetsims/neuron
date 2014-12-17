// Copyright 2002-2011, University of Colorado

/**
 * For performance reasons this sim uses a single canvasNode to render all the particles.
 * This class is used as a fallback when WebGL support is not available in the device.
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} bounds
   * @constructor
   */
  function ParticlesNode( neuronModel, modelViewTransform, bounds ) {
    var thisNode = this;
    var clipArea = Shape.rect( bounds.minX, bounds.minY, bounds.width, bounds.maxY );
    CanvasNode.call( thisNode, {pickable: false, canvasBounds: bounds, layerSplit: true, clipArea: clipArea } );
    thisNode.modelViewTransform = modelViewTransform;
    thisNode.neuronModel = neuronModel;
    // if during a step we change, then trigger a repaint
    //Use Particles Canvas Node to render all the particles directly
    neuronModel.particlesStateChangedProperty.link( function( newValue ) {
      thisNode.invalidatePaint();
    } );
  }

  return inherit( CanvasNode, ParticlesNode, {

    // @param {CanvasContextWrapper} wrapper
    paintCanvas: function( wrapper ) {

      var context = wrapper.context;

      var thisNode = this;
      var canvasStrokeStyle = Color.BLACK.getCanvasStyle();

      function renderParticles( particleTypes ) {

        // group by particle Type,this way no need to set the fillStyle for every particle instance
        var particlesGroupedByType = _.groupBy( particleTypes, function( particle ) {
          return particle.getType();
        } );

        _.forIn( particlesGroupedByType, function( particlesOfSameType, particleType ) {
          switch( particleType ) {
            case ParticleType.SODIUM_ION:
              renderSodiumParticles( particlesOfSameType );
              break;
            case ParticleType.POTASSIUM_ION:
              renderPotassiumParticles( particlesOfSameType );
              break;
          }

        } );

        function renderSodiumParticles( particles ) {
          context.fillStyle = particles[0].getRepresentationColor().getCanvasStyle();// All sodium ions are of the same color,
          var transformedRadius = thisNode.modelViewTransform.modelToViewDeltaX( particles[0].getRadius() );
          context.lineWidth = 0.2;
          context.strokeStyle = canvasStrokeStyle;
          particles.forEach( function( particle ) {
            context.globalAlpha = particle.getOpaqueness();
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
          context.fillStyle = particles[0].getRepresentationColor().getCanvasStyle();
          var size = thisNode.modelViewTransform.modelToViewDeltaX( particles[0].getRadius() * 2 ) * 0.75;//was 0.85
          context.lineWidth = 0.2;
          context.strokeStyle = canvasStrokeStyle;
          particles.forEach( function( particle ) {
            context.globalAlpha = particle.getOpaqueness();
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

} )
;