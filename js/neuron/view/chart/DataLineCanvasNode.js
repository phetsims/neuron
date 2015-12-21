// Copyright 2015, University of Colorado Boulder

/**
 * A node that represents a line created from a collection of points, intended to be used  to represent data on a
 * graph.  This is created as part of an effort to improve the performance of the dynamic chart in the Neuron sim.
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  // constants
  var LINE_COLOR = '#ff5500'; // colorblind-friendly red
  var LINE_WIDTH = 1;

  /**
   * @param {number} width
   * @param {number} height
   * @param {XYDataSeries} dataSeries
   * @param {ModelViewTransform2} mvt - model-view transform for mapping data points to the chart
   * @constructor
   */
  function DataLineCanvasNode( width, height, dataSeries, mvt ) {

    var self = this;
    this.dataSeries = dataSeries; // @private
    this.numSegments = 0; // @private, number of line segments that comprise the overall line
    this.mvt = mvt; // @private

    // call super-constructor
    CanvasNode.call( this, { pickable: false, canvasBounds: new Bounds2( 0, 0, width, height ) } );

    // cause the canvas to get updated each time new data is added to the data series
    dataSeries.addDataSeriesListener( function() {
      self.invalidatePaint();
    } );

    // cause the data line to be cleared whenever the data series is cleared
    dataSeries.cleared.addListener( function() {
      self.numSegments = 0;
      self.invalidatePaint();
    } );
  }

  return inherit( CanvasNode, DataLineCanvasNode, {

    /**
     * A method that paints the data line on the canvas.  For maximum performance, this adds points to the end of an
     * existing line when possible rather than redrawing the entire line with each update.
     * @param {CanvasRenderingContext2D} context
     * @protected
     * @override
     */
    paintCanvas: function( context ) {

      // This is optimized to draw little segments on the end of an already existing line if possible, and only do a
      // full redraw when necessary.
      if ( this.numSegments < this.dataSeries.getLength() - 1 ) {

        context.strokeStyle = LINE_COLOR;
        context.lineWidth = LINE_WIDTH;

        if ( this.numSegments === 0 ) {
          // this is the first segment, so start the new path
          context.beginPath();
        }

        // draw a segment from the end of the previous segment to the new data point or points
        while ( this.numSegments < this.dataSeries.getLength() - 1 ) {
          var endPointX = this.mvt.modelToViewX( this.dataSeries.getX( this.numSegments ) );
          var endPointY = this.mvt.modelToViewY( this.dataSeries.getY( this.numSegments ) );
          context.moveTo( endPointX, endPointY );
          var newEndPointX = this.mvt.modelToViewX( this.dataSeries.getX( this.numSegments + 1 ) );
          var newEndPointY = this.mvt.modelToViewY( this.dataSeries.getY( this.numSegments + 1 ) );
          context.lineTo( newEndPointX, newEndPointY );
          this.numSegments++;
        }
        context.stroke();
      }
    },

    /**
     * Notify this class that a resize has occurred.  This is necessary because of the optimization that only adds new
     * segments to the line as it grows - if a resize occurs due to the user resizing the window, the canvas is cleared
     * by Scenery, so without this notification a partial line would be seen by the user.
     * @public
     */
    notifyResize: function() {
      this.numSegments = 0;
      this.invalidatePaint();
    }
  } );
} );