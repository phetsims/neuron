// Copyright 2002-2015, University of Colorado Boulder
/**
 * Class that represents particles (generally ions) in the view.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var PARTICLE_EDGE_STROKE = 1;

  /**
   * @param {ViewableParticle} particle
   * @param {ModelViewTransform2D} modelViewTransform
   * @constructor
   */
  function ParticleNode( particle, modelViewTransform ) {
    var thisNode = this;
    Node.call( this, {} );
    thisNode.particle = particle;
    thisNode.modelViewTransform = modelViewTransform;

    // Create the initial representation with the aspects that don't change.
    var representation = new Path( new Shape(), { lineWidth: PARTICLE_EDGE_STROKE, stroke: Color.BLACK } );
    thisNode.addChild( representation );

    function updateOffset( x, y ) {
      thisNode.translate( modelViewTransform.modelToViewPosition( new Vector2( x, y ) ) );
    }

    function updateRepresentation( newOpacity ) {

      var size;
      var representationShape;

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
      thisNode.setOpacity( newOpacity );
    }

    updateOffset( particle.getPositionX(), particle.getPositionY() );
    updateRepresentation( particle.getOpacity() );
  }

  return inherit( Node, ParticleNode, {} );
} );

