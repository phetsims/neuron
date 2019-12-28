// Copyright 2015-2019, University of Colorado Boulder

/**
 * A node that represents a line created from a collection of points, intended to be used  to represent data on a
 * graph.  This is created as part of an effort to improve the performance of the dynamic chart in the Neuron sim.
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );

  // constants
  const LINE_COLOR = '#ff5500'; // colorblind-friendly red
  const LINE_WIDTH = 1;

  /**
   * @param {number} width
   * @param {number} height
   * @param {DynamicSeries} dataSeries
   * @param {ModelViewTransform2} mvt - model-view transform for mapping data points to the chart
   * @constructor
   */
  function DataLineCanvasNode( width, height, dataSeries, mvt ) {

    const self = this;
    this.dataSeries = dataSeries; // @private
    this.mvt = mvt; // @private

    // call super-constructor
    CanvasNode.call( this, { pickable: false, canvasBounds: new Bounds2( 0, 0, width, height ) } );

    // cause the canvas to get updated each time new data is added to the data series
    dataSeries.addDynamicSeriesListener( () => self.invalidatePaint() );
  }

  neuron.register( 'DataLineCanvasNode', DataLineCanvasNode );

  return inherit( CanvasNode, DataLineCanvasNode, {

    /**
     * method that paints the data line on the canvas
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
        context.moveTo( this.mvt.modelToViewX( this.dataSeries.data[ 0 ].x ), this.mvt.modelToViewY( this.dataSeries.data[ 0 ].y ) );
        for ( let i = 1; i < this.dataSeries.getLength(); i++ ) {
          const endPointX = this.mvt.modelToViewX( this.dataSeries.data[ i ].x );
          const endPointY = this.mvt.modelToViewY( this.dataSeries.data[ i ].y );
          context.lineTo( endPointX, endPointY );
        }
        context.stroke();
      }

      context.restore();
    }
  } );
} );