// Copyright 2014-2015, University of Colorado Boulder
/**
 * Representation of the axon membrane body in the view.  This is the part
 * that the action potential travels along, and is supposed to look sort of
 * 3D.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Color = require( 'SCENERY/util/Color' );
  var Vector2 = require( 'DOT/Vector2' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var TravelingActionPotentialCanvasNode = require( 'NEURON/neuron/view/TravelingActionPotentialCanvasNode' );

  // constants
  var AXON_BODY_COLOR = new Color( 221, 216, 44 );
  var LINE_WIDTH = 1;// STROKE
  var SHOW_GRADIENT_LINE = false;

  /**
   * Constructor for the AxonBodyNode
   * @param {NeuronModel} axonMembraneModel
   * @param {Bounds2} canvasBounds - bounds of the canvas for portraying the action potential, must be large enough
   * to not get cut off when view is at max zoom out
   * @param {ModelViewTransform2} mvt
   * @constructor
   */
  function AxonBodyNode( axonMembraneModel, canvasBounds, mvt ) {

    var self = this;
    Node.call( self, {} );
    self.axonMembraneModel = axonMembraneModel;
    self.mvt = mvt;

    // Add the axon body.
    var axonBodyShape = self.mvt.modelToViewShape( axonMembraneModel.axonBodyShape );
    var axonBodyBounds = axonBodyShape.bounds;
    var gradientOrigin = new Vector2( axonBodyBounds.getMaxX(), axonBodyBounds.getMaxY() );
    var gradientExtent = new Vector2( mvt.modelToViewX( axonMembraneModel.crossSectionCircleCenter.x ),
      mvt.modelToViewDeltaX( axonMembraneModel.crossSectionCircleRadius ) );
    var axonBodyGradient = new LinearGradient( gradientOrigin.x, gradientOrigin.y, gradientExtent.x, gradientExtent.y );
    axonBodyGradient.addColorStop( 0, AXON_BODY_COLOR.darkerColor( 0.5 ) );
    axonBodyGradient.addColorStop( 1, AXON_BODY_COLOR.brighterColor( 0.5 ) );

    var axonBody = new Path( axonBodyShape, {
      fill: axonBodyGradient,
      stroke: 'black',
      lineWidth: LINE_WIDTH
    } );
    self.addChild( axonBody );

    if ( SHOW_GRADIENT_LINE ) {
      // The following line is useful when trying to debug the gradient.
      self.addChild( new Line( gradientOrigin, gradientExtent ) );
    }

    var travelingActionPotentialNode = new TravelingActionPotentialCanvasNode( self.mvt, canvasBounds );
    this.addChild( travelingActionPotentialNode );

    self.axonMembraneModel.travelingActionPotentialStarted.addListener( function() {
      travelingActionPotentialNode.travelingActionPotentialStarted( axonMembraneModel.travelingActionPotential );
    } );

    self.axonMembraneModel.travelingActionPotentialEnded.addListener( function() {
        travelingActionPotentialNode.travelingActionPotentialEnded();
    } );
  }

  neuron.register( 'AxonBodyNode', AxonBodyNode );

  return inherit( Node, AxonBodyNode );
} );
