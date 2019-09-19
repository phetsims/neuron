// Copyright 2014-2017, University of Colorado Boulder

/**
 * For performance reasons, this sim uses a single canvasNode to render all the particles instead of having nodes that
 * represent each particle. This canvas node class is actually a fallback for when WebGL support is not available on
 * the device.
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );
  const ParticleType = require( 'NEURON/neuron/model/ParticleType' );

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Shape} clipArea
   * @constructor
   */
  function ParticlesCanvasNode( neuronModel, modelViewTransform, clipArea ) {
    const self = this;
    CanvasNode.call( this, {
      pickable: false,
      canvasBounds: clipArea.bounds,
      clipArea: clipArea,
      layerSplit: true
    } );
    this.modelViewTransform = modelViewTransform;
    this.neuronModel = neuronModel;

    // Monitor a property that indicates when a particle state has changed and initiate a redraw.
    neuronModel.particlesMoved.addListener( function() {
      self.invalidatePaint();
    } );

    // monitor a property that indicates whether all ions are being depicted and initiate a redraw on a change
    neuronModel.allIonsSimulatedProperty.lazyLink( function() {
      self.invalidatePaint();
    } );

    /**
     * There is an issue in Scenery where, if nothing is drawn, whatever was previously drawn stays there.  This was
     * causing problems in this sim when turning off the "Show All Ions" setting, see
     * https://github.com/phetsims/neuron/issues/100.  The Scenery issue is
     * https://github.com/phetsims/scenery/issues/503.  To work around this problem, a property was added to the model
     * and linked here that can be used to set the node invisible if there are no particles to be rendered.  This can
     * probably be removed if and when the Scenery issue is addressed.
     */
    neuronModel.atLeastOneParticlePresentProperty.lazyLink( function( atLeastOneParticlePresent ) {
      self.visible = atLeastOneParticlePresent;
      self.invalidatePaint();
    } );
  }

  neuron.register( 'ParticlesCanvasNode', ParticlesCanvasNode );

  return inherit( CanvasNode, ParticlesCanvasNode, {

    // @private
    renderSodiumParticles: function( particles, context ) {
      const self = this;
      context.fillStyle = particles[ 0 ].getRepresentationColor().getCanvasStyle(); // All sodium ions are of the same color,
      const transformedRadius = this.modelViewTransform.modelToViewDeltaX( particles[ 0 ].getRadius() );
      context.lineWidth = 0.3;
      context.strokeStyle = 'black';
      particles.forEach( function( particle ) {
        context.globalAlpha = particle.getOpacity();
        context.beginPath();
        const x = self.modelViewTransform.modelToViewX( particle.getPositionX() );
        const y = self.modelViewTransform.modelToViewY( particle.getPositionY() );
        context.arc( x, y, transformedRadius, 0, 2 * Math.PI, true );
        context.closePath();
        context.stroke();
        context.fill();
      } );
    },

    renderPotassiumParticles: function( particles, context ) {
      const self = this;
      context.fillStyle = particles[ 0 ].getRepresentationColor().getCanvasStyle();
      const size = this.modelViewTransform.modelToViewDeltaX( particles[ 0 ].getRadius() * 2 ) * 0.55;
      context.lineWidth = 0.3;
      context.strokeStyle = 'black';
      particles.forEach( function( particle ) {
        context.globalAlpha = particle.getOpacity();
        context.beginPath();
        const x = self.modelViewTransform.modelToViewX( particle.getPositionX() );
        const y = self.modelViewTransform.modelToViewY( particle.getPositionY() );
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
      const self = this;

      // group by particle type, this way no need to set the fillStyle for every particle instance
      const particlesGroupedByType = _.groupBy( particles, function( particle ) {
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
          default:
            throw new Error( 'invalid particleType: ' + particleType );
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