// Copyright 2002-2011, University of Colorado
/**
 * Experimental - Not used
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );


  function ChartContentCanvasNode( dataSeries, chartMvt, bounds ) {
    var thisNode = this;
    CanvasNode.call( thisNode, {pickable: false, canvasBounds: bounds} );
    thisNode.dataSeries = dataSeries;
    thisNode.chartMvt = chartMvt;


    thisNode.invalidatePaint();
  }

  return inherit( CanvasNode, ChartContentCanvasNode, {

    step: function( dt ) {
      this.invalidatePaint();
    },
    // @param {CanvasContextWrapper} wrapper
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;
      var thisNode = this;
      var xPoints = thisNode.dataSeries.xPoints.slice();
      var yPoints = thisNode.dataSeries.yPoints.slice();

      context.lineWidth = 0.5;

      var modelX = 0;
      var modelY = 0;
      if ( xPoints.length > 0 ) {

        modelX = xPoints[0];
        modelY = yPoints[0];
        context.moveTo( thisNode.chartMvt.modelToViewX( modelX ), thisNode.chartMvt.modelToViewY( modelY ) );

      }

      for ( var i = 1; i < xPoints.length; i++ ) {
        modelX = xPoints[i];
        modelY = yPoints[i];
        context.lineTo( thisNode.chartMvt.modelToViewX( modelX ), thisNode.chartMvt.modelToViewY( modelY ) );
      }

      context.stroke();
    }

  } );

} );