// Copyright 2002-2011, University of Colorado
/**
 * For performance  reason uses a single canvasNode  to render all the particles.
 * This class is replaced by ParticlesWebGLNode which uses WebGL to render the particles
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
   * @param {ModelViewTransform2D} modelViewTransform
   * @param {Bounds2} bounds
   * @constructor
   */
  function ParticlesNode( modelViewTransform, bounds ) {
    var thisNode = this;
    var clipArea = Shape.rect( bounds.minX, bounds.minY, bounds.width, bounds.maxY );
    CanvasNode.call( thisNode, {pickable: false, canvasBounds: bounds, layerSplit: true, clipArea: clipArea } );
    thisNode.modelViewTransform = modelViewTransform;
  }

  return inherit( CanvasNode, ParticlesNode, {

    // @param {CanvasContextWrapper} wrapper
    paintCanvas: function( wrapper ) {

      var context = wrapper.context;

      var thisNode = this;
      var canvasStrokeStyle = Color.BLACK.getCanvasStyle();

      function renderParticles( particleTypes ) {

        // group by particle Type
        var particlesGroupedByType = _.groupBy( particleTypes, function( particle ) {
          return particle.getType();
        } );

        //This way no need to set the fillStyle for every particle
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
          context.lineWidth = 0.1;
          context.strokeStyle = canvasStrokeStyle;
          particles.forEach( function( particle ) {
            context.globalAlpha = particle.getOpaqueness();
            context.beginPath();
            var particleViewPosition = thisNode.modelViewTransform.modelToViewPosition( particle.getPositionReference() );
            context.arc( particleViewPosition.x | 0, particleViewPosition.y | 0, transformedRadius, 0, 2 * Math.PI, true );
            context.closePath();
            context.stroke();
            context.fill();
          } );

        }


        function renderPotassiumParticles( particles ) {
          context.fillStyle = particles[0].getRepresentationColor().getCanvasStyle();
          var size = thisNode.modelViewTransform.modelToViewDeltaX( particles[0].getRadius() * 2 ) * 0.75;//was 0.85
          context.lineWidth = 0.1;
          context.strokeStyle = canvasStrokeStyle;
          particles.forEach( function( particle ) {
            context.globalAlpha = particle.getOpaqueness();
            context.beginPath();
            var position = thisNode.modelViewTransform.modelToViewPosition( particle.getPositionReference() );
            var x = position.x | 0;
            var y = position.y | 0;
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


      renderParticles( this.getParticlesToRender() );


    },

    getParticlesToRender: function() {
      throw new Error( "getParticlesToRender is to be implemented by sub classes" );
    }

  } );

} )
;