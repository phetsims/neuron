// Copyright 2014-2022, University of Colorado Boulder
/**
 * Class that represents particles (generally ions) in the view.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';
import ParticleType from '../model/ParticleType.js';

// constants
const PARTICLE_EDGE_STROKE = 1;

class ParticleNode extends Node {

  /**
   * @param {ViewableParticle} particle
   * @param {ModelViewTransform2D} modelViewTransform
   */
  constructor( particle, modelViewTransform ) {
    super( {} );
    this.particle = particle;
    this.modelViewTransform = modelViewTransform;

    // Create the initial representation with the aspects that don't change.
    const representation = new Path( new Shape(), { lineWidth: PARTICLE_EDGE_STROKE, stroke: Color.BLACK } );
    this.addChild( representation );

    const updateOffset = ( x, y ) => {
      this.translate( modelViewTransform.modelToViewPosition( new Vector2( x, y ) ) );
    };

    const updateRepresentation = newOpacity => {

      let size;
      let representationShape;

      assert && assert( particle.getType() === ParticleType.SODIUM_ION || particle.getType() === ParticleType.POTASSIUM_ION );

      const particleType = particle.getType();
      if ( particleType === ParticleType.SODIUM_ION ) {
        const transformedRadius = modelViewTransform.modelToViewDeltaX( particle.getRadius() );
        representationShape = new Shape().ellipse( 0, 0, transformedRadius, transformedRadius );
      }
      else if ( particleType === ParticleType.POTASSIUM_ION ) {
        size = modelViewTransform.modelToViewDeltaX( particle.getRadius() * 2 ) * 0.85;
        representationShape = new Shape().rect( -size / 2, -size / 2, size, size );
        const rotationTransform = Matrix3.rotationAround( Math.PI / 4, 0, 0 );
        representationShape = representationShape.transformed( rotationTransform );
      }
      else {

        // This should never happen, but if it does, use an arbitrary shape.
        const defaultSphereRadius = modelViewTransform.modelToViewDeltaX( particle.getRadius() );
        representationShape = new Shape().ellipse( 0, 0, defaultSphereRadius, defaultSphereRadius );
      }

      representation.setShape( representationShape );
      representation.fill = particle.getRepresentationColor();
      this.setOpacity( newOpacity );
    };

    updateOffset( particle.getPositionX(), particle.getPositionY() );
    updateRepresentation( particle.getOpacity() );
  }
}

neuron.register( 'ParticleNode', ParticleNode );

export default ParticleNode;