// Copyright 2002-2011, University of Colorado
/**
 * Class that portrays charge symbols, i.e. pluses ('+') and minuses ('-').
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


  var EDGE_STROKE = 0.3;
  var EDGE_COLOR = new Color( 255, 102, 0 );
  var FILL_COLOR = Color.WHITE;
  // Factor that controls the thickness of the plus and minus sign, must be
  // less than 1.
  var THICKNESS_FACTOR = 0.3;

  /**
   *
   * @param axonModel - Model where the potential is obtained.
   * @param maxWidth - Max width in screen coords, which also defines max height.
   * @param maxPotential - The potential at which the max size is shown.
   * @param polarityReversed - Whether the polarity is reversed, meaning that
   * a plus is shown for a negative value and vice versa.
   */
  function ChargeSymbolNode( axonModel, maxWidth, maxPotential, polarityReversed ) {
    var thisNode = this;
    Node.call( thisNode );
    this.axonModel = axonModel;
    this.maxWidth = maxWidth;
    this.polarityReversed = polarityReversed;
    this.maxPotential = maxPotential;

    // Create the shape that represents this particle.
    var representation = new Path( new Shape(), {fill: FILL_COLOR, lineWidth: EDGE_STROKE, stroke: EDGE_COLOR} );
    thisNode.addChild( representation );


    function updateRepresentation() {

      var width = maxWidth * Math.abs( (axonModel.getMembranePotential() / maxPotential) );

      var drawPlusSymbol = (axonModel.getMembranePotential() > 0 && !polarityReversed) ||
                           (axonModel.getMembranePotential() < 0 && polarityReversed);

      if ( drawPlusSymbol ) {
        representation.setShape( drawPlusSign( width ) );
      }
      else {
        representation.setShape( drawMinusSign( width ) );
      }

    }

    function drawPlusSign( width ) {
      var path = new Shape();
      var thickness = width * THICKNESS_FACTOR;
      var halfThickness = thickness / 2;
      var halfWidth = width / 2;
      path.moveTo( -halfWidth, -halfThickness );
      path.lineTo( -halfWidth, halfThickness );
      path.lineTo( -halfThickness, halfThickness );
      path.lineTo( -halfThickness, halfWidth );
      path.lineTo( halfThickness, halfWidth );
      path.lineTo( halfThickness, halfThickness );
      path.lineTo( halfWidth, halfThickness );
      path.lineTo( halfWidth, -halfThickness );
      path.lineTo( halfThickness, -halfThickness );
      path.lineTo( halfThickness, -halfWidth );
      path.lineTo( -halfThickness, -halfWidth );
      path.lineTo( -halfThickness, -halfThickness );
      path.close();
      return path;
    }

    function drawMinusSign( width ) {
      var height = width * THICKNESS_FACTOR;
      return new Shape().rect( -width / 2, -height / 2, width, height );
    }

    axonModel.membranePotentialProperty.link( function( membranePotential ) {
      updateRepresentation();
    } );


  }

  return inherit( Node, ChargeSymbolNode );

} );


//// Copyright 2002-2011, University of Colorado
//
//package edu.colorado.phet.neuron.view;
//
//import java.awt.BasicStroke;
//import java.awt.Color;
//import java.awt.Shape;
//import java.awt.Stroke;
//import java.awt.geom.Rectangle2D;
//
//import edu.colorado.phet.common.phetcommon.view.util.DoubleGeneralPath;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.colorado.phet.neuron.model.NeuronModel;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolo.nodes.PPath;
//

//public class ChargeSymbolNode extends PNode {
//

//

//
//  private final NeuronModel axonModel;
//  private final double maxPotential;
//  private final double maxWidth;
//  private final boolean polarityReversed;
//  private final PPath representation;
//

//  public ChargeSymbolNode( NeuronModel axonModel, double maxWidth, double maxPotential, boolean polarityReversed ) {

//
//    axonModel.addListener(new NeuronModel.Adapter(){
//      public void membranePotentialChanged() {
//        updateRepresentation();
//      }
//    });
//
//    // Create the shape that represents this particle.
//    representation = new PhetPPath(FILL_COLOR, EDGE_STROKE, EDGE_COLOR);

//    updateRepresentation();
//  }
//


//}
