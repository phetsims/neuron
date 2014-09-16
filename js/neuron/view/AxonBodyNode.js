//// Copyright 2002-2011, University of Colorado
/**
 * Representation of the axon membrane body in the view.  This is the part
 * that the action potential travels along, and is supposed to look sort of
 * 3D.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';
  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Color = require( 'SCENERY/util/Color' );
  var Vector2 = require( 'DOT/Vector2' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );


  var AXON_BODY_COLOR = new Color( 221, 216, 44 );
  var LINE_WIDTH = 2;// STROKE
  var SHOW_GRADIENT_LINE = false;

  /**
   * Constructor for the AxonBodyNode
   * @param {NeuronModel} axonMembraneModel
   * @param {ModelViewTransform2} transform
   * @constructor
   */
  function AxonBodyNode( axonMembraneModel, transform ) {
    var thisNode = this;
    Node.call( thisNode, {} );
    thisNode.axonMembraneModel = axonMembraneModel;
    thisNode.mvt = transform;


    // Listen to the axon membrane for events that matter to the visual
    // representation. TODO


    // Add the axon body.
    var axonBodyShape = thisNode.mvt.modelToViewShape( axonMembraneModel.axonBodyShape );
    var axonBodyBounds = axonBodyShape.bounds;
    var crossSectionBounds = thisNode.mvt.modelToViewShape( axonMembraneModel.getCrossSectionEllipseShape() ).bounds;
    var gradientOrigin = new Vector2( axonBodyBounds.getMaxX(), axonBodyBounds.getMaxY() );
    var gradientExtent = new Vector2( crossSectionBounds.getCenterX(), crossSectionBounds.getY() );
    var axonBodyGradient = new LinearGradient( gradientOrigin.x, gradientOrigin.y, gradientExtent.x, gradientExtent.y );
    axonBodyGradient.addColorStop( 0, AXON_BODY_COLOR.darkerColor( 0.5 ) );
    axonBodyGradient.addColorStop( 1, AXON_BODY_COLOR.brighterColor( 0.5 ) );

    var axonBody = new Path( axonBodyShape, {
      fill: axonBodyGradient,
      stroke: 'black',
      lineWidth: LINE_WIDTH
    } );
    thisNode.addChild( axonBody );

    if ( SHOW_GRADIENT_LINE ) {
      // The following line is useful when trying to debug the gradient.
      thisNode.addChild( new Line( gradientOrigin, gradientExtent ) );
    }
  }


  return inherit( Node, AxonBodyNode );
} )
;
//
//package edu.colorado.phet.neuron.view;
//
//import java.awt.BasicStroke;
//import java.awt.Color;
//import java.awt.GradientPaint;
//import java.awt.Shape;
//import java.awt.Stroke;
//import java.awt.geom.Line2D;
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform2D;
//import edu.colorado.phet.common.phetcommon.view.util.ColorUtils;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.colorado.phet.neuron.model.AxonMembrane;
//import edu.colorado.phet.neuron.model.AxonMembrane.TravelingActionPotential;
//import edu.umd.cs.piccolo.PNode;
//
///**
// * Representation of the axon membrane body in the view.  This is the part
// * that the action potential travels along, and is supposed to look sort of
// * 3D.
// *
// * @author John Blanco
// */
//public class AxonBodyNode extends PNode {
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------
//

//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//
//  private AxonMembrane axonMembraneModel;
//  private ModelViewTransform2D mvt;
//  private PhetPPath axonBody;
//  private TravelingActionPotentialNode travelingActionPotentialNode;
//
//  //----------------------------------------------------------------------------
//  // Constructor(s)
//  //----------------------------------------------------------------------------
//
//  public AxonBodyNode( AxonMembrane axonMembraneModel, ModelViewTransform2D transform ) {

//
//    // Listen to the axon membrane for events that matter to the visual
//    // representation.
//    axonMembraneModel.addListener(new AxonMembrane.Adapter() {
//
//      public void travelingActionPotentialStarted() {
//        addTravelingActionPotentialNode(AxonBodyNode.this.axonMembraneModel.getTravelingActionPotential());
//      }
//
//      public void travelingActionPotentialEnded() {
//        removeTravelingActionPotentialNode();
//      }
//    });
//

//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------
//
//  /**
//   * Add the node that will represent the traveling action potential.
//   *
//   * @param travelingActionPotential
//   */
//  private void addTravelingActionPotentialNode(TravelingActionPotential travelingActionPotential){
//    this.travelingActionPotentialNode = new TravelingActionPotentialNode(travelingActionPotential, mvt);
//    addChild(travelingActionPotentialNode);
//  }
//
//  /**
//   * Remove the node that was representing the traveling action potential.
//   */
//  private void removeTravelingActionPotentialNode(){
//    removeChild(travelingActionPotentialNode);
//    travelingActionPotentialNode = null;
//  }
//
//  //----------------------------------------------------------------------------
//  // Inner Classes, Interfaces, etc.
//  //----------------------------------------------------------------------------
//
//  /**
//   * Class that visually represents the action potential that travels down
//   * the membrane prior to reaching the cross section.
//   */
//  private static class TravelingActionPotentialNode extends PNode {
//
//    private static Color BACKGROUND_COLOR = new Color(204, 102, 255);
//    private static Stroke backgroundStroke = new BasicStroke(20, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND);
//    private static Color FOREGROUND_COLOR = Color.YELLOW;
//    private static Stroke foregroundStroke = new BasicStroke(10, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND);
//
//    private AxonMembrane.TravelingActionPotential travelingActionPotential;
//    private ModelViewTransform2D mvt;
//    private PhetPPath background = new PhetPPath(backgroundStroke, BACKGROUND_COLOR);
//    private PhetPPath foreground = new PhetPPath(foregroundStroke, FOREGROUND_COLOR);
//
//    public TravelingActionPotentialNode(AxonMembrane.TravelingActionPotential travelingActionPotential, ModelViewTransform2D mvt) {
//
//      addChild(background);
//      addChild(foreground);
//
//      this.travelingActionPotential = travelingActionPotential;
//      this.mvt = mvt;
//
//      // Listen to the action potential
//      travelingActionPotential.addListener(new AxonMembrane.TravelingActionPotential.Adapter(){
//        public void shapeChanged() {
//          updateShape();
//        }
//      });
//
//      // Set the initial shape.
//      updateShape();
//    }
//
//    private void updateShape(){
//      foreground.setPathTo(mvt.createTransformedShape(travelingActionPotential.getShape()));
//      background.setPathTo(mvt.createTransformedShape(travelingActionPotential.getShape()));
//    }
//  }
//}
