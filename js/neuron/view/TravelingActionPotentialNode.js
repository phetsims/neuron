// Copyright 2002-2011, University of Colorado
/**
 * Class that visually represents the action potential that travels down the membrane prior to reaching the cross
 * section.  It is meant to look sort of 'electric' or 'energetic'.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var BACKGROUND_COLOR = new Color( 204, 102, 255 );
  var BACKGROUND_OPTIONS = { stroke: BACKGROUND_COLOR, lineWidth: 10, lineCap: 'round', lineJoin: 'round', boundsMethod: 'unstroked' };
  var FOREGROUND_COLOR = Color.YELLOW;
  var FOREGROUND_OPTIONS = { stroke: FOREGROUND_COLOR, lineWidth: 5, lineCap: 'round', lineJoin: 'round',  boundsMethod: 'unstroked'  };

  /**
   * @param {TravelingActionPotential} travelingActionPotential
   * @param {ModelViewTransform2} mvt
   * @constructor
   */
  function TravelingActionPotentialNode( travelingActionPotential, mvt ) {

    var thisNode = this;
    Node.call( thisNode, { layerSplit: false } );

    var background = new Path( new Shape(), BACKGROUND_OPTIONS );
    var foreground = new Path( new Shape(), FOREGROUND_OPTIONS );

    thisNode.addChild( background );
    thisNode.addChild( foreground );

    // function that converts the model information into a shape in the view
    function updateShape() {
      var shapeDescription = travelingActionPotential.shapeDescription; // convenience var
      var actionPotentialShape;
      assert && assert( shapeDescription.mode === 'curve' || shapeDescription.mode === 'circle' );
      if ( travelingActionPotential.shapeDescription.mode === 'curve' ) {
        actionPotentialShape = new Shape();
        actionPotentialShape.moveTo(
          mvt.modelToViewX( shapeDescription.startPoint.x ),
          mvt.modelToViewY( shapeDescription.startPoint.y )
        );
        actionPotentialShape.cubicCurveTo(
          mvt.modelToViewX( shapeDescription.controlPoint1.x ),
          mvt.modelToViewY( shapeDescription.controlPoint1.y ),
          mvt.modelToViewX( shapeDescription.controlPoint2.x ),
          mvt.modelToViewY( shapeDescription.controlPoint2.y ),
          mvt.modelToViewX( shapeDescription.endPoint.x ),
          mvt.modelToViewY( shapeDescription.endPoint.y )
        );
      }
      else {
        actionPotentialShape = Shape.circle(
          mvt.modelToViewX( shapeDescription.circleCenter.x ),
          mvt.modelToViewY( shapeDescription.circleCenter.y ),
          mvt.modelToViewDeltaX( shapeDescription.circleRadius )
        )
      }
      foreground.setShape( actionPotentialShape );
      background.setShape( actionPotentialShape );
    }

    travelingActionPotential.shapeChangedProperty.link( function() {
      updateShape();
    } );
  }

  return inherit( Node, TravelingActionPotentialNode );
} );