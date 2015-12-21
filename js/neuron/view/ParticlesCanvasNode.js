// Copyright 2014-2015, University of Colorado Boulder

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
    neuronModel.particlesMoved.addListener( function() {
      thisNode.invalidatePaint();
    } );
  }

  return inherit( CanvasNode, ParticlesCanvasNode, {

    // @private
    renderSodiumParticles: function( particles, context ) {
      var self = this;
      context.fillStyle = particles[ 0 ].getRepresentationColor().getCanvasStyle(); // All sodium ions are of the same color,
      var transformedRadius = self.modelViewTransform.modelToViewDeltaX( particles[ 0 ].getRadius() );
      context.lineWidth = 0.3;
      context.strokeStyle = 'black';
      particles.forEach( function( particle ) {
        context.globalAlpha = particle.getOpacity();
        context.beginPath();
        var x = self.modelViewTransform.modelToViewX( particle.getPositionX() );
        var y = self.modelViewTransform.modelToViewY( particle.getPositionY() );
        context.arc( x, y, transformedRadius, 0, 2 * Math.PI, true );
        context.closePath();
        context.stroke();
        context.fill();
      } );
    },

    renderPotassiumParticles: function( particles, context ) {
      var self = this;
      context.fillStyle = particles[ 0 ].getRepresentationColor().getCanvasStyle();
      var size = self.modelViewTransform.modelToViewDeltaX( particles[ 0 ].getRadius() * 2 ) * 0.55;
      context.lineWidth = 0.3;
      context.strokeStyle = 'black';
      particles.forEach( function( particle ) {
        context.globalAlpha = particle.getOpacity();
        context.beginPath();
        var x = self.modelViewTransform.modelToViewX( particle.getPositionX() );
        var y = self.modelViewTransform.modelToViewY( particle.getPositionY() );
        context.moveTo( x - size, y );
        context.lineTo( x, y - size );
        context.lineTo( x + size, y );
        context.lineTo( x, y + size );
        context.closePath();
        context.stroke();
        context.fill();
      } );
    },

    // @private
    renderParticles: function( particles, context ) {
      var self = this;

      // group by particle type, this way no need to set the fillStyle for every particle instance
      var particlesGroupedByType = _.groupBy( particles, function( particle ) {
        return particle.getType();
      } );

      _.forOwn( particlesGroupedByType, function( particlesOfSameType, particleType ) {
        switch( particleType ) {
          case ParticleType.SODIUM_ION:
            self.renderSodiumParticles( particlesOfSameType, context );
            break;
          case ParticleType.POTASSIUM_ION:
            self.renderPotassiumParticles( particlesOfSameType, context );
            break;
        }
      } );
    },

    /**
     * @param {CanvasRenderingContext2D} context
     * @override
     * @public
     */
    paintCanvas: function( context ) {
      this.renderParticles( this.neuronModel.backgroundParticles.getArray(), context );
      this.renderParticles( this.neuronModel.transientParticles.getArray(), context );
      this.renderParticles( this.neuronModel.playbackParticles.getArray(), context );
    }

  } );
} );