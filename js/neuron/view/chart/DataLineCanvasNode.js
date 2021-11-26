// Copyright 2015-2021, University of Colorado Boulder

/**
 * A node that represents a line created from a collection of points, intended to be used  to represent data on a
 * graph.  This is created as part of an effort to improve the performance of the dynamic chart in the Neuron sim.
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import { CanvasNode } from '../../../../../scenery/js/imports.js';
import neuron from '../../../neuron.js';

// constants
const LINE_COLOR = '#ff5500'; // colorblind-friendly red
const LINE_WIDTH = 1;

class DataLineCanvasNode extends CanvasNode {

  /**
   * @param {number} width
   * @param {number} height
   * @param {DynamicSeries} dataSeries
   * @param {ModelViewTransform2} mvt - model-view transform for mapping data points to the chart
   */
  constructor( width, height, dataSeries, mvt ) {

    // call super-constructor
    super( { pickable: false, canvasBounds: new Bounds2( 0, 0, width, height ) } );

    this.dataSeries = dataSeries; // @private
    this.mvt = mvt; // @private

    // cause the canvas to get updated each time new data is added to the data series
    dataSeries.addDynamicSeriesListener( () => this.invalidatePaint() );
  }

  /**
   * method that paints the data line on the canvas
   * @param {CanvasRenderingContext2D} context
   * @protected
   * @override
   */
  paintCanvas( context ) {

    context.save();

    if ( this.dataSeries.getLength() >= 2 ) {
      context.strokeStyle = LINE_COLOR;
      context.lineWidth = LINE_WIDTH;
      context.beginPath();
      context.moveTo( this.mvt.modelToViewX( this.dataSeries.getDataPoint( 0 ).x ), this.mvt.modelToViewY( this.dataSeries.getDataPoint( 0 ).y ) );
      for ( let i = 1; i < this.dataSeries.getLength(); i++ ) {
        const endPointX = this.mvt.modelToViewX( this.dataSeries.getDataPoint( i ).x );
        const endPointY = this.mvt.modelToViewY( this.dataSeries.getDataPoint( i ).y );
        context.lineTo( endPointX, endPointY );
      }
      context.stroke();
    }

    context.restore();
  }
}

neuron.register( 'DataLineCanvasNode', DataLineCanvasNode );

export default DataLineCanvasNode;