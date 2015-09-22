// Copyright 2002-2014, University of Colorado Boulder
/**
 * This node acts as a layer to which all Concentration readouts are added
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
  var READ_OUT_FONT_SIZE = 14;

  /**
   * @param {NeuronModel} neuronModel
   * @param {Property.<number>} zoomProperty
   * @param {Node} zoomableRootNode
   * @param {Bounds2} viewPortBounds
   * @param {AxonCrossSectionNode} axonCrossSectionNode
   * @constructor
   */
  function ConcentrationReadoutLayerNode( neuronModel, zoomProperty, zoomableRootNode, viewPortBounds, axonCrossSectionNode ) {

    var thisNode = this;
    Node.call( thisNode );
    this.zoomableRootNode = zoomableRootNode;

    // Concentration readouts.
    var sodiumExteriorConcentrationReadout = new Text( "", {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new SodiumIon().getRepresentationColor(),
      boundsMethod: 'fast'
    } );
    var sodiumInteriorConcentrationReadout = new Text( "", {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new SodiumIon().getRepresentationColor(),
      boundsMethod: 'fast'
    } );
    var potassiumExteriorConcentrationReadout = new Text( "", {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new PotassiumIon().getRepresentationColor().darkerColor( 0.5 ),
      boundsMethod: 'fast'
    } );
    var potassiumInteriorConcentrationReadout = new Text( "", {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new PotassiumIon().getRepresentationColor().darkerColor( 0.5 ),
      boundsMethod: 'fast'
    } );

    // Add the concentration readouts.
    thisNode.addChild( sodiumExteriorConcentrationReadout );
    thisNode.addChild( sodiumInteriorConcentrationReadout );
    thisNode.addChild( potassiumExteriorConcentrationReadout );
    thisNode.addChild( potassiumInteriorConcentrationReadout );

    function updateConcentrationReadoutValues() {
      sodiumExteriorConcentrationReadout.text =
        createConcentrationReadoutText( sodiumChemicalSymbolString, neuronModel.getSodiumExteriorConcentration() );
      sodiumInteriorConcentrationReadout.text =
        createConcentrationReadoutText( sodiumChemicalSymbolString, neuronModel.getSodiumInteriorConcentration() );
      potassiumExteriorConcentrationReadout.text =
        createConcentrationReadoutText( potassiumChemicalSymbolString, neuronModel.getPotassiumExteriorConcentration() );
      potassiumInteriorConcentrationReadout.text =
        createConcentrationReadoutText( potassiumChemicalSymbolString, neuronModel.getPotassiumInteriorConcentration() );
    }

    function createConcentrationReadoutText( label, value ) {
      var valueText = Util.toFixed( value, CONCENTRATION_READOUT_NUM_PLACES );
      return StringUtils.format( concentrationReadoutPattern0label1value2unitsString, label, valueText, unitsmMString );
    }

    function updateConcentrationReadoutPositions() {

      var maxExteriorReadoutWidth = Math.max( potassiumExteriorConcentrationReadout.bounds.width,
        sodiumExteriorConcentrationReadout.bounds.width );

      // Place the exterior readouts in the upper left of the view port.
      potassiumExteriorConcentrationReadout.left = viewPortBounds.minX + maxExteriorReadoutWidth -
                                                   potassiumExteriorConcentrationReadout.bounds.width + 4;
      potassiumExteriorConcentrationReadout.top = viewPortBounds.minY + 4;
      sodiumExteriorConcentrationReadout.top = potassiumExteriorConcentrationReadout.bottom;
      sodiumExteriorConcentrationReadout.right = potassiumExteriorConcentrationReadout.right;

      // Place the interior readout in a place where it can be seen whether or not the chart is showing and doesn't
      // overlap with the membrane of the neuron.  The Y position calculation is empirically determined.
      var yOffset = 80 + thisNode.zoomableRootNode.transform.transformY( 80 ) * 0.5;  // Empirically determined.

      potassiumInteriorConcentrationReadout.centerX = axonCrossSectionNode.centerX;
      potassiumInteriorConcentrationReadout.top = viewPortBounds.y + yOffset;
      sodiumInteriorConcentrationReadout.top = potassiumInteriorConcentrationReadout.bottom;
      sodiumInteriorConcentrationReadout.right = potassiumInteriorConcentrationReadout.right;
    }

    updateConcentrationReadoutPositions();
    updateConcentrationReadoutValues();

    zoomProperty.link( function( zoomvalue ) {
      if ( neuronModel.concentrationReadoutVisible ) {
        updateConcentrationReadoutPositions();
      }
    } );

    neuronModel.concentrationReadoutVisibleProperty.link( function() {
      updateConcentrationReadoutPositions();
    } );

    neuronModel.concentrationChangedProperty.link( function( concentrationChanged ) {
      if ( concentrationChanged && thisNode.isVisible() ) {
        updateConcentrationReadoutValues();
      }
    } );

  }

  return inherit( Node, ConcentrationReadoutLayerNode );

} );