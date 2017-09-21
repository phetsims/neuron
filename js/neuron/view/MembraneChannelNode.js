// Copyright 2014-2017, University of Colorado Boulder
/**
 * Node that represents a membrane channel in the view, currently used only for drawing Membrane channel legends
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {MembraneChannel} membraneChannelModel
   * @param {ModelViewTransform2D} mvt
   * @constructor
   */
  function MembraneChannelNode( membraneChannelModel, mvt ) {
    var self = this;
    Node.call( this, {} );
    this.membraneChannelModel = membraneChannelModel;
    this.mvt = mvt;

    /**
     *  @private
     *  @param {Dimension2D} size
     *  @param {Color} color
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

      return new Path( shape, { fill: color, stroke: color.colorUtilsDarker( 0.3 ), lineWidth: 0.4 } );
    }

    var stringShape;
    var channelPath;

    // Create the channel representation.
    var channel = new Path( new Shape(), { fill: membraneChannelModel.getChannelColor(), lineWidth: 0 } );

    // Skip bounds computation to improve performance
    channel.computeShapeBounds = function() {return new Bounds2( 0, 0, 0, 0 );};

    // Create the edge representations.
    var edgeNodeWidth = (membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width) / 2;
    var edgeNodeHeight = membraneChannelModel.overallSize.height;
    var transformedEdgeNodeSize = new Dimension2( Math.abs( mvt.modelToViewDeltaX( edgeNodeWidth ) ), Math.abs( mvt.modelToViewDeltaY( edgeNodeHeight ) ) );
    var leftEdgeNode = createEdgeNode( transformedEdgeNodeSize, membraneChannelModel.getEdgeColor() );
    var rightEdgeNode = createEdgeNode( transformedEdgeNodeSize, membraneChannelModel.getEdgeColor() );

    // Create the layers for the channel the edges.  This makes offsets and rotations easier.  See addToCanvas on why
    // node layer is an instance member.
    this.channelLayer = new Node();
    this.addChild( this.channelLayer );
    this.channelLayer.addChild( channel );
    this.edgeLayer = new Node();
    this.addChild( this.edgeLayer );
    this.edgeLayer.addChild( leftEdgeNode );
    this.edgeLayer.addChild( rightEdgeNode );

    // gets created and updated only if channel has InactivationGate
    var inactivationGateBallNode;
    var inactivationGateString;
    var edgeColor = membraneChannelModel.getEdgeColor().colorUtilsDarker( 0.3 );

    if ( membraneChannelModel.getHasInactivationGate() ) {

      // Add the ball and string that make up the inactivation gate.
      inactivationGateString = new Path( new Shape(), { lineWidth: 0.5, stroke: Color.BLACK } );

      // Skip bounds computation to improve performance
      inactivationGateString.computeShapeBounds = function() {return new Bounds2( 0, 0, 0, 0 );};
      this.channelLayer.addChild( inactivationGateString );

      var ballDiameter = mvt.modelToViewDeltaX( membraneChannelModel.getChannelSize().width );

      // inactivationBallShape is always a circle, so use the optimized version.
      inactivationGateBallNode = new Circle( ballDiameter / 2, { fill: edgeColor, lineWidth: 0.5, stroke: edgeColor } );
      this.edgeLayer.addChild( inactivationGateBallNode );
    }

    //private
    function updateRepresentation() {

      // Set the channel width as a function of the openness of the membrane channel.
      var channelWidth = membraneChannelModel.getChannelSize().width * membraneChannelModel.getOpenness();
      var channelSize = new Dimension2( channelWidth, membraneChannelModel.getChannelSize().height );
      var transformedChannelSize = new Dimension2( Math.abs( mvt.modelToViewDeltaX( channelSize.width ) ), Math.abs( mvt.modelToViewDeltaY( channelSize.height ) ) );

      // Make the node a bit bigger than the channel so that the edges can be placed over it with no gaps.
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
       The Java Version uses computed bounds which is a bit expensive, the current x and y coordinates of the channel
       is manually calculated. This allows for providing a customized computedBounds function.
       Kept this code for reference. Ashraf
       var channelBounds = channel.getBounds();
       channel.x = -channelBounds.width / 2;
       channel.y = -channelBounds.height / 2;
       */

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
        var angle = -Math.PI / 2 * (1 - membraneChannelModel.getInactivationAmount());
        var radius = (1 - membraneChannelModel.getInactivationAmount()) * transformedOverallSize.width / 2 + membraneChannelModel.getInactivationAmount() * channelEdgeConnectionPoint.distance( channelCenterBottomPoint );

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
      self.channelLayer.translate( mvt.modelToViewPosition( membraneChannelModel.getCenterLocation() ) );
      self.edgeLayer.translate( mvt.modelToViewPosition( membraneChannelModel.getCenterLocation() ) );
    }

    function updateRotation() {
      // Rotate based on the model element's orientation (the Java Version rotates and then translates, here the
      // transformation order is reversed - Ashraf).
      self.channelLayer.setRotation( -membraneChannelModel.rotationalAngle + Math.PI / 2 );
      self.edgeLayer.setRotation( -membraneChannelModel.rotationalAngle + Math.PI / 2 );
    }

    // Update the representation and location.
    updateRepresentation();
    updateLocation();
    updateRotation();
  }

  neuron.register( 'MembraneChannelNode', MembraneChannelNode );

  return inherit( Node, MembraneChannelNode, {

    /**
     * Add this node to the two specified parent nodes.  This is done in order to achieve a better layering effect that
     * allows particles to look more like they are moving through the channel.  It is not absolutely necessary to use
     * this method for this node - it can be added to the canvas like any other PNode, it just won't have the layering.
     * @public
     */
    addToCanvas: function( channelLayer, edgeLayer ) {
      channelLayer.addChild( this.channelLayer );
      edgeLayer.addChild( this.edgeLayer );//Membrane channel maintains its own layer of 2 edge nodes
    },

    // @public
    removeFromCanvas: function( channelLayer, edgeLayer ) {
      channelLayer.removeChild( this.channelLayer );
      edgeLayer.removeChild( this.edgeLayer );
    }

  } );
} );
