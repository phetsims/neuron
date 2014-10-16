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

    thisNode.invalidatePaint();
  }

  return inherit( CanvasNode, MembraneChannelGateCanvasNode, {

    // @param {CanvasContextWrapper} wrapper
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var thisNode = this;
      var edgeNodeBounds = thisNode.edgeNodeBounds;

      function drawEdge( context, size, membraneChannelModel ) {
        var width = size.width;
        var height = size.height;

        context.beginPath();
        context.moveTo( -width / 2, height / 4 );
        context.bezierCurveTo( -width / 2, height / 2, width / 2, height / 2, width / 2, height / 4 );
        context.lineTo( width / 2, -height / 4 );
        context.bezierCurveTo( width / 2, -height / 2, -width / 2, -height / 2, -width / 2, -height / 4 );
        context.closePath();
        context.stroke();
        context.fill();


      }

      function updateEdgeShapes( context, transformedChannelSize, edgeNodeBounds, membraneChannelModel ) {

        // Create the edge representations.
        var edgeNodeWidth = (membraneChannelModel.overallSize.width - membraneChannelModel.channelSize.width) / 2;
        var edgeNodeHeight = membraneChannelModel.overallSize.height;
        var transformedEdgeNodeSize = new Dimension2( Math.abs( thisNode.mvt.modelToViewDeltaX( edgeNodeWidth ) ), Math.abs( thisNode.mvt.modelToViewDeltaY( edgeNodeHeight ) ) );
        var rotation = -membraneChannelModel.rotationalAngle + Math.PI / 2;
        var transformedChannelPosition = thisNode.mvt.modelToViewPosition( membraneChannelModel.getCenterLocation() );
        context.fillStyle = membraneChannelModel.getEdgeColor().getCanvasStyle();
        context.strokeStyle = membraneChannelModel.getEdgeColor().colorUtilsDarker( 0.3 ).getCanvasStyle();
        context.lineWidth = 0.4;

        //left Edge
        context.save();
        context.translate( transformedChannelPosition.x, transformedChannelPosition.y );
        context.rotate( rotation );
        context.translate( -transformedChannelSize.width / 2 - edgeNodeBounds.width / 2, 0 );
        //left Edge
        drawEdge( context, transformedEdgeNodeSize, membraneChannelModel );
        context.restore();
        //right edge
        context.save();
        context.translate( transformedChannelPosition.x, transformedChannelPosition.y );
        context.rotate( rotation );
        context.translate( transformedChannelSize.width / 2 + edgeNodeBounds.width / 2, 0 );
        drawEdge( context, transformedEdgeNodeSize, membraneChannelModel );
        context.restore();

      }

      this.membraneChannels.forEach( function( membraneChannelModel ) {

        var transformedLocation = thisNode.mvt.modelToViewPosition( membraneChannelModel.getCenterLocation() );
        var rotation = -membraneChannelModel.rotationalAngle + Math.PI / 2;

        // Set the channel width as a function of the openness of the membrane channel.
        var channelWidth = membraneChannelModel.getChannelSize().width * membraneChannelModel.getOpenness();
        var channelSize = new Dimension2( channelWidth, membraneChannelModel.getChannelSize().height );
        var transformedChannelSize = new Dimension2( Math.abs( thisNode.mvt.modelToViewDeltaX( channelSize.width ) ), Math.abs( thisNode.mvt.modelToViewDeltaY( channelSize.height ) ) );

        // Make the node a bit bigger than the channel so that the edges can
        // be placed over it with no gaps.
        var oversizeFactor = 1.2; // was 1.1 in Java
        var width = transformedChannelSize.width * oversizeFactor;
        var height = transformedChannelSize.height * oversizeFactor;
        var edgeWidth = edgeNodeBounds.width; // Assume both edges are the same size.
        context.save();
        context.translate( transformedLocation.x, transformedLocation.y );
        context.rotate( rotation );
        context.translate( -(width + edgeWidth) / 2, -height / 2 );
        context.fillStyle = membraneChannelModel.getChannelColor().getCanvasStyle();
        context.beginPath();
        context.moveTo( 0, 0 );
        context.quadraticCurveTo( (width + edgeWidth) / 2, height / 8, width + edgeWidth, 0 );
        context.lineTo( width + edgeWidth, height );
        context.quadraticCurveTo( (width + edgeWidth) / 2, height * 7 / 8, 0, height );
        context.closePath();
        context.fill();
        context.restore();

        updateEdgeShapes( context, transformedChannelSize, edgeNodeBounds, membraneChannelModel );

        // If this membrane channel has an inactivation gate, update it.
        if ( membraneChannelModel.getHasInactivationGate() ) {

          var transformedOverallSize =
            new Dimension2( thisNode.mvt.modelToViewDeltaX( membraneChannelModel.getOverallSize().width ),
              thisNode.mvt.modelToViewDeltaY( membraneChannelModel.getOverallSize().height ) );

          // Position the ball portion of the inactivation gate.
          var channelEdgeConnectionPoint = new Vector2( edgeNodeBounds.centerX - transformedChannelSize.width / 2 - edgeNodeBounds.width / 2, // position it on the left edge, the channel's width expands based on openness (so does the position of edge)
            edgeNodeBounds.getMaxY() );
          var channelCenterBottomPoint = new Vector2( 0, transformedChannelSize.height / 2 );
          var angle = -Math.PI / 2 * (1 - membraneChannelModel.getInactivationAmt());
          var radius = (1 - membraneChannelModel.getInactivationAmt()) * transformedOverallSize.width / 2 + membraneChannelModel.getInactivationAmt() * channelEdgeConnectionPoint.distance( channelCenterBottomPoint );

          var ballPosition = new Vector2( channelEdgeConnectionPoint.x + Math.cos( angle ) * radius,
              channelEdgeConnectionPoint.y - Math.sin( angle ) * radius );
          var ballDiameter = thisNode.mvt.modelToViewDeltaX( membraneChannelModel.getChannelSize().width );

          // Redraw the "string" (actually a strand of protein in real life)
          // that connects the ball to the gate.
          var ballConnectionPoint = new Vector2( ballPosition.x, ballPosition.y );
          var connectorLength = channelCenterBottomPoint.distance( ballConnectionPoint );
          context.save();
          context.translate( transformedLocation.x, transformedLocation.y );
          context.rotate( rotation );
          context.lineWidth = 0.5;
          context.strokeStyle = membraneChannelModel.getEdgeColor().colorUtilsDarker( 0.3 ).getCanvasStyle();
          context.beginPath();
          context.moveTo( channelEdgeConnectionPoint.x, channelEdgeConnectionPoint.y );
          context.bezierCurveTo( channelEdgeConnectionPoint.x + connectorLength * 0.25,
              channelEdgeConnectionPoint.y + connectorLength * 0.5, ballConnectionPoint.x - connectorLength * 0.75,
              ballConnectionPoint.y - connectorLength * 0.5, ballConnectionPoint.x, ballConnectionPoint.y );
          context.stroke();
          context.beginPath();
          context.fillStyle = membraneChannelModel.getEdgeColor().colorUtilsDarker( 0.3 ).getCanvasStyle();
          context.arc( ballConnectionPoint.x, ballConnectionPoint.y, ballDiameter / 2, 0, 2 * Math.PI, false );
          context.closePath();
          context.fill();
          context.restore();
        }

      } );

    }

  } );


} );