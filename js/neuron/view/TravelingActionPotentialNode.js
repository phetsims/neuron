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
  var Bounds2 = require( 'DOT/Bounds2' );

  // constants
  var BACKGROUND_COLOR = new Color( 204, 102, 255 );
  var BACKGROUND_STROKE = {stroke: BACKGROUND_COLOR, lineWidth: 10, lineCap: 'round', lineJoin: 'round'};
  var FOREGROUND_COLOR = Color.YELLOW;
  var FOREGROUND_STROKE = {stroke: FOREGROUND_COLOR, lineWidth: 5, lineCap: 'round', lineJoin: 'round'};

  /**
   * The node that will represent the traveling action potential.
   * @param {TravelingActionPotential} travelingActionPotential
   * @param {ModelViewTransform2} mvt
   * @constructor
   */
  function TravelingActionPotentialNode( travelingActionPotential, mvt ) {

    var thisNode = this;
    Node.call( thisNode );

    var background = new Path( new Shape(), BACKGROUND_STROKE );
    var foreground = new Path( new Shape(), FOREGROUND_STROKE );

    var bounds2 = new Bounds2( 0, 0, 0, 0 );

    function computeShapeBounds() {
      return bounds2;
    }

    // Skip bounds computation to improve performance
    background.computeShapeBounds = computeShapeBounds;
    foreground.computeShapeBounds = computeShapeBounds;

    thisNode.addChild( background );
    thisNode.addChild( foreground );

    function updateShape() {
      var transformedShape = mvt.modelToViewShape( travelingActionPotential.getShape() );
      foreground.setShape( transformedShape );
      background.setShape( transformedShape );
    }

    travelingActionPotential.shapeChangedProperty.link( function( shapeChanged ) {
      updateShape();
    } );
  }

  return inherit( Node, TravelingActionPotentialNode );

} );