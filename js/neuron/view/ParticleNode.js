// Copyright 2014-2017, University of Colorado Boulder
/**
 * Class that represents particles (generally ions) in the view.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const neuron = require( 'NEURON/neuron' );
  const Node = require( 'SCENERY/nodes/Node' );
  const ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const PARTICLE_EDGE_STROKE = 1;

  /**
   * @param {ViewableParticle} particle
   * @param {ModelViewTransform2D} modelViewTransform
   * @constructor
   */
  function ParticleNode( particle, modelViewTransform ) {
    const self = this;
    Node.call( this, {} );
    this.particle = particle;
    this.modelViewTransform = modelViewTransform;

    // Create the initial representation with the aspects that don't change.
    const representation = new Path( new Shape(), { lineWidth: PARTICLE_EDGE_STROKE, stroke: Color.BLACK } );
    this.addChild( representation );

    function updateOffset( x, y ) {
      self.translate( modelViewTransform.modelToViewPosition( new Vector2( x, y ) ) );
    }

    function updateRepresentation( newOpacity ) {

      let size;
      let representationShape;

      assert && assert( particle.getType() === ParticleType.SODIUM_ION || particle.getType() === ParticleType.POTASSIUM_ION );

      switch( particle.getType() ) {
        case ParticleType.SODIUM_ION:
          var transformedRadius = modelViewTransform.modelToViewDeltaX( particle.getRadius() );
          representationShape = new Shape().ellipse( 0, 0, transformedRadius, transformedRadius );
          break;

        case ParticleType.POTASSIUM_ION:
          size = modelViewTransform.modelToViewDeltaX( particle.getRadius() * 2 ) * 0.85;
          representationShape = new Shape().rect( -size / 2, -size / 2, size, size );
          var rotationTransform = Matrix3.rotationAround( Math.PI / 4, 0, 0 );
          representationShape = representationShape.transformed( rotationTransform );
          break;

        default:
          var defaultSphereRadius = modelViewTransform.modelToViewDeltaX( particle.getRadius() );
          representationShape = new Shape().ellipse( 0, 0, defaultSphereRadius, defaultSphereRadius );
          break;
      }

      representation.setShape( representationShape );
      representation.fill = particle.getRepresentationColor();
      self.setOpacity( newOpacity );
    }

    updateOffset( particle.getPositionX(), particle.getPositionY() );
    updateRepresentation( particle.getOpacity() );
  }

  neuron.register( 'ParticleNode', ParticleNode );

  return inherit( Node, ParticleNode );
} );

