// Copyright 2002-2011, University of Colorado
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
  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Color = require( 'SCENERY/util/Color' );
  var Vector2 = require( 'DOT/Vector2' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var TravelingActionPotentialNode = require( 'NEURON/neuron/view/TravelingActionPotentialNode' );


  var AXON_BODY_COLOR = new Color( 221, 216, 44 );
  var LINE_WIDTH = 1;// STROKE
  var SHOW_GRADIENT_LINE = false;

  /**
   * Constructor for the AxonBodyNode
   * @param {NeuronModel} axonMembraneModel
   * @param {ModelViewTransform2} transform
   * @constructor
   */
  function AxonBodyNode( axonMembraneModel, transform ) {
    var thisNode = this;
    Node.call( thisNode, {} );
    thisNode.axonMembraneModel = axonMembraneModel;
    thisNode.mvt = transform;

    // Add the axon body.
    var axonBodyShape = thisNode.mvt.modelToViewShape( axonMembraneModel.axonBodyShape );
    var axonBodyBounds = axonBodyShape.bounds;
    var crossSectionBounds = thisNode.mvt.modelToViewShape( axonMembraneModel.getCrossSectionEllipseShape() ).bounds;
    var gradientOrigin = new Vector2( axonBodyBounds.getMaxX(), axonBodyBounds.getMaxY() );
    var gradientExtent = new Vector2( crossSectionBounds.getCenterX(), crossSectionBounds.getY() );
    var axonBodyGradient = new LinearGradient( gradientOrigin.x, gradientOrigin.y, gradientExtent.x, gradientExtent.y );
    axonBodyGradient.addColorStop( 0, AXON_BODY_COLOR.darkerColor( 0.5 ) );
    axonBodyGradient.addColorStop( 1, AXON_BODY_COLOR.brighterColor( 0.5 ) );

    var axonBody = new Path( axonBodyShape, {
      fill: axonBodyGradient,
      stroke: 'black',
      lineWidth: LINE_WIDTH
    } );
    thisNode.addChild( axonBody );

    if ( SHOW_GRADIENT_LINE ) {
      // The following line is useful when trying to debug the gradient.
      thisNode.addChild( new Line( gradientOrigin, gradientExtent ) );
    }

    var travelingActionPotentialNode;

    thisNode.axonMembraneModel.travelingActionPotentialStartedProperty.link( function( started ) {
      if ( started ) {
        travelingActionPotentialNode = new TravelingActionPotentialNode( thisNode.axonMembraneModel.travelingActionPotential, thisNode.mvt );
        thisNode.addChild( travelingActionPotentialNode );
      }
    } );

    thisNode.axonMembraneModel.travelingActionPotentialEndedProperty.link( function( ended ) {
      if ( ended ) {
        thisNode.removeChild( travelingActionPotentialNode );
        travelingActionPotentialNode = null;
      }
    } );

  }


  return inherit( Node, AxonBodyNode );
} )
;
