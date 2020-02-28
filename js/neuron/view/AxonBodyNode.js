// Copyright 2014-2020, University of Colorado Boulder
/**
 * Representation of the axon membrane body in the view.  This is the part
 * that the action potential travels along, and is supposed to look sort of
 * 3D.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import inherit from '../../../../phet-core/js/inherit.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import neuron from '../../neuron.js';
import TravelingActionPotentialCanvasNode from './TravelingActionPotentialCanvasNode.js';

// constants
const AXON_BODY_COLOR = new Color( 221, 216, 44 );
const LINE_WIDTH = 1;// STROKE
const SHOW_GRADIENT_LINE = false;

/**
 * Constructor for the AxonBodyNode
 * @param {NeuronModel} axonMembraneModel
 * @param {Bounds2} canvasBounds - bounds of the canvas for portraying the action potential, must be large enough
 * to not get cut off when view is at max zoom out
 * @param {ModelViewTransform2} mvt
 * @constructor
 */
function AxonBodyNode( axonMembraneModel, canvasBounds, mvt ) {

  Node.call( this, {} );
  this.axonMembraneModel = axonMembraneModel;
  this.mvt = mvt;

  // Add the axon body.
  const axonBodyShape = this.mvt.modelToViewShape( axonMembraneModel.axonBodyShape );
  const axonBodyBounds = axonBodyShape.bounds;
  const gradientOrigin = new Vector2( axonBodyBounds.getMaxX(), axonBodyBounds.getMaxY() );
  const gradientExtent = new Vector2( mvt.modelToViewX( axonMembraneModel.crossSectionCircleCenter.x ),
    mvt.modelToViewDeltaX( axonMembraneModel.crossSectionCircleRadius ) );
  const axonBodyGradient = new LinearGradient( gradientOrigin.x, gradientOrigin.y, gradientExtent.x, gradientExtent.y );
  axonBodyGradient.addColorStop( 0, AXON_BODY_COLOR.darkerColor( 0.5 ) );
  axonBodyGradient.addColorStop( 1, AXON_BODY_COLOR.brighterColor( 0.5 ) );

  const axonBody = new Path( axonBodyShape, {
    fill: axonBodyGradient,
    stroke: 'black',
    lineWidth: LINE_WIDTH
  } );
  this.addChild( axonBody );

  if ( SHOW_GRADIENT_LINE ) {
    // The following line is useful when trying to debug the gradient.
    this.addChild( new Line( gradientOrigin, gradientExtent ) );
  }

  const travelingActionPotentialNode = new TravelingActionPotentialCanvasNode( this.mvt, canvasBounds );
  this.addChild( travelingActionPotentialNode );

  this.axonMembraneModel.travelingActionPotentialStarted.addListener( function() {
    travelingActionPotentialNode.travelingActionPotentialStarted( axonMembraneModel.travelingActionPotential );
  } );

  this.axonMembraneModel.travelingActionPotentialEnded.addListener( function() {
    travelingActionPotentialNode.travelingActionPotentialEnded();
  } );
}

neuron.register( 'AxonBodyNode', AxonBodyNode );

inherit( Node, AxonBodyNode );
export default AxonBodyNode;