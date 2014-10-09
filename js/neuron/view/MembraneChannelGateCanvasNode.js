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

  /**
   *
   * @param neuronModel
   * @param membraneChannelNodes // The channel gates depends on the positions and bounds of edge nodes which is part of membraneChannelNode
   * @param modelViewTransform
   * @param bounds
   * @constructor
   */
  function MembraneChannelGateCanvasNode( neuronModel, membraneChannelNodes, modelViewTransform, bounds ) {
    var thisNode = this;
    CanvasNode.call( thisNode, {pickable: false, canvasBounds: bounds } );
    thisNode.neuronModel = neuronModel;
    thisNode.membraneChannelNodes = membraneChannelNodes;
    thisNode.mvt = modelViewTransform;

    neuronModel.channelRepresentationChangedProperty.link( function( channelRepresentationChanged ) {
      if ( channelRepresentationChanged ) {
        thisNode.invalidatePaint();
      }
    } );

    thisNode.invalidatePaint();
  }

  return inherit( CanvasNode, MembraneChannelGateCanvasNode, {

    // @param {CanvasContextWrapper} wrapper
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var thisNode = this;


      this.membraneChannelNodes.forEach( function( membraneChannelNode ) {

        var membraneChannelModel = membraneChannelNode.membraneChannelModel;
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
        var edgeNodeBounds = membraneChannelNode.leftEdgeNode.getBounds();
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

        // If this membrane channel has an inactivation gate, update it.
        if ( membraneChannelModel.getHasInactivationGate() ) {

          var transformedOverallSize =
            new Dimension2( thisNode.mvt.modelToViewDeltaX( membraneChannelModel.getOverallSize().width ),
              thisNode.mvt.modelToViewDeltaY( membraneChannelModel.getOverallSize().height ) );

          // Position the ball portion of the inactivation gate.
          var channelEdgeConnectionPoint = new Vector2( membraneChannelNode.leftEdgeNode.centerX,
            membraneChannelNode.leftEdgeNode.getBounds().getMaxY() );
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