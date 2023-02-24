// Copyright 2014-2023, University of Colorado Boulder
/**
 * The dynamic parts of the Membrane Channels, namely the gate, channel expansion, and string, are rendered directly on
 * a single canvas for optimal performance.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { LineStyles, Shape } from '../../../../kite/js/imports.js';
import { CanvasNode, Color } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import MembraneChannelTypes from '../model/MembraneChannelTypes.js';

// utility function for drawing the shape that depicts the edge or side of a membrane channel
function drawEdge( context, transformedEdgeNodeSize ) {

  // Instead of passing the transformedEdgeNodeSize, the updateEdgeShape function updates the transformedEdgeNodeSize
  const width = transformedEdgeNodeSize.width;
  const height = transformedEdgeNodeSize.height;

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
function updateEdgeShapes( context, thisNode, transformedChannelPosition, transformedChannelSize, edgeNodeBounds,
                           transformedEdgeNodeSize, membraneChannelModel ) {

  // create the edge representations
  let edgeNodeWidth = ( membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width ) / 2;
  const edgeNodeHeight = membraneChannelModel.overallSize.height;

  edgeNodeWidth = edgeNodeWidth - 0.2; // adjustment for Canvas pixel width

  // update the same local transformedEdgeNodeSize instead of creating a new Dimension2 object
  transformedEdgeNodeSize.width = Math.abs( thisNode.mvt.modelToViewDeltaX( edgeNodeWidth ) );
  transformedEdgeNodeSize.height = Math.abs( thisNode.mvt.modelToViewDeltaY( edgeNodeHeight ) );

  const rotation = -membraneChannelModel.rotationalAngle + Math.PI / 2;
  context.fillStyle = thisNode.edgeFillColors[ membraneChannelModel.getChannelType() ];
  context.strokeStyle = thisNode.edgeStrokeColors[ membraneChannelModel.getChannelType() ];
  context.lineWidth = 0.9;

  // left edge
  context.save();
  context.translate( transformedChannelPosition.x, transformedChannelPosition.y );
  context.rotate( rotation );
  context.translate( -transformedChannelSize.width / 2 - edgeNodeBounds.width / 2, 0 );

  // left edge
  drawEdge( context, transformedEdgeNodeSize );
  context.restore();

  // right edge
  context.save();
  context.translate( transformedChannelPosition.x, transformedChannelPosition.y );
  context.rotate( rotation );
  context.translate( transformedChannelSize.width / 2 + edgeNodeBounds.width / 2, 0 );
  drawEdge( context, transformedEdgeNodeSize );
  context.restore();
}

class MembraneChannelGateCanvasNode extends CanvasNode {

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Bounds2} bounds
   */
  constructor( neuronModel, modelViewTransform, bounds ) {
    super( {
      pickable: false,
      canvasBounds: bounds
    } );

    this.neuronModel = neuronModel;
    this.membraneChannels = neuronModel.membraneChannels;
    this.mvt = modelViewTransform;

    neuronModel.channelRepresentationChanged.addListener( () => {
      this.invalidatePaint();
    } );

    const computeEdgeBounds = membraneChannelModel => {
      const edgeNodeWidth = ( membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width ) / 2;
      const edgeNodeHeight = membraneChannelModel.overallSize.height;
      const transformedEdgeNodeSize = new Dimension2( Math.abs( this.mvt.modelToViewDeltaX( edgeNodeWidth ) ),
        Math.abs( this.mvt.modelToViewDeltaY( edgeNodeHeight ) ) );

      const width = transformedEdgeNodeSize.width;
      const height = transformedEdgeNodeSize.height;
      const edgeShape = new Shape();
      edgeShape.moveTo( -width / 2, height / 4 );
      edgeShape.cubicCurveTo( -width / 2, height / 2, width / 2, height / 2, width / 2, height / 4 );
      edgeShape.lineTo( width / 2, -height / 4 );
      edgeShape.cubicCurveTo( width / 2, -height / 2, -width / 2, -height / 2, -width / 2, -height / 4 );
      edgeShape.close();

      return edgeShape.getStrokedBounds( new LineStyles( { lineWidth: 0.4 } ) );
    };

    this.edgeNodeBounds = computeEdgeBounds( this.membraneChannels.get( 0 ) );

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
    this.transformedChannelPosition = new Vector2( 0, 0 );
    this.viewTransformationMatrix = this.mvt.getMatrix();

    // avoid creation of new vector instances, update x, y positions and use it during rendering
    this.channelEdgeConnectionPoint = new Vector2( 0, 0 );
    this.channelCenterBottomPoint = new Vector2( 0, 0 );
    this.ballPosition = new Vector2( 0, 0 );
    this.ballConnectionPoint = new Vector2( 0, 0 );

    // the code is refactored to use minimum instances of Vector2 and Dimensions2
    this.channelSize = new Dimension2();
    this.transformedChannelSize = new Dimension2();
    this.transformedOverallSize = new Dimension2();
    this.transformedEdgeNodeSize = new Dimension2();

    this.invalidatePaint();
  }

  /**
   * Paint the canvas with all of the membrane channels
   * @param {CanvasRenderingContext2D} context
   * @override
   * @protected
   */
  paintCanvas( context ) {
    const edgeNodeBounds = this.edgeNodeBounds;

    // Use the same object reference.  These are intermediary objects and don't hold any state, and are used only for
    // rendering.
    const transformedChannelPosition = this.transformedChannelPosition;
    const viewTransformationMatrix = this.viewTransformationMatrix;

    const channelEdgeConnectionPoint = this.channelEdgeConnectionPoint;
    const channelCenterBottomPoint = this.channelCenterBottomPoint;
    const ballPosition = this.ballPosition;
    const ballConnectionPoint = this.ballConnectionPoint;

    // this code is refactored to use minimum instances of Vector2 and Dimensions2
    const channelSize = this.channelSize;
    const transformedChannelSize = this.transformedChannelSize;
    const transformedOverallSize = this.transformedOverallSize;
    const transformedEdgeNodeSize = this.transformedEdgeNodeSize;

    this.membraneChannels.forEach( membraneChannelModel => {

      // avoid creating new vectors and use the multiplyVector2 since it doesn't create new vectors
      transformedChannelPosition.x = membraneChannelModel.getCenterPosition().x;
      transformedChannelPosition.y = membraneChannelModel.getCenterPosition().y;
      viewTransformationMatrix.multiplyVector2( transformedChannelPosition );

      const rotation = -membraneChannelModel.rotationalAngle + Math.PI / 2;

      // Set the channel width as a function of the openness of the membrane channel.
      channelSize.width = membraneChannelModel.getChannelSize().width * membraneChannelModel.getOpenness();
      channelSize.height = membraneChannelModel.getChannelSize().height;


      transformedChannelSize.width = Math.abs( this.mvt.modelToViewDeltaX( channelSize.width ) );
      transformedChannelSize.height = Math.abs( this.mvt.modelToViewDeltaY( channelSize.height ) );

      // Make the node a bit bigger than the channel so that the edges can be placed over it with no gaps.
      const oversizeFactor = 1.18;
      const width = transformedChannelSize.width * oversizeFactor;
      const height = transformedChannelSize.height * oversizeFactor;
      const edgeWidth = edgeNodeBounds.width; // Assume both edges are the same size.
      context.save();
      context.translate( transformedChannelPosition.x, transformedChannelPosition.y );
      context.rotate( rotation );
      context.translate( -( width + edgeWidth ) / 2, -height / 2 );
      context.fillStyle = this.channelColors[ membraneChannelModel.getChannelType() ];
      context.beginPath();
      context.moveTo( 0, 0 );
      context.quadraticCurveTo( ( width + edgeWidth ) / 2, height / 8, width + edgeWidth, 0 );
      context.lineTo( width + edgeWidth, height );
      context.quadraticCurveTo( ( width + edgeWidth ) / 2, height * 7 / 8, 0, height );
      context.closePath();
      context.fill();
      context.restore();

      // If this membrane channel has an inactivation gate, update it.
      if ( membraneChannelModel.getHasInactivationGate() ) {

        transformedOverallSize.width = this.mvt.modelToViewDeltaX( membraneChannelModel.getOverallSize().width );
        transformedOverallSize.height = this.mvt.modelToViewDeltaY( membraneChannelModel.getOverallSize().height );

        // Position the ball portion of the inactivation gate.
        // position it on the left edge, the channel's width expands based on openness (so does the position of edge)
        channelEdgeConnectionPoint.x = edgeNodeBounds.centerX - transformedChannelSize.width / 2 - edgeNodeBounds.width / 2;
        channelEdgeConnectionPoint.y = edgeNodeBounds.getMaxY();
        channelCenterBottomPoint.x = 0;
        channelCenterBottomPoint.y = transformedChannelSize.height / 2;
        const angle = -Math.PI / 2 * ( 1 - membraneChannelModel.getInactivationAmount() );
        const radius = ( 1 - membraneChannelModel.getInactivationAmount() ) * transformedOverallSize.width / 2 + membraneChannelModel.getInactivationAmount() * channelEdgeConnectionPoint.distance( channelCenterBottomPoint );

        ballPosition.x = channelEdgeConnectionPoint.x + Math.cos( angle ) * radius;
        ballPosition.y = channelEdgeConnectionPoint.y - Math.sin( angle ) * radius;

        const ballDiameter = this.mvt.modelToViewDeltaX( membraneChannelModel.getChannelSize().width );

        // Redraw the "string" (actually a strand of protein in real life) that connects the ball to the gate.
        ballConnectionPoint.x = ballPosition.x;
        ballConnectionPoint.y = ballPosition.y;
        const connectorLength = channelCenterBottomPoint.distance( ballConnectionPoint );
        context.save();
        context.translate( transformedChannelPosition.x, transformedChannelPosition.y );
        context.rotate( rotation );
        context.lineWidth = 1.1;
        context.strokeStyle = this.edgeGateStringColor;
        context.beginPath();
        context.moveTo( channelEdgeConnectionPoint.x, channelEdgeConnectionPoint.y );
        context.bezierCurveTo( channelEdgeConnectionPoint.x + connectorLength * 0.25,
          channelEdgeConnectionPoint.y + connectorLength * 0.5, ballConnectionPoint.x - connectorLength * 0.75,
          ballConnectionPoint.y - connectorLength * 0.5, ballConnectionPoint.x, ballConnectionPoint.y );
        context.stroke();
        context.beginPath();
        context.fillStyle = this.edgeGateBallColors[ membraneChannelModel.getChannelType() ];
        context.arc( ballConnectionPoint.x, ballConnectionPoint.y, ballDiameter / 2, 0, 2 * Math.PI, false );
        context.closePath();
        context.fill();
        context.restore();
      }

      // for better layering draw edges after ball and string
      updateEdgeShapes( context, this, transformedChannelPosition, transformedChannelSize, edgeNodeBounds,
        transformedEdgeNodeSize, membraneChannelModel );
    } );
  }
}

neuron.register( 'MembraneChannelGateCanvasNode', MembraneChannelGateCanvasNode );

export default MembraneChannelGateCanvasNode;
