// Copyright 2015-2016, University of Colorado Boulder

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
    this.mvt = mvt; // @private

    // call super-constructor
    CanvasNode.call( this, { pickable: false, canvasBounds: new Bounds2( 0, 0, width, height ) } );

    // cause the canvas to get updated each time new data is added to the data series
    dataSeries.addDataSeriesListener( function() {
      self.invalidatePaint();
    } );

    // cause the data line to be cleared whenever the data series is cleared
    dataSeries.cleared.addListener( function() {
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

      context.save();

      if ( this.dataSeries.getLength() >= 2 ) {
        context.strokeStyle = LINE_COLOR;
        context.lineWidth = LINE_WIDTH;
        context.beginPath();
        context.moveTo( this.mvt.modelToViewX( this.dataSeries.getX( 0 ) ), this.mvt.modelToViewY( this.dataSeries.getY( 0 ) ) );
        for ( var i = 1; i < this.dataSeries.getLength(); i++ ) {
          var endPointX = this.mvt.modelToViewX( this.dataSeries.getX( i ) );
          var endPointY = this.mvt.modelToViewY( this.dataSeries.getY( i ) );
          context.lineTo( endPointX, endPointY );
        }
        context.stroke();
      }

      context.restore();
    }
  } );
} );