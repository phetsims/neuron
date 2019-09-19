// Copyright 2014-2017, University of Colorado Boulder
/**
 * Class that portrays charge symbols, i.e. pluses ('+') and minuses ('-').
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const neuron = require( 'NEURON/neuron' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );

  // constants
  const EDGE_STROKE = 0.3;
  const EDGE_COLOR = new Color( 255, 102, 0 );
  const FILL_COLOR = Color.WHITE;
  const UNSCALED_SYMBOL_WIDTH = 30;
  const FIXED_BOUNDS = new Bounds2( -UNSCALED_SYMBOL_WIDTH / 2, -UNSCALED_SYMBOL_WIDTH / 2, UNSCALED_SYMBOL_WIDTH / 2, UNSCALED_SYMBOL_WIDTH / 2 );

  // basic, unscaled shapes for the minus and plus signs
  const UNSCALED_THICKNESS = UNSCALED_SYMBOL_WIDTH * 0.4;
  const UNSCALED_MINUS_SIGN_SHAPE = Shape.rect(
    -UNSCALED_SYMBOL_WIDTH / 2,
    -UNSCALED_THICKNESS / 2,
    UNSCALED_SYMBOL_WIDTH,
    UNSCALED_THICKNESS
  );
  const UNSCALED_PLUS_SIGN_SHAPE = new Shape()
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
   * @param {boolean} polarityReversed - Whether the polarity is reversed, meaning that a plus is shown for a negative
   * value and vice versa.
   */
  function ChargeSymbolNode( axonModel, maxWidth, maxPotential, polarityReversed ) {
    const self = this;
    Path.call( this, new Shape(), {
      fill: FILL_COLOR,
      lineWidth: EDGE_STROKE,
      stroke: EDGE_COLOR
    } );

    // pre-allocate a matrix to use for scaling
    const scalingMatrix = Matrix3.scaling( 1, 1 );

    // function to return the appropriate symbol size and shape based on the given membrane potential
    function getSymbolShape() {
      const membranePotential = axonModel.getMembranePotential();
      const scale = ( maxWidth / UNSCALED_SYMBOL_WIDTH ) * ( membranePotential / maxPotential );
      let shape;
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

    function updateRepresentation() {
      self.setShape( getSymbolShape() );
    }

    axonModel.membranePotentialProperty.link( function() {
      if ( axonModel.chargesShownProperty.get() ) {
        updateRepresentation();
      }
    } );

    axonModel.chargesShownProperty.link( function( chargesShown ) {
      if ( chargesShown ) {
        updateRepresentation();
      }
    } );
  }

  neuron.register( 'ChargeSymbolNode', ChargeSymbolNode );

  return inherit( Path, ChargeSymbolNode, {

    // @public, @override
    computeShapeBounds: function() {
      // override bounds computation for better performance
      return FIXED_BOUNDS;
    }

  } );
} );

