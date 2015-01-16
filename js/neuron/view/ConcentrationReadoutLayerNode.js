//  Copyright 2002-2014, University of Colorado Boulder

//REVIEW - header comment is missing
/**
 *
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Vector2 = require( 'DOT/Vector2' );
  var PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  var SodiumIon = require( 'NEURON/neuron/model/SodiumIon' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Util = require( 'DOT/Util' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // strings
  var concentrationReadoutPattern0label1value2unitsString = require( 'string!NEURON/concentrationReadoutPattern.0label.1value.2units' );
  var potassiumChemicalSymbolString = require( 'string!NEURON/potassiumChemicalSymbol' );
  var sodiumChemicalSymbolString = require( 'string!NEURON/sodiumChemicalSymbol' );
  var unitsmMString = require( 'string!NEURON/units.mM' );

  // Constants that control aspects of the concentration readout.
  var CONCENTRATION_READOUT_NUM_PLACES = 5;
  var READ_OUT_FONT_SIZE = 16;

  /**
   *
   * @param {NeuronModel} neuronModel
   * @param {Property.<number>} zoomProperty
   * @param {Node} zoomableRootNode
   * @param {AxonCrossSectionNode} axonCrossSectionNode
   * @constructor
   */
  function ConcentrationReadoutLayerNode( neuronModel, zoomProperty, zoomableRootNode, axonCrossSectionNode ) {

    var thisNode = this;
    Node.call( thisNode );

    // Concentration readouts.
    var sodiumExteriorConcentrationReadout = new Text( "", {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new SodiumIon().getRepresentationColor()
    } );
    var sodiumInteriorConcentrationReadout = new Text( "", {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new SodiumIon().getRepresentationColor()
    } );
    var potassiumExteriorConcentrationReadout = new Text( "", {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new PotassiumIon().getRepresentationColor().darkerColor( 0.5 )
    } );
    var potassiumInteriorConcentrationReadout = new Text( "", {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new PotassiumIon().getRepresentationColor().darkerColor( 0.5 )
    } );

    // Add the concentration readouts.
    thisNode.addChild( sodiumExteriorConcentrationReadout );
    thisNode.addChild( sodiumInteriorConcentrationReadout );
    thisNode.addChild( potassiumExteriorConcentrationReadout );
    thisNode.addChild( potassiumInteriorConcentrationReadout );

    function updateConcentrationReadoutValues() {

      var text = createConcentrationReadoutText( sodiumChemicalSymbolString, neuronModel.getSodiumExteriorConcentration() );
      sodiumExteriorConcentrationReadout.text = text;

      text = createConcentrationReadoutText( sodiumChemicalSymbolString, neuronModel.getSodiumInteriorConcentration() );
      sodiumInteriorConcentrationReadout.text = text;

      text = createConcentrationReadoutText( potassiumChemicalSymbolString, neuronModel.getPotassiumExteriorConcentration() );
      potassiumExteriorConcentrationReadout.text = text;

      text = createConcentrationReadoutText( potassiumChemicalSymbolString, neuronModel.getPotassiumInteriorConcentration() );
      potassiumInteriorConcentrationReadout.text = text;


    }

    function createConcentrationReadoutText( label, value ) {
      var valueText = Util.toFixed( value, CONCENTRATION_READOUT_NUM_PLACES );
      //  var valueText = CONCENTRATION_READOUT_FORMATTER.format( Math.round( value,  ) );
      return StringUtils.format( concentrationReadoutPattern0label1value2unitsString, label, valueText, unitsmMString );

    }

    function positionConcentrationReadoutPositions() {
      // Set the exterior cell readouts to be next to the button but
      // aligned on the right side.
      // The Java version uses the Stimulate Button Position a a reference.Since in HTML version the button
      // is positioned at the bottom, the code now uses the following bounds as a reference.
      var referenceBounds = new Bounds2( 30, 20, 70, 40 ); // Approximation

      var maxExteriorReadoutWidth = Math.max( potassiumExteriorConcentrationReadout.bounds.width, sodiumExteriorConcentrationReadout.bounds.width );
      potassiumExteriorConcentrationReadout.x = referenceBounds.maxX + maxExteriorReadoutWidth - potassiumExteriorConcentrationReadout.bounds.width + 4;
      potassiumExteriorConcentrationReadout.y = referenceBounds.y;

      //Place it below
      sodiumExteriorConcentrationReadout.x = referenceBounds.maxX + maxExteriorReadoutWidth - sodiumExteriorConcentrationReadout.bounds.width + 4;
      sodiumExteriorConcentrationReadout.y = referenceBounds.bottom;

      // Set the interior cell readouts to be in a location that will always
      // be in the cell regardless of how zoomed out or in it is.


      var topCenterOfMembrane = new Vector2( axonCrossSectionNode.centerX, axonCrossSectionNode.minY );

      // Note: The following is a bit dodgey, and there may be a better way.
      // The intent is to find the top of the membrane in screen coordinates
      // and then position the readouts some fixed distance below it.  This
      // turns out to be a bit difficult when the user can zoom in and out,
      // since the location of the top of the membrane changes, as does the
      // apparent thickness of the membrane.  To get this to work, it was
      // necessary to get the transform of the node that does the zooming,
      // use it, and fudge the offset a bit based on the scale factor.
      // Complicated, no doubt, but it works (at least for now).  If there
      // is some easier way then, by all means, implement it.

      var yOffset = 140 + zoomableRootNode.getScaleVector().x * 9;  // Empirically determined.

      // topCenterOfMembrane = axonCrossSectionNode.localToGlobalPoint( topCenterOfMembrane );
      var maxReadoutWidth = Math.max( potassiumInteriorConcentrationReadout.width, sodiumInteriorConcentrationReadout.getBounds().width );
      potassiumInteriorConcentrationReadout.x = topCenterOfMembrane.x - maxReadoutWidth / 2;
      potassiumInteriorConcentrationReadout.y = topCenterOfMembrane.y + yOffset;
      sodiumInteriorConcentrationReadout.x = potassiumInteriorConcentrationReadout.x;
      sodiumInteriorConcentrationReadout.y = potassiumInteriorConcentrationReadout.bottom + 15;
    }

    positionConcentrationReadoutPositions();
    updateConcentrationReadoutValues();

    zoomProperty.link( function( zoomvalue ) {

      if ( neuronModel.concentrationReadoutVisible ) {
        positionConcentrationReadoutPositions();
      }

    } );

    neuronModel.concentrationReadoutVisibleProperty.link( function() {
      positionConcentrationReadoutPositions();
    } );

    neuronModel.concentrationChangedProperty.link( function( concentrationChanged ) {
      if ( concentrationChanged && thisNode.isVisible() ) {
        updateConcentrationReadoutValues();
      }
    } );

  }

  return inherit( Node, ConcentrationReadoutLayerNode );

} );