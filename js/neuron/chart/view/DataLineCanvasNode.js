// Copyright 2002-2015, University of Colorado Boulder

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
    dataSeries.on( 'cleared', function() {
      self.numSegments = 0;
      self.invalidatePaint();
    } );
  }

  return inherit( CanvasNode, DataLineCanvasNode, {

    /**
     * A method that paints the data line on the canvas.  For maximum performance, this adds points to the end of an
     * existing line when possible rather than redrawing the entire line with each update.
     *
     * @param wrapper
     * @protected
     * @override
     */
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;

      if ( this.numSegments < this.dataSeries.getLength() - 1 ) {

        if ( this.numSegments === 0 ) {
          // this is the first segment, so start the new path
          context.beginPath();
        }

        // draw a segment from the end of the previous segment to the new data point or points
        context.strokeStyle = '#ff5500'; // colorblind-friendly red
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

      // TODO: The following works to draw the entire shape on each update, and was useful when getting this class to
      // work initially.  Remove it once the incremental drawing code is fully proven out.
      //if ( this.dataSeries.getLength() > 0 ){
      //  context.beginPath();
      //  context.moveTo( this.mvt.modelToViewX( this.dataSeries.getX( 0 ) ),
      //    this.mvt.modelToViewY( this.dataSeries.getY( 0 ) ) );
      //  context.strokeStyle = '#ff5500'; // colorblind-friendly red
      //  for ( var i = 0; i < this.dataSeries.getLength(); i++ ) {
      //    context.lineTo( this.mvt.modelToViewX( this.dataSeries.getX( i ) ),
      //      this.mvt.modelToViewY( this.dataSeries.getY( i ) ) );
      //    context.stroke();
      //  }
      //}
    }
  } );
} );