// Copyright 2002-2011, University of Colorado
/**

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
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );

  var BACKGROUND_COLOR = new Color( 204, 102, 255 );
  var backgroundStroke = {stroke: BACKGROUND_COLOR, lineWidth: 10, lineCap: 'round', lineJoin: 'round'};
  var FOREGROUND_COLOR = Color.YELLOW;
  var foregroundStroke = {stroke: FOREGROUND_COLOR, lineWidth: 5, lineCap: 'round', lineJoin: 'round'};

  /**
   * The node that will represent the traveling action potential.
   * @param {TravelingActionPotential} travelingActionPotential
   * @param {ModelViewTransform2} mvt
   * @constructor
   */
  function TravelingActionPotentialNode( travelingActionPotential, mvt ) {

    var thisNode = this;
    Node.call( thisNode, {} );

    var background = new Path( new Shape(), backgroundStroke );
    var foreground = new Path( new Shape(), foregroundStroke );

    thisNode.addChild( background );
    thisNode.addChild( foreground );

    function updateShape() {
      var transformedShape = mvt.modelToViewShape( travelingActionPotential.getShape() );
      foreground.setShape( transformedShape );
      background.setShape( transformedShape );

    }


    travelingActionPotential.shapeChangedProperty.link( updateShape );
  }

  return inherit( Node, TravelingActionPotentialNode );

} );