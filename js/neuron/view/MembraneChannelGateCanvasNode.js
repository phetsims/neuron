// Copyright 2002-2011, University of Colorado
/**
 * The Dynamic parts of the Membrane Channels namely Gate,Channel expansion,string are
 * rendered directly on a single canvas.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var kite = require( 'KITE/kite' );
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   *
   * @param neuronModel
   * @param modelViewTransform
   * @param bounds
   * @constructor
   */
  function MembraneChannelGateCanvasNode( neuronModel, modelViewTransform, bounds ) {
    var thisNode = this;
    CanvasNode.call( thisNode, {pickable: false, canvasBounds: bounds } );
    thisNode.neuronModel = neuronModel;
    thisNode.membraneChannels = neuronModel.membraneChannels;
    thisNode.mvt = modelViewTransform;

    neuronModel.channelRepresentationChangedProperty.link( function( channelRepresentationChanged ) {
      if ( channelRepresentationChanged ) {
        thisNode.invalidatePaint();
      }
    } );

    function computeEdgeBounds( membraneChannelModel ) {
      var edgeNodeWidth = (membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width) / 2;
      var edgeNodeHeight = membraneChannelModel.overallSize.height;
      var transformedEdgeNodeSize = new Dimension2( Math.abs( thisNode.mvt.modelToViewDeltaX( edgeNodeWidth ) ), Math.abs( thisNode.mvt.modelToViewDeltaY( edgeNodeHeight ) ) );

      var width = transformedEdgeNodeSize.width;
      var height = transformedEdgeNodeSize.height;
      var edgeShape = new Shape();
      edgeShape.moveTo( -width / 2, height / 4 );
      edgeShape.cubicCurveTo( -width / 2, height / 2, width / 2, height / 2, width / 2, height / 4 );
      edgeShape.lineTo( width / 2, -height / 4 );
      edgeShape.cubicCurveTo( width / 2, -height / 2, -width / 2, -height / 2, -width / 2, -height / 4 );
      edgeShape.close();

      return  edgeShape.computeBounds( new kite.LineStyles( {lineWidth: 0.4} ) );

    }

    thisNode.edgeNodeBounds = computeEdgeBounds( thisNode.membraneChannels.get( 0 ) );

    //Profiler found too many color instance being created during rendering, so cache it
    this.channelColors = {};
    this.channelColors[MembraneChannelTypes.SODIUM_GATED_CHANNEL] = NeuronConstants.SODIUM_COLOR.colorUtilsDarker( 0.2 ).getCanvasStyle();
    this.channelColors[MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL] = Color.interpolateRGBA( NeuronConstants.SODIUM_COLOR, Color.YELLOW, 0.5 ).colorUtilsDarker( 0.15 ).getCanvasStyle();
    this.channelColors[MembraneChannelTypes.POTASSIUM_GATED_CHANNEL] = NeuronConstants.POTASSIUM_COLOR.colorUtilsDarker( 0.2 ).getCanvasStyle();
    this.channelColors[MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL] = Color.interpolateRGBA( NeuronConstants.POTASSIUM_COLOR, new Color( 0, 200, 255 ), 0.6 ).colorUtilsDarker( 0.2 ).getCanvasStyle();

    this.edgeFillColors = {};
    this.edgeFillColors[MembraneChannelTypes.SODIUM_GATED_CHANNEL] = NeuronConstants.SODIUM_COLOR.getCanvasStyle();
    this.edgeFillColors[MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL] = Color.interpolateRGBA( NeuronConstants.SODIUM_COLOR, Color.YELLOW, 0.5 ).getCanvasStyle();
    this.edgeFillColors[MembraneChannelTypes.POTASSIUM_GATED_CHANNEL] = NeuronConstants.POTASSIUM_COLOR.getCanvasStyle();
    this.edgeFillColors[MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL] = Color.interpolateRGBA( NeuronConstants.POTASSIUM_COLOR, new Color( 0, 200, 255 ), 0.6 ).getCanvasStyle();

    this.edgeStrokeColors = {};
    this.edgeStrokeColors[MembraneChannelTypes.SODIUM_GATED_CHANNEL] = NeuronConstants.SODIUM_COLOR.colorUtilsDarker( 0.3 ).getCanvasStyle();
    this.edgeStrokeColors[MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL] = Color.interpolateRGBA( NeuronConstants.SODIUM_COLOR, Color.YELLOW, 0.5 ).colorUtilsDarker( 0.3 ).getCanvasStyle();
    this.edgeStrokeColors[MembraneChannelTypes.POTASSIUM_GATED_CHANNEL] = NeuronConstants.POTASSIUM_COLOR.colorUtilsDarker( 0.3 ).getCanvasStyle();
    this.edgeStrokeColors[MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL] = Color.interpolateRGBA( NeuronConstants.POTASSIUM_COLOR, new Color( 0, 200, 255 ), 0.6 ).colorUtilsDarker( 0.3 ).getCanvasStyle();

    this.edgeGateBallColors = {};
    this.edgeGateBallColors[MembraneChannelTypes.SODIUM_GATED_CHANNEL] = NeuronConstants.SODIUM_COLOR.colorUtilsDarker( 0.3 ).getCanvasStyle();
    this.edgeGateStringColor = Color.BLACK.getCanvasStyle();

    //Each iteration during Channel rendering updates the same local variable,This is done to avoid new vector creation
    this.transformedChannelLocation = new Vector2();
    this.viewTransformationMatrix = thisNode.mvt.getMatrix();

    //avoid creation of new vector Instances, update x, y positions and use it during rendering
    this.channelEdgeConnectionPoint = new Vector2();
    this.channelCenterBottomPoint = new Vector2();
    this.ballPosition = new Vector2();
    this.ballConnectionPoint = new Vector2();

    // The code is refactored to use minimum instances of Vector2 and Dimensions2
    this.channelSize = new Dimension2();
    this.transformedChannelSize = new Dimension2();
    this.transformedOverallSize = new Dimension2();
    this.transformedEdgeNodeSize = new Dimension2();

    thisNode.invalidatePaint();
  }

  return inherit( CanvasNode, MembraneChannelGateCanvasNode, {

    // @param {CanvasContextWrapper} wrapper
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var thisNode = this;
      var edgeNodeBounds = thisNode.edgeNodeBounds;

      // use the same object reference, these are intermediary objects and dont hold any state
      // Used only for rendering
      var transformedChannelLocation = this.transformedChannelLocation;
      var viewTransformationMatrix = this.viewTransformationMatrix;

      var channelEdgeConnectionPoint = this.channelEdgeConnectionPoint;
      var channelCenterBottomPoint = this.channelCenterBottomPoint;
      var ballPosition = this.ballPosition;
      var ballConnectionPoint = this.ballConnectionPoint;

      // The code is refactored to use minimum instances of Vector2 and Dimensions2
      var channelSize = this.channelSize;
      var transformedChannelSize = this.transformedChannelSize;
      var transformedOverallSize = this.transformedOverallSize;
      var transformedEdgeNodeSize = this.transformedEdgeNodeSize;

      function drawEdge( context, membraneChannelModel ) {

        // Instead of passing the transformedEdgeNodeSize,
        // the update Edge Shape updates the transformedEdgeNodeSize
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

      function updateEdgeShapes( context, edgeNodeBounds, membraneChannelModel ) {

        // Create the edge representations.
        var edgeNodeWidth = (membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width) / 2;
        var edgeNodeHeight = membraneChannelModel.overallSize.height;

        edgeNodeWidth = edgeNodeWidth - 0.2; // adjustment for Canvas pixel width
        //update the same local transformedEdgeNodeSize instead of creating a new Dimension2 object
        transformedEdgeNodeSize.width = Math.abs( thisNode.mvt.modelToViewDeltaX( edgeNodeWidth ) );
        transformedEdgeNodeSize.height = Math.abs( thisNode.mvt.modelToViewDeltaY( edgeNodeHeight ) );

        var rotation = -membraneChannelModel.rotationalAngle + Math.PI / 2;
        context.fillStyle = thisNode.edgeFillColors[membraneChannelModel.getChannelType()];
        context.strokeStyle = thisNode.edgeStrokeColors[membraneChannelModel.getChannelType()];
        context.lineWidth = 0.9;

        //left Edge
        context.save();
        context.translate( transformedChannelLocation.x, transformedChannelLocation.y );
        context.rotate( rotation );
        context.translate( -transformedChannelSize.width / 2 - edgeNodeBounds.width / 2, 0 );

        //left Edge
        drawEdge( context, membraneChannelModel );
        context.restore();

        //right edge
        context.save();
        context.translate( transformedChannelLocation.x, transformedChannelLocation.y );
        context.rotate( rotation );
        context.translate( transformedChannelSize.width / 2 + edgeNodeBounds.width / 2, 0 );
        drawEdge( context, membraneChannelModel );
        context.restore();

      }


      this.membraneChannels.forEach( function( membraneChannelModel ) {

        //Avoid creating new Vectors and use the multiplyVector2 since it doesnt create new vectors
        transformedChannelLocation.x = membraneChannelModel.getCenterLocation().x;
        transformedChannelLocation.y = membraneChannelModel.getCenterLocation().y;
        viewTransformationMatrix.multiplyVector2( transformedChannelLocation );

        var rotation = -membraneChannelModel.rotationalAngle + Math.PI / 2;
        // Set the channel width as a function of the openness of the membrane channel.
        channelSize.width = membraneChannelModel.getChannelSize().width * membraneChannelModel.getOpenness();
        channelSize.height = membraneChannelModel.getChannelSize().height;

        transformedChannelSize.width = Math.abs( thisNode.mvt.modelToViewDeltaX( channelSize.width ) );
        transformedChannelSize.height = Math.abs( thisNode.mvt.modelToViewDeltaY( channelSize.height ) );

        // Make the node a bit bigger than the channel so that the edges can
        // be placed over it with no gaps.
        var oversizeFactor = 1.18;
        var width = transformedChannelSize.width * oversizeFactor;
        var height = transformedChannelSize.height * oversizeFactor;
        var edgeWidth = edgeNodeBounds.width; // Assume both edges are the same size.
        context.save();
        context.translate( transformedChannelLocation.x, transformedChannelLocation.y );
        context.rotate( rotation );
        context.translate( -(width + edgeWidth) / 2, -height / 2 );
        context.fillStyle = thisNode.channelColors[membraneChannelModel.getChannelType()];
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
          var angle = -Math.PI / 2 * (1 - membraneChannelModel.getInactivationAmt());
          var radius = (1 - membraneChannelModel.getInactivationAmt()) * transformedOverallSize.width / 2 + membraneChannelModel.getInactivationAmt() * channelEdgeConnectionPoint.distance( channelCenterBottomPoint );

          ballPosition.x = channelEdgeConnectionPoint.x + Math.cos( angle ) * radius;
          ballPosition.y = channelEdgeConnectionPoint.y - Math.sin( angle ) * radius;

          var ballDiameter = thisNode.mvt.modelToViewDeltaX( membraneChannelModel.getChannelSize().width );

          // Redraw the "string" (actually a strand of protein in real life)
          // that connects the ball to the gate.
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
          context.fillStyle = thisNode.edgeGateBallColors[membraneChannelModel.getChannelType()];
          context.arc( ballConnectionPoint.x, ballConnectionPoint.y, ballDiameter / 2, 0, 2 * Math.PI, false );
          context.closePath();
          context.fill();
          context.restore();
        }

        //for better layering draw edge after ball and string
        updateEdgeShapes( context, edgeNodeBounds, membraneChannelModel );

      } );

    }

  } );


} );