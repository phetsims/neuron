// Copyright 2014-2021, University of Colorado Boulder

/**
 * For performance reasons, this sim uses a single canvasNode to render all the particles instead of having nodes that
 * represent each particle. This canvas node class is actually a fallback for when WebGL support is not available on
 * the device.
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */

import { CanvasNode } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';
import ParticleType from '../model/ParticleType.js';

class ParticlesCanvasNode extends CanvasNode {

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Shape} clipArea
   */
  constructor( neuronModel, modelViewTransform, clipArea ) {
    super( {
      pickable: false,
      canvasBounds: clipArea.bounds,
      clipArea: clipArea,
      layerSplit: true
    } );
    this.modelViewTransform = modelViewTransform;
    this.neuronModel = neuronModel;

    // Monitor a property that indicates when a particle state has changed and initiate a redraw.
    neuronModel.particlesMoved.addListener( () => {
      this.invalidatePaint();
    } );

    // monitor a property that indicates whether all ions are being depicted and initiate a redraw on a change
    neuronModel.allIonsSimulatedProperty.lazyLink( () => {
      this.invalidatePaint();
    } );

    /**
     * There is an issue in Scenery where, if nothing is drawn, whatever was previously drawn stays there.  This was
     * causing problems in this sim when turning off the "Show All Ions" setting, see
     * https://github.com/phetsims/neuron/issues/100.  The Scenery issue is
     * https://github.com/phetsims/scenery/issues/503.  To work around this problem, a property was added to the model
     * and linked here that can be used to set the node invisible if there are no particles to be rendered.  This can
     * probably be removed if and when the Scenery issue is addressed.
     */
    neuronModel.atLeastOneParticlePresentProperty.lazyLink( atLeastOneParticlePresent => {
      this.visible = atLeastOneParticlePresent;
      this.invalidatePaint();
    } );
  }

  // @private
  renderSodiumParticles( particles, context ) {
    context.fillStyle = particles[ 0 ].getRepresentationColor().getCanvasStyle(); // All sodium ions are of the same color,
    const transformedRadius = this.modelViewTransform.modelToViewDeltaX( particles[ 0 ].getRadius() );
    context.lineWidth = 0.3;
    context.strokeStyle = 'black';
    particles.forEach( particle => {
      context.globalAlpha = particle.getOpacity();
      context.beginPath();
      const x = this.modelViewTransform.modelToViewX( particle.getPositionX() );
      const y = this.modelViewTransform.modelToViewY( particle.getPositionY() );
      context.arc( x, y, transformedRadius, 0, 2 * Math.PI, true );
      context.closePath();
      context.stroke();
      context.fill();
    } );
  }

  /**
   * @private
   * @param particles
   * @param context
   */
  renderPotassiumParticles( particles, context ) {
    context.fillStyle = particles[ 0 ].getRepresentationColor().getCanvasStyle();
    const size = this.modelViewTransform.modelToViewDeltaX( particles[ 0 ].getRadius() * 2 ) * 0.55;
    context.lineWidth = 0.3;
    context.strokeStyle = 'black';
    particles.forEach( particle => {
      context.globalAlpha = particle.getOpacity();
      context.beginPath();
      const x = this.modelViewTransform.modelToViewX( particle.getPositionX() );
      const y = this.modelViewTransform.modelToViewY( particle.getPositionY() );
      context.moveTo( x - size, y );
      context.lineTo( x, y - size );
      context.lineTo( x + size, y );
      context.lineTo( x, y + size );
      context.closePath();
      context.stroke();
      context.fill();
    } );
  }

  // @private
  renderParticles( particles, context ) {
    // group by particle type, this way no need to set the fillStyle for every particle instance
    const particlesGroupedByType = _.groupBy( particles, particle => particle.getType() );

    _.forOwn( particlesGroupedByType, ( particlesOfSameType, particleType ) => {
      switch( particleType ) {
        case ParticleType.SODIUM_ION:
          this.renderSodiumParticles( particlesOfSameType, context );
          break;
        case ParticleType.POTASSIUM_ION:
          this.renderPotassiumParticles( particlesOfSameType, context );
          break;
        default:
          throw new Error( `invalid particleType: ${particleType}` );
      }
    } );
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @override
   * @public
   */
  paintCanvas( context ) {
    this.renderParticles( this.neuronModel.backgroundParticles, context );
    this.renderParticles( this.neuronModel.transientParticles, context );
    this.renderParticles( this.neuronModel.playbackParticles, context );
  }
}

neuron.register( 'ParticlesCanvasNode', ParticlesCanvasNode );

export default ParticlesCanvasNode;