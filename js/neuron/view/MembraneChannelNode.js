// Copyright 2002-2011, University of Colorado
/**
 * Node that represents a membrane channel in the view.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';
  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );

  /**
   * @param {MembraneChannel} membraneChannelModel
   * @param {ModelViewTransform2D} mvt
   * @constructor
   */
  function MembraneChannelNode( membraneChannelModel, mvt ) {
    var thisNode = this;
    Node.call( thisNode, {} );
    thisNode.membraneChannelModel = membraneChannelModel;
    thisNode.mvt = mvt;

    /**
     *  private
     *  @param{Dimension2D} size
     *  @param{Color} color
     */
    function createEdgeNode( size, color ) {
      var shape = new Shape();
      var width = size.width;
      var height = size.height;

      shape.moveTo( -width / 2, height / 4 );
      shape.cubicCurveTo( -width / 2, height / 2, width / 2, height / 2, width / 2, height / 4 );
      shape.lineTo( width / 2, -height / 4 );
      shape.cubicCurveTo( width / 2, -height / 2, -width / 2, -height / 2, -width / 2, -height / 4 );
      shape.close();

      var edgeNode = new Path( shape, {fill: color, stroke: color.colorUtilsDarker( 0.3 ), lineWidth: 0.4} );
      return edgeNode;
    }

    var stringShape;
    var channelPath;

    // Create the channel representation.
    var channel = new Path( new Shape(), {fill: membraneChannelModel.getChannelColor(), lineWidth: 0} );

    // Skip bounds computation to improve performance
    channel.computeShapeBounds = function() {return new Bounds2( 0, 0, 0, 0 );};
    // Create the edge representations.
    var edgeNodeWidth = (membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width) / 2;
    var edgeNodeHeight = membraneChannelModel.overallSize.height;
    var transformedEdgeNodeSize = new Dimension2( Math.abs( mvt.modelToViewDeltaX( edgeNodeWidth ) ), Math.abs( mvt.modelToViewDeltaY( edgeNodeHeight ) ) );
    var leftEdgeNode = createEdgeNode( transformedEdgeNodeSize, membraneChannelModel.getEdgeColor() );
    var rightEdgeNode = createEdgeNode( transformedEdgeNodeSize, membraneChannelModel.getEdgeColor() );

    // Create the layers for the channel the edges.  This makes offsets
    // and rotations easier.see addToCanvas on why node layer is a instance member
    thisNode.channelLayer = new Node();
    thisNode.addChild( thisNode.channelLayer );
    thisNode.channelLayer.addChild( channel );
    thisNode.edgeLayer = new Node();
    thisNode.addChild( thisNode.edgeLayer );
    thisNode.edgeLayer.addChild( leftEdgeNode );
    thisNode.edgeLayer.addChild( rightEdgeNode );

    //gets created and updated only if channel has InactivationGate
    var inactivationGateBallNode;
    var inactivationGateString;
    var edgeColor = membraneChannelModel.getEdgeColor().colorUtilsDarker( 0.3 );


    if ( membraneChannelModel.getHasInactivationGate() ) {

      // Add the ball and string that make up the inactivation gate.
      inactivationGateString = new Path( new Shape(), {lineWidth: 0.5, stroke: Color.BLACK} );
      // Skip bounds computation to improve performance
      inactivationGateString.computeShapeBounds = function() {return new Bounds2( 0, 0, 0, 0 );};
      thisNode.channelLayer.addChild( inactivationGateString );

      var ballDiameter = mvt.modelToViewDeltaX( membraneChannelModel.getChannelSize().width );

      // inactivationBallShape is always a circle, so use the optimized version.
      inactivationGateBallNode = new Circle( ballDiameter / 2, {fill: edgeColor, lineWidth: 0.5, stroke: edgeColor} );
      thisNode.edgeLayer.addChild( inactivationGateBallNode );
    }

    //private
    function updateRepresentation() {

      // Set the channel width as a function of the openness of the membrane channel.
      var channelWidth = membraneChannelModel.getChannelSize().width * membraneChannelModel.getOpenness();
      var channelSize = new Dimension2( channelWidth, membraneChannelModel.getChannelSize().height );
      var transformedChannelSize = new Dimension2( Math.abs( mvt.modelToViewDeltaX( channelSize.width ) ), Math.abs( mvt.modelToViewDeltaY( channelSize.height ) ) );

      // Make the node a bit bigger than the channel so that the edges can
      // be placed over it with no gaps.
      var oversizeFactor = 1.2; // was 1.1 in Java

      var width = transformedChannelSize.width * oversizeFactor;
      var height = transformedChannelSize.height * oversizeFactor;
      var edgeNodeBounds = leftEdgeNode.getBounds();
      var edgeWidth = edgeNodeBounds.width; // Assume both edges are the same size.

      channelPath = new Shape();
      channelPath.moveTo( 0, 0 );
      channelPath.quadraticCurveTo( (width + edgeWidth) / 2, height / 8, width + edgeWidth, 0 );
      channelPath.lineTo( width + edgeWidth, height );
      channelPath.quadraticCurveTo( (width + edgeWidth) / 2, height * 7 / 8, 0, height );
      channelPath.close();
      channel.setShape( channelPath );

      /*
       The Java Version uses computed bounds which is bit expensive, the current x and y
       coordinates of the channel is manually calculated. This allows for providing a customized computedBounds function.
       Kept this code for reference. Ashraf
       var channelBounds = channel.getBounds();
       channel.x = -channelBounds.width / 2;
       channel.y = -channelBounds.height / 2; */

      channel.x = -(width + edgeWidth) / 2;
      channel.y = -height / 2;

      leftEdgeNode.x = -transformedChannelSize.width / 2 - edgeNodeBounds.width / 2;
      leftEdgeNode.y = 0;
      rightEdgeNode.x = transformedChannelSize.width / 2 + edgeNodeBounds.width / 2;
      rightEdgeNode.y = 0;

      // If this membrane channel has an inactivation gate, update it.
      if ( membraneChannelModel.getHasInactivationGate() ) {

        var transformedOverallSize =
          new Dimension2( mvt.modelToViewDeltaX( membraneChannelModel.getOverallSize().width ),
            mvt.modelToViewDeltaY( membraneChannelModel.getOverallSize().height ) );

        // Position the ball portion of the inactivation gate.
        var channelEdgeConnectionPoint = new Vector2( leftEdgeNode.centerX,
          leftEdgeNode.getBounds().getMaxY() );
        var channelCenterBottomPoint = new Vector2( 0, transformedChannelSize.height / 2 );
        var angle = -Math.PI / 2 * (1 - membraneChannelModel.getInactivationAmt());
        var radius = (1 - membraneChannelModel.getInactivationAmt()) * transformedOverallSize.width / 2 + membraneChannelModel.getInactivationAmt() * channelEdgeConnectionPoint.distance( channelCenterBottomPoint );

        var ballPosition = new Vector2( channelEdgeConnectionPoint.x + Math.cos( angle ) * radius,
            channelEdgeConnectionPoint.y - Math.sin( angle ) * radius );
        inactivationGateBallNode.x = ballPosition.x;
        inactivationGateBallNode.y = ballPosition.y;

        // Redraw the "string" (actually a strand of protein in real life)
        // that connects the ball to the gate.
        var ballConnectionPoint = new Vector2( inactivationGateBallNode.x, inactivationGateBallNode.y );

        var connectorLength = channelCenterBottomPoint.distance( ballConnectionPoint );
        stringShape = new Shape().moveTo( channelEdgeConnectionPoint.x, channelEdgeConnectionPoint.y )
          .cubicCurveTo( channelEdgeConnectionPoint.x + connectorLength * 0.25,
            channelEdgeConnectionPoint.y + connectorLength * 0.5, ballConnectionPoint.x - connectorLength * 0.75,
            ballConnectionPoint.y - connectorLength * 0.5, ballConnectionPoint.x, ballConnectionPoint.y );
        inactivationGateString.setShape( stringShape );
      }

    }


    function updateLocation() {
      thisNode.channelLayer.translate( mvt.modelToViewPosition( membraneChannelModel.getCenterLocation() ) );
      thisNode.edgeLayer.translate( mvt.modelToViewPosition( membraneChannelModel.getCenterLocation() ) );
    }

    function updateRotation() {
      // Rotate based on the model element's orientation. (The Java Version rotates and then translates, here the transformation order is reversed Ashraf)
      thisNode.channelLayer.setRotation( -membraneChannelModel.rotationalAngle + Math.PI / 2 );
      thisNode.edgeLayer.setRotation( -membraneChannelModel.rotationalAngle + Math.PI / 2 );
    }

    // Update the representation and location.
    updateRepresentation();
    updateLocation();
    updateRotation();


  }

  return inherit( Node, MembraneChannelNode, {
    /**
     * Add this node to the two specified parent nodes.  This is done in order
     * to achieve a better layering effect that allows particles to look
     * more like they are moving through the channel.  It is not absolutely
     * necessary to use this method for this node - it can be added to the
     * canvas like any other PNode, it just won't have the layering.
     * @param channelLayer
     * @param edgeLayer
     *
     * */
    addToCanvas: function( channelLayer, edgeLayer ) {
      channelLayer.addChild( this.channelLayer );
      edgeLayer.addChild( this.edgeLayer );//Membrane channel maintains its own layer of 2 edge nodes
    },
    removeFromCanvas: function( channelLayer, edgeLayer ) {
      channelLayer.removeChild( this.channelLayer );
      edgeLayer.removeChild( this.edgeLayer );
    }
  } );

} );
//
//package edu.colorado.phet.neuron.view;
//
//import java.awt.BasicStroke;
//import java.awt.Color;
//import java.awt.Shape;
//import java.awt.geom.CubicCurve2D;
//import java.awt.geom.Dimension2D;
//import java.awt.geom.Ellipse2D;
//import java.awt.geom.GeneralPath;
//import java.awt.geom.Point2D;
//
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform2D;
//import edu.colorado.phet.common.phetcommon.view.util.ColorUtils;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.colorado.phet.neuron.model.MembraneChannel;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolo.nodes.PPath;
//import edu.umd.cs.piccolo.util.PDimension;
//
///**
// * Node that represents a membrane channel in the view.
// *
// * @author John Blanco
// */
//public class MembraneChannelNode extends PNode{
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------
//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------

//  private PNode channelLayer;
//  private PNode edgeLayer;
//  private PPath channel;
//  private PPath leftEdgeNode;
//  private PPath rightEdgeNode;
//  private PNode inactivationGateBallNode;
//  private PPath inactivationGateString;
//
//  //----------------------------------------------------------------------------
//  // Constructor
//  //----------------------------------------------------------------------------
//
//  /**
//   * Constructor.  Note that the parent nodes are passed in so that the
//   * layering appearance can be better controlled.
//   */
//  public MembraneChannelNode(MembraneChannel membraneChannelModel, ModelViewTransform2D mvt){
//
//    this.membraneChannelModel = membraneChannelModel;
//    this.mvt = mvt;
//
//    // Listen to the channel for changes that may affect the representation.
//    membraneChannelModel.addListener(new MembraneChannel.Adapter(){
//      public void opennessChanged() {
//        updateRepresentation();
//      }
//      public void inactivationAmtChanged() {
//        updateRepresentation();
//      }
//      public void positionChanged() {
//        updateLocation();
//      }
//    });
//
//    // Create the channel representation.
//    channel = new PhetPPath(membraneChannelModel.getChannelColor());
//
//    // Create the edge representations.
//    double edgeNodeWidth = (membraneChannelModel.getOverallSize().getWidth() -
//                            membraneChannelModel.getChannelSize().getWidth()) / 2;
//    double edgeNodeHeight = membraneChannelModel.getOverallSize().getHeight();
//    Dimension2D transformedEdgeNodeSize = new PDimension(
//      Math.abs(mvt.modelToViewDifferentialXDouble(edgeNodeWidth)),
//      Math.abs(mvt.modelToViewDifferentialYDouble(edgeNodeHeight)));
//    leftEdgeNode = createEdgeNode(transformedEdgeNodeSize, membraneChannelModel.getEdgeColor());
//    rightEdgeNode = createEdgeNode(transformedEdgeNodeSize, membraneChannelModel.getEdgeColor());
//
//    // Create the layers for the channel the edges.  This makes offsets
//    // and rotations easier.
//    channelLayer = new PNode();
//    addChild(channelLayer);
//    channelLayer.addChild(channel);
//    edgeLayer = new PNode();
//    addChild(edgeLayer);
//    edgeLayer.addChild(leftEdgeNode);
//    edgeLayer.addChild(rightEdgeNode);
//
//    if (membraneChannelModel.getHasInactivationGate()){
//
//      // Add the ball and string that make up the inactivation gate.
//
//      inactivationGateString = new PhetPPath(new BasicStroke(2f), Color.BLACK);
//      channelLayer.addChild(inactivationGateString);
//
//      double ballDiameter = mvt.modelToViewDifferentialXDouble(membraneChannelModel.getChannelSize().getWidth());
//      Shape inactivationBallShape =
//            new Ellipse2D.Double(-ballDiameter / 2, -ballDiameter / 2, ballDiameter, ballDiameter);
//      inactivationGateBallNode = new PhetPPath(
//        inactivationBallShape,
//        ColorUtils.darkerColor(membraneChannelModel.getEdgeColor(), 0.3),
//        new BasicStroke(1f),
//      ColorUtils.darkerColor(membraneChannelModel.getEdgeColor(), 0.3));
//      edgeLayer.addChild(inactivationGateBallNode);
//    }
//
//    // Update the representation and location.
//    updateRepresentation();
//    updateLocation();
//  }
//
//  /**
//   * Add this node to the two specified parent nodes.  This is done in order
//   * to achieve a better layering effect that allows particles to look
//   * more like they are moving through the channel.  It is not absolutely
//   * necessary to use this method for this node - it can be added to the
//   * canvas like any other PNode, it just won't have the layering.
//   *
//   * @param channelLayer
//   * @param edgeLayer
//   */
//  public void addToCanvas(PNode channelLayer, PNode edgeLayer){
//    channelLayer.addChild(this.channelLayer);
//    edgeLayer.addChild(this.edgeLayer);
//  }
//
//  public void removeFromCanvas(PNode channelLayer, PNode edgeLayer){
//    channelLayer.removeChild(this.channelLayer);
//    edgeLayer.removeChild(this.edgeLayer);
//  }
//
//  private PPath createEdgeNode(Dimension2D size, Color color){
//
//    GeneralPath path = new GeneralPath();
//
//    float width = (float)size.getWidth();
//    float height = (float)size.getHeight();
//
//    path.moveTo(-width / 2, height / 4);
//    path.curveTo(-width / 2, height / 2, width / 2, height / 2, width / 2, height / 4);
//    path.lineTo(width / 2, -height / 4);
//    path.curveTo(width / 2, -height / 2, -width / 2, -height / 2, -width / 2, -height / 4);
//    path.closePath();
//
//    PPath edgeNode = new PPath(path);
//    edgeNode.setPaint(color);
//    edgeNode.setStrokePaint(ColorUtils.darkerColor(color, 0.3));
//
//    return edgeNode;
//  }
//
//  private void updateLocation(){
//    channelLayer.setOffset(mvt.modelToViewDouble(membraneChannelModel.getCenterLocation()));
//    edgeLayer.setOffset(mvt.modelToViewDouble(membraneChannelModel.getCenterLocation()));
//  }
//
//  private void updateRepresentation(){
//
//    // Set the channel width as a function of the openness of the membrane channel.
//    double channelWidth = membraneChannelModel.getChannelSize().getWidth() * membraneChannelModel.getOpenness();
//    Dimension2D channelSize = new PDimension(
//      channelWidth,
//      membraneChannelModel.getChannelSize().getHeight());
//    Dimension2D transformedChannelSize = new PDimension(
//      Math.abs(mvt.modelToViewDifferentialXDouble(channelSize.getWidth())),
//      Math.abs(mvt.modelToViewDifferentialYDouble(channelSize.getHeight())));
//
//    // Make the node a bit bigger than the channel so that the edges can
//    // be placed over it with no gaps.
//    float oversizeFactor = 1.1f;
//
//    float width = (float)transformedChannelSize.getWidth() * oversizeFactor;
//    float height = (float)transformedChannelSize.getHeight() * oversizeFactor;
//    float edgeWidth = (float)leftEdgeNode.getFullBoundsReference().width; // Assume both edges are the same size.
//
//    GeneralPath path = new GeneralPath();
//    path.moveTo(0, 0);
//    path.quadTo((width + edgeWidth) / 2, height / 8, width + edgeWidth, 0);
//    path.lineTo(width + edgeWidth, height);
//    path.quadTo((width + edgeWidth) / 2, height * 7 / 8, 0, height);
//    path.closePath();
//
//    channel.setPathTo(path);
//    channel.setOffset(-channel.getFullBoundsReference().width / 2, -channel.getFullBoundsReference().height / 2);
//
//    leftEdgeNode.setOffset(
//        -transformedChannelSize.getWidth() / 2 - leftEdgeNode.getFullBoundsReference().width / 2, 0);
//
//    rightEdgeNode.setOffset(
//        transformedChannelSize.getWidth() / 2 + rightEdgeNode.getFullBoundsReference().width / 2, 0);
//
//    // If this membrane channel has an inactivation gate, update it.
//    if (membraneChannelModel.getHasInactivationGate()){
//
//      PDimension transformedOverallSize =
//                 new PDimension( mvt.modelToViewDifferentialXDouble(membraneChannelModel.getOverallSize().getWidth()),
//                   mvt.modelToViewDifferentialYDouble(membraneChannelModel.getOverallSize().getHeight()));
//
//      // Position the ball portion of the inactivation gate.
//      Point2D channelEdgeConnectionPoint = new Point2D.Double(leftEdgeNode.getFullBoundsReference().getCenterX(),
//        leftEdgeNode.getFullBoundsReference().getMaxY());
//      Point2D channelCenterBottomPoint = new Point2D.Double(0,
//          transformedChannelSize.getHeight() / 2);
//      double angle = -Math.PI / 2 * (1 - membraneChannelModel.getInactivationAmt());
//      double radius = (1 - membraneChannelModel.getInactivationAmt()) * transformedOverallSize.getWidth() / 2
//        + membraneChannelModel.getInactivationAmt() * channelEdgeConnectionPoint.distance(channelCenterBottomPoint);
//      Point2D ballPosition = new Point2D.Double(channelEdgeConnectionPoint.getX() + Math.cos(angle) * radius,
//          channelEdgeConnectionPoint.getY() - Math.sin(angle) * radius);
//      inactivationGateBallNode.setOffset(ballPosition);
//
//      // Redraw the "string" (actually a strand of protein in real life)
//      // that connects the ball to the gate.
//      Point2D ballConnectionPoint = inactivationGateBallNode.getOffset();
//
//      double connectorLength = channelCenterBottomPoint.distance(ballConnectionPoint);
//      Shape stringShape = new CubicCurve2D.Double(
//        channelEdgeConnectionPoint.getX(),
//        channelEdgeConnectionPoint.getY(),
//          channelEdgeConnectionPoint.getX() + connectorLength * 0.25,
//          channelEdgeConnectionPoint.getY() + connectorLength * 0.5,
//          ballConnectionPoint.getX() - connectorLength * 0.75,
//          ballConnectionPoint.getY() - connectorLength * 0.5,
//        ballConnectionPoint.getX(),
//        ballConnectionPoint.getY() );
//      inactivationGateString.setPathTo(stringShape);
//    }
//
//    // Rotate based on the model element's orientation.
//    channelLayer.setRotation(-membraneChannelModel.getRotationalAngle() + Math.PI / 2);
//    edgeLayer.setRotation(-membraneChannelModel.getRotationalAngle() + Math.PI / 2);
//  }
//}
