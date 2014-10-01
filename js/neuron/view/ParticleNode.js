// Copyright 2002-2011, University of Colorado
/**
 * Class that represents particles (generally ions) in the view.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var Matrix3 = require( 'DOT/Matrix3' );


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
    var representation = new Path( new Shape(), {lineWidth: PARTICLE_EDGE_STROKE, stroke: Color.BLACK} );
    thisNode.addChild( representation );

    function updateOffset( newPosition ) {
      thisNode.translate( modelViewTransform.modelToViewPosition( newPosition ) );
    }

    function updateRepresentation( newOpaqueness ) {

      var size;
      var representationShape;

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
          console.log( particle.getType() + " - Warning: No specific shape for this particle type, defaulting to sphere." );
          var defaultSphereRadius = modelViewTransform.modelToViewDeltaX( particle.getRadius() );
          representationShape = new Shape().ellipse( 0, 0, defaultSphereRadius, defaultSphereRadius );
          break;
      }

      representation.setShape( representationShape );
      representation.fill = particle.getRepresentationColor();
      thisNode.setOpacity( newOpaqueness );
    }

    updateOffset( particle.getPosition() );
    updateRepresentation( particle.getOpaqueness() );
  }

  return inherit( Node, ParticleNode, {

  } );
} );

//public class ParticleNode extends PNode {
//
//  private static final float STROKE_WIDTH = 1;
//  private static final Stroke PARTICLE_EDGE_STROKE = new BasicStroke(STROKE_WIDTH);
//
//  private IViewableParticle particle;
//  private ModelViewTransform2D modelViewTransform;
//  private PPath representation;
//
//  public ParticleNode( IViewableParticle particle, ModelViewTransform2D modelViewTransform ) {
//
//    this.particle = particle;
//    this.modelViewTransform = modelViewTransform;
//
//    // Listen to the particle for things that we care about.
//    particle.addListener(new ParticleListenerAdapter() {
//      public void positionChanged() {
//        updateOffset();
//      }
//      public void appearanceChanged() {
//        updateRepresentation();
//      }
//    });
//
//    // Create the initial representation with the aspects that don't change.
//    representation = new PhetPPath(PARTICLE_EDGE_STROKE, Color.BLACK);
//    addChild( representation );
//
//    updateOffset();
//    updateRepresentation();
//  }
//
//  private void updateOffset() {
//    setOffset( modelViewTransform.modelToView( particle.getPosition() ));
//  }
//
//  private void updateRepresentation(){
//    double size;
//    Shape representationShape;
//
//    switch (particle.getType()){
//      case SODIUM_ION:
//        double transformedRadius = modelViewTransform.modelToViewDifferentialXDouble(particle.getRadius());
//        representationShape = new Ellipse2D.Double(-transformedRadius, -transformedRadius, transformedRadius * 2,
//            transformedRadius * 2);
//        break;
//
//      case POTASSIUM_ION:
//        size = modelViewTransform.modelToViewDifferentialXDouble(particle.getRadius() * 2) * 0.85;
//        representationShape = new Rectangle2D.Double(-size/2, -size/2, size, size);
//        representationShape =
//        AffineTransform.getRotateInstance( Math.PI / 4 ).createTransformedShape( representationShape );
//        break;
//
//      default:
//        System.err.println(getClass().getName() + " - Warning: No specific shape for this particle type, defaulting to sphere.");
//        double defaultSphereRadius = modelViewTransform.modelToViewDifferentialXDouble(particle.getRadius());
//        representationShape = new Ellipse2D.Double(-defaultSphereRadius, -defaultSphereRadius,
//            defaultSphereRadius * 2, defaultSphereRadius * 2);
//        break;
//    }
//
//    representation.setPathTo( representationShape );
//    representation.setPaint( particle.getRepresentationColor() );
//    setTransparency((float)(particle.getOpaqueness()));
//  }
//
//  /**
//   * This override is here as a workaround for an issue where the edges of
//   * the representation were being cut off when converted to an image.  This
//   * is a known bug with PPath.getBounds.  This might need to be removed if
//   * the bug in PPath is ever fixed.
//   */
//  @Override
//  public Image toImage() {
//    PPath parentNode = new PPath();
//    parentNode.addChild(this);
//    parentNode.setPaint(new Color(0, 0, 0, 0));
//    parentNode.setStroke(null);
//    double pad = 2;
//    parentNode.setPathTo(new Rectangle2D.Double(this.getFullBoundsReference().x - pad,
//        this.getFullBoundsReference().y - pad,
//        this.getFullBoundsReference().width + pad * 2 + STROKE_WIDTH / 2,
//        this.getFullBoundsReference().height + pad * 2 + STROKE_WIDTH / 2));
//
//    return parentNode.toImage();
//  }
//}
