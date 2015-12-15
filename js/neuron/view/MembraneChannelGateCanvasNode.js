// Copyright 2014-2015, University of Colorado Boulder
/**
 * The dynamic parts of the Membrane Channels, namely the gate, channel expansion, and string, are rendered directly on
 * a single canvas for optimal performance.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var kite = require( 'KITE/kite' );
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var Color = require( 'SCENERY/util/Color' );

  // utility function for drawing the shape that depicts the edge or side of a membrane channel
  function drawEdge( context, transformedEdgeNodeSize ) {

    // Instead of passing the transformedEdgeNodeSize, the updateEdgeShape function updates the transformedEdgeNodeSize
    var width = transformedEdgeNodeSize.width;
    var height = transformedEdgeNodeSize.height;

    context.beginPath();
    context.moveTo( -width / 2, height / 4 );
    context.bezierCurveTo( -width / 2, height / 2, width / 2, height / 2, width / 2, height / 4 );
    context.lineTo( width / 2, -height / 4 );
    context.bezierCurveTo( width / 2, -height / 2, -width / 2, -height / 2, -width / 2, -height / 4 );
    context.closePath();
    context.stroke();
    context.fill();
  }

  // utility function that draws the edges of the channel
  function updateEdgeShapes( context, thisNode, transformedChannelLocation, transformedChannelSize, edgeNodeBounds,
                             transformedEdgeNodeSize, membraneChannelModel ) {

    // create the edge representations
    var edgeNodeWidth = (membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width) / 2;
    var edgeNodeHeight = membraneChannelModel.overallSize.height;

    edgeNodeWidth = edgeNodeWidth - 0.2; // adjustment for Canvas pixel width

    // update the same local transformedEdgeNodeSize instead of creating a new Dimension2 object
    transformedEdgeNodeSize.width = Math.abs( thisNode.mvt.modelToViewDeltaX( edgeNodeWidth ) );
    transformedEdgeNodeSize.height = Math.abs( thisNode.mvt.modelToViewDeltaY( edgeNodeHeight ) );

    var rotation = -membraneChannelModel.rotationalAngle + Math.PI / 2;
    context.fillStyle = thisNode.edgeFillColors[ membraneChannelModel.getChannelType() ];
    context.strokeStyle = thisNode.edgeStrokeColors[ membraneChannelModel.getChannelType() ];
    context.lineWidth = 0.9;

    // left edge
    context.save();
    context.translate( transformedChannelLocation.x, transformedChannelLocation.y );
    context.rotate( rotation );
    context.translate( -transformedChannelSize.width / 2 - edgeNodeBounds.width / 2, 0 );

    // left edge
    drawEdge( context, transformedEdgeNodeSize );
    context.restore();

    // right edge
    context.save();
    context.translate( transformedChannelLocation.x, transformedChannelLocation.y );
    context.rotate( rotation );
    context.translate( transformedChannelSize.width / 2 + edgeNodeBounds.width / 2, 0 );
    drawEdge( context, transformedEdgeNodeSize );
    context.restore();
  }

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} bounds
   * @constructor
   */
  function MembraneChannelGateCanvasNode( neuronModel, modelViewTransform, bounds ) {
    var thisNode = this;
    CanvasNode.call( thisNode, { pickable: false, canvasBounds: bounds } );
    thisNode.neuronModel = neuronModel;
    thisNode.membraneChannels = neuronModel.membraneChannels;
    thisNode.mvt = modelViewTransform;

    neuronModel.channelRepresentationChanged.addListener( function() {
      thisNode.invalidatePaint();
    } );

    function computeEdgeBounds( membraneChannelModel ) {
      var edgeNodeWidth = (membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width) / 2;
      var edgeNodeHeight = membraneChannelModel.overallSize.height;
      var transformedEdgeNodeSize = new Dimension2( Math.abs( thisNode.mvt.modelToViewDeltaX( edgeNodeWidth ) ),
        Math.abs( thisNode.mvt.modelToViewDeltaY( edgeNodeHeight ) ) );

      var width = transformedEdgeNodeSize.width;
      var height = transformedEdgeNodeSize.height;
      var edgeShape = new Shape();
      edgeShape.moveTo( -width / 2, height / 4 );
      edgeShape.cubicCurveTo( -width / 2, height / 2, width / 2, height / 2, width / 2, height / 4 );
      edgeShape.lineTo( width / 2, -height / 4 );
      edgeShape.cubicCurveTo( width / 2, -height / 2, -width / 2, -height / 2, -width / 2, -height / 4 );
      edgeShape.close();

      return edgeShape.getStrokedBounds( new kite.LineStyles( { lineWidth: 0.4 } ) );
    }

    thisNode.edgeNodeBounds = computeEdgeBounds( thisNode.membraneChannels.get( 0 ) );

    // The profiler found too many color instance being created during rendering, so cache them here.
    this.channelColors = {};
    this.channelColors[ MembraneChannelTypes.SODIUM_GATED_CHANNEL ] = NeuronConstants.SODIUM_COLOR.colorUtilsDarker( 0.2 ).getCanvasStyle();
    this.channelColors[ MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL ] = Color.interpolateRGBA( NeuronConstants.SODIUM_COLOR, Color.YELLOW, 0.5 ).colorUtilsDarker( 0.15 ).getCanvasStyle();
    this.channelColors[ MembraneChannelTypes.POTASSIUM_GATED_CHANNEL ] = NeuronConstants.POTASSIUM_COLOR.colorUtilsDarker( 0.2 ).getCanvasStyle();
    this.channelColors[ MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL ] = Color.interpolateRGBA( NeuronConstants.POTASSIUM_COLOR, new Color( 0, 200, 255 ), 0.6 ).colorUtilsDarker( 0.2 ).getCanvasStyle();

    this.edgeFillColors = {};
    this.edgeFillColors[ MembraneChannelTypes.SODIUM_GATED_CHANNEL ] = NeuronConstants.SODIUM_COLOR.getCanvasStyle();
    this.edgeFillColors[ MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL ] = Color.interpolateRGBA( NeuronConstants.SODIUM_COLOR, Color.YELLOW, 0.5 ).getCanvasStyle();
    this.edgeFillColors[ MembraneChannelTypes.POTASSIUM_GATED_CHANNEL ] = NeuronConstants.POTASSIUM_COLOR.getCanvasStyle();
    this.edgeFillColors[ MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL ] = Color.interpolateRGBA( NeuronConstants.POTASSIUM_COLOR, new Color( 0, 200, 255 ), 0.6 ).getCanvasStyle();

    this.edgeStrokeColors = {};
    this.edgeStrokeColors[ MembraneChannelTypes.SODIUM_GATED_CHANNEL ] = NeuronConstants.SODIUM_COLOR.colorUtilsDarker( 0.3 ).getCanvasStyle();
    this.edgeStrokeColors[ MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL ] = Color.interpolateRGBA( NeuronConstants.SODIUM_COLOR, Color.YELLOW, 0.5 ).colorUtilsDarker( 0.3 ).getCanvasStyle();
    this.edgeStrokeColors[ MembraneChannelTypes.POTASSIUM_GATED_CHANNEL ] = NeuronConstants.POTASSIUM_COLOR.colorUtilsDarker( 0.3 ).getCanvasStyle();
    this.edgeStrokeColors[ MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL ] = Color.interpolateRGBA( NeuronConstants.POTASSIUM_COLOR, new Color( 0, 200, 255 ), 0.6 ).colorUtilsDarker( 0.3 ).getCanvasStyle();

    this.edgeGateBallColors = {};
    this.edgeGateBallColors[ MembraneChannelTypes.SODIUM_GATED_CHANNEL ] = NeuronConstants.SODIUM_COLOR.colorUtilsDarker( 0.3 ).getCanvasStyle();
    this.edgeGateStringColor = Color.BLACK.getCanvasStyle();

    // each iteration during channel rendering updates the same local variable in order to avoid new vector creation
    this.transformedChannelLocation = new Vector2();
    this.viewTransformationMatrix = thisNode.mvt.getMatrix();

    // avoid creation of new vector instances, update x, y positions and use it during rendering
    this.channelEdgeConnectionPoint = new Vector2();
    this.channelCenterBottomPoint = new Vector2();
    this.ballPosition = new Vector2();
    this.ballConnectionPoint = new Vector2();

    // the code is refactored to use minimum instances of Vector2 and Dimensions2
    this.channelSize = new Dimension2();
    this.transformedChannelSize = new Dimension2();
    this.transformedOverallSize = new Dimension2();
    this.transformedEdgeNodeSize = new Dimension2();

    thisNode.invalidatePaint();
  }

  return inherit( CanvasNode, MembraneChannelGateCanvasNode, {

    /**
     * Paint the canvas with all of the membrane channels
     * @param {CanvasRenderingContext2D} context
     * @override
     * @protected
     */
    paintCanvas: function( context ) {
      var thisNode = this;
      var edgeNodeBounds = thisNode.edgeNodeBounds;

      // Use the same object reference.  These are intermediary objects and don't hold any state, and are used only for
      // rendering.
      var transformedChannelLocation = this.transformedChannelLocation;
      var viewTransformationMatrix = this.viewTransformationMatrix;

      var channelEdgeConnectionPoint = this.channelEdgeConnectionPoint;
      var channelCenterBottomPoint = this.channelCenterBottomPoint;
      var ballPosition = this.ballPosition;
      var ballConnectionPoint = this.ballConnectionPoint;

      // this code is refactored to use minimum instances of Vector2 and Dimensions2
      var channelSize = this.channelSize;
      var transformedChannelSize = this.transformedChannelSize;
      var transformedOverallSize = this.transformedOverallSize;
      var transformedEdgeNodeSize = this.transformedEdgeNodeSize;

      this.membraneChannels.getArray().forEach( function( membraneChannelModel ) {

        // avoid creating new vectors and use the multiplyVector2 since it doesn't create new vectors
        transformedChannelLocation.x = membraneChannelModel.getCenterLocation().x;
        transformedChannelLocation.y = membraneChannelModel.getCenterLocation().y;
        viewTransformationMatrix.multiplyVector2( transformedChannelLocation );

        var rotation = -membraneChannelModel.rotationalAngle + Math.PI / 2;

        // Set the channel width as a function of the openness of the membrane channel.
        channelSize.width = membraneChannelModel.getChannelSize().width * membraneChannelModel.getOpenness();
        channelSize.height = membraneChannelModel.getChannelSize().height;

        transformedChannelSize.width = Math.abs( thisNode.mvt.modelToViewDeltaX( channelSize.width ) );
        transformedChannelSize.height = Math.abs( thisNode.mvt.modelToViewDeltaY( channelSize.height ) );

        // Make the node a bit bigger than the channel so that the edges can be placed over it with no gaps.
        var oversizeFactor = 1.18;
        var width = transformedChannelSize.width * oversizeFactor;
        var height = transformedChannelSize.height * oversizeFactor;
        var edgeWidth = edgeNodeBounds.width; // Assume both edges are the same size.
        context.save();
        context.translate( transformedChannelLocation.x, transformedChannelLocation.y );
        context.rotate( rotation );
        context.translate( -(width + edgeWidth) / 2, -height / 2 );
        context.fillStyle = thisNode.channelColors[ membraneChannelModel.getChannelType() ];
        context.beginPath();
        context.moveTo( 0, 0 );
        context.quadraticCurveTo( (width + edgeWidth) / 2, height / 8, width + edgeWidth, 0 );
        context.lineTo( width + edgeWidth, height );
        context.quadraticCurveTo( (width + edgeWidth) / 2, height * 7 / 8, 0, height );
        context.closePath();
        context.fill();
        context.restore();

        // If this membrane channel has an inactivation gate, update it.
        if ( membraneChannelModel.getHasInactivationGate() ) {

          transformedOverallSize.width = thisNode.mvt.modelToViewDeltaX( membraneChannelModel.getOverallSize().width );
          transformedOverallSize.height = thisNode.mvt.modelToViewDeltaY( membraneChannelModel.getOverallSize().height );

          // Position the ball portion of the inactivation gate.
          // position it on the left edge, the channel's width expands based on openness (so does the position of edge)
          channelEdgeConnectionPoint.x = edgeNodeBounds.centerX - transformedChannelSize.width / 2 - edgeNodeBounds.width / 2;
          channelEdgeConnectionPoint.y = edgeNodeBounds.getMaxY();
          channelCenterBottomPoint.x = 0;
          channelCenterBottomPoint.y = transformedChannelSize.height / 2;
          var angle = -Math.PI / 2 * (1 - membraneChannelModel.getInactivationAmount());
          var radius = (1 - membraneChannelModel.getInactivationAmount()) * transformedOverallSize.width / 2 + membraneChannelModel.getInactivationAmount() * channelEdgeConnectionPoint.distance( channelCenterBottomPoint );

          ballPosition.x = channelEdgeConnectionPoint.x + Math.cos( angle ) * radius;
          ballPosition.y = channelEdgeConnectionPoint.y - Math.sin( angle ) * radius;

          var ballDiameter = thisNode.mvt.modelToViewDeltaX( membraneChannelModel.getChannelSize().width );

          // Redraw the "string" (actually a strand of protein in real life) that connects the ball to the gate.
          ballConnectionPoint.x = ballPosition.x;
          ballConnectionPoint.y = ballPosition.y;
          var connectorLength = channelCenterBottomPoint.distance( ballConnectionPoint );
          context.save();
          context.translate( transformedChannelLocation.x, transformedChannelLocation.y );
          context.rotate( rotation );
          context.lineWidth = 1.1;
          context.strokeStyle = thisNode.edgeGateStringColor;
          context.beginPath();
          context.moveTo( channelEdgeConnectionPoint.x, channelEdgeConnectionPoint.y );
          context.bezierCurveTo( channelEdgeConnectionPoint.x + connectorLength * 0.25,
            channelEdgeConnectionPoint.y + connectorLength * 0.5, ballConnectionPoint.x - connectorLength * 0.75,
            ballConnectionPoint.y - connectorLength * 0.5, ballConnectionPoint.x, ballConnectionPoint.y );
          context.stroke();
          context.beginPath();
          context.fillStyle = thisNode.edgeGateBallColors[ membraneChannelModel.getChannelType() ];
          context.arc( ballConnectionPoint.x, ballConnectionPoint.y, ballDiameter / 2, 0, 2 * Math.PI, false );
          context.closePath();
          context.fill();
          context.restore();
        }

        // for better layering draw edges after ball and string
        updateEdgeShapes( context, thisNode, transformedChannelLocation, transformedChannelSize, edgeNodeBounds,
          transformedEdgeNodeSize, membraneChannelModel );
      } );
    }

  } );
} );