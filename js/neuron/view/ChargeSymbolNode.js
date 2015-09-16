// Copyright 2002-2011, University of Colorado
/**
 * Class that portrays charge symbols, i.e. pluses ('+') and minuses ('-').
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var EDGE_STROKE = 0.3;
  var EDGE_COLOR = new Color( 255, 102, 0 );
  var FILL_COLOR = Color.WHITE;
  var ZERO_BOUNDS = new Bounds2( 0, 0, 0, 0 );

  // basic, unscaled shapes for the minus and plus signs
  var UNSCALED_SYMBOL_WIDTH = 30;
  var UNSCALED_THICKNESS = UNSCALED_SYMBOL_WIDTH * 0.4;
  var UNSCALED_MINUS_SIGN_SHAPE = Shape.rect(
    -UNSCALED_SYMBOL_WIDTH / 2,
    -UNSCALED_THICKNESS / 2,
    UNSCALED_SYMBOL_WIDTH,
    UNSCALED_THICKNESS
  );
  var UNSCALED_PLUS_SIGN_SHAPE = new Shape()
    .moveTo( -UNSCALED_SYMBOL_WIDTH / 2, -UNSCALED_THICKNESS / 2 )
    .lineTo( -UNSCALED_SYMBOL_WIDTH / 2, UNSCALED_THICKNESS / 2 )
    .lineTo( -UNSCALED_THICKNESS / 2, UNSCALED_THICKNESS / 2 )
    .lineTo( -UNSCALED_THICKNESS / 2, UNSCALED_SYMBOL_WIDTH / 2 )
    .lineTo( UNSCALED_THICKNESS / 2, UNSCALED_SYMBOL_WIDTH / 2 )
    .lineTo( UNSCALED_THICKNESS / 2, UNSCALED_THICKNESS / 2 )
    .lineTo( UNSCALED_SYMBOL_WIDTH / 2, UNSCALED_THICKNESS / 2 )
    .lineTo( UNSCALED_SYMBOL_WIDTH / 2, -UNSCALED_THICKNESS / 2 )
    .lineTo( UNSCALED_THICKNESS / 2, -UNSCALED_THICKNESS / 2 )
    .lineTo( UNSCALED_THICKNESS / 2, -UNSCALED_SYMBOL_WIDTH / 2 )
    .lineTo( -UNSCALED_THICKNESS / 2, -UNSCALED_SYMBOL_WIDTH / 2 )
    .lineTo( -UNSCALED_THICKNESS / 2, -UNSCALED_THICKNESS / 2 )
    .close();

  /**
   *
   * @param {NeuronModel} axonModel - Model where the potential is obtained.
   * @param {number} maxWidth - Max width in screen coords, which also defines max height.
   * @param {number} maxPotential - The potential at which the max size is shown.
   * @param {boolean} polarityReversed - Whether the polarity is reversed, meaning that
   * a plus is shown for a negative value and vice versa.
   */
  function ChargeSymbolNode( axonModel, maxWidth, maxPotential, polarityReversed ) {
    var thisNode = this;
    Node.call( thisNode );

    // Create the shape that represents this particle.
    var representation = new Path( new Shape(), {
      fill: FILL_COLOR,
      lineWidth: EDGE_STROKE,
      stroke: EDGE_COLOR
    } );

    // override bounds computation for better performance
    representation.computeShapeBounds = function() { return ZERO_BOUNDS; };

    // pre-allocate a matrix to use for scaling
    var scalingMatrix = Matrix3.scaling( 1, 1 );

    // function to return the appropriate symbol size and shape based on the given membrane potential
    function getSymbolShape() {
      var membranePotential = axonModel.getMembranePotential();
      var scale = ( maxWidth / UNSCALED_SYMBOL_WIDTH ) * ( membranePotential / maxPotential );
      var shape;
      if ( ( membranePotential > 0 && !polarityReversed ) ||
           ( membranePotential < 0 && polarityReversed ) ) {
        shape = UNSCALED_PLUS_SIGN_SHAPE;
      }
      else {
        shape = UNSCALED_MINUS_SIGN_SHAPE;
      }
      scalingMatrix.setToScale( scale, scale );
      return shape.transformed( scalingMatrix );
    }

    thisNode.addChild( representation );

    function updateRepresentation() {
      representation.setShape( getSymbolShape() );
    }

    axonModel.membranePotentialProperty.link( function( membranePotential ) {
      if ( axonModel.chargesShown ) {
        updateRepresentation();
      }
    } );

    axonModel.chargesShownProperty.link( function( chargesShown ) {
      thisNode.visible = chargesShown;
      if ( chargesShown ) {
        updateRepresentation();
      }
    } );
  }

  return inherit( Node, ChargeSymbolNode );
} );

