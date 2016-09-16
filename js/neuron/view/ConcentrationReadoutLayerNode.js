// Copyright 2014-2015, University of Colorado Boulder
/**
 * This node acts as a layer to which all concentration readouts are added
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
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var SodiumIon = require( 'NEURON/neuron/model/SodiumIon' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Util = require( 'DOT/Util' );

  // strings
  var concentrationReadoutPattern0Label1Value2UnitsString = require( 'string!NEURON/concentrationReadoutPattern.0label.1value.2units' );
  var potassiumChemicalSymbolString = require( 'string!NEURON/potassiumChemicalSymbol' );
  var sodiumChemicalSymbolString = require( 'string!NEURON/sodiumChemicalSymbol' );
  var unitsMMString = require( 'string!NEURON/units.mM' );

  // constants that control aspects of the concentration readout.
  var CONCENTRATION_READOUT_NUM_PLACES = 5;
  var READ_OUT_FONT_SIZE = 14;
  var READOUT_BOUNDS_DILATION = 2;
  var INVISIBLE_RECT_FILL = 'rgba( 0, 0, 0, 0 )';

  /**
   * @param {NeuronModel} neuronModel
   * @param {Property.<number>} zoomProperty
   * @param {Node} zoomableRootNode
   * @param {Bounds2} viewPortBounds
   * @param {AxonCrossSectionNode} axonCrossSectionNode
   * @constructor
   */
  function ConcentrationReadoutLayerNode( neuronModel, zoomProperty, zoomableRootNode, viewPortBounds, axonCrossSectionNode ) {

    var self = this;
    Node.call( this );
    this.zoomableRootNode = zoomableRootNode;

    // Concentration readouts.
    var sodiumExteriorConcentrationReadout = new Text( '', {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new SodiumIon().getRepresentationColor()
    } );
    var sodiumInteriorConcentrationReadout = new Text( '', {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new SodiumIon().getRepresentationColor()
    } );
    var potassiumExteriorConcentrationReadout = new Text( '', {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new PotassiumIon().getRepresentationColor().darkerColor( 0.5 )
    } );
    var potassiumInteriorConcentrationReadout = new Text( '', {
      font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
      fill: new PotassiumIon().getRepresentationColor().darkerColor( 0.5 )
    } );

    // convenience function for formatting the readouts
    function createConcentrationReadoutString( label, value ) {
      var valueText = Util.toFixed( value, CONCENTRATION_READOUT_NUM_PLACES );
      return StringUtils.format( concentrationReadoutPattern0Label1Value2UnitsString, label, valueText, unitsMMString );
    }

    // function to update the text for all four readouts
    function updateConcentrationReadoutValues() {
      sodiumExteriorConcentrationReadout.text =
        createConcentrationReadoutString( sodiumChemicalSymbolString, neuronModel.getSodiumExteriorConcentration() );
      sodiumInteriorConcentrationReadout.text =
        createConcentrationReadoutString( sodiumChemicalSymbolString, neuronModel.getSodiumInteriorConcentration() );
      potassiumExteriorConcentrationReadout.text =
        createConcentrationReadoutString( potassiumChemicalSymbolString, neuronModel.getPotassiumExteriorConcentration() );
      potassiumInteriorConcentrationReadout.text =
        createConcentrationReadoutString( potassiumChemicalSymbolString, neuronModel.getPotassiumInteriorConcentration() );
    }

    // fill in the initial concentration values so that the bounds are available for the code that follows
    updateConcentrationReadoutValues();

    // Put each of the readouts on an invisible rectangle to prevent artifacts, see
    // https://github.com/phetsims/neuron/issues/122, and also override the bounds computation for better performance.
    var sodiumExteriorConcentrationReadoutRect = Rectangle.bounds(
      sodiumExteriorConcentrationReadout.bounds.dilated( READOUT_BOUNDS_DILATION ),
      { fill: INVISIBLE_RECT_FILL, children: [ sodiumExteriorConcentrationReadout ] }
    );
    sodiumExteriorConcentrationReadout.computeShapeBounds = function() { return ( sodiumExteriorConcentrationReadoutRect.bounds ); };
    var sodiumInteriorConcentrationReadoutRect = Rectangle.bounds(
      sodiumInteriorConcentrationReadout.bounds.dilated( READOUT_BOUNDS_DILATION ),
      { fill: INVISIBLE_RECT_FILL, children: [ sodiumInteriorConcentrationReadout ] }
    );
    sodiumInteriorConcentrationReadout.computeShapeBounds = function() { return ( sodiumInteriorConcentrationReadoutRect.bounds ); };
    var potassiumExteriorConcentrationReadoutRect = Rectangle.bounds(
      potassiumExteriorConcentrationReadout.bounds.dilated( READOUT_BOUNDS_DILATION ),
      { fill: INVISIBLE_RECT_FILL, children: [ potassiumExteriorConcentrationReadout ] }
    );
    potassiumExteriorConcentrationReadout.computeShapeBounds = function() { return ( potassiumExteriorConcentrationReadoutRect.bounds ); };
    var potassiumInteriorConcentrationReadoutRect = Rectangle.bounds(
      potassiumInteriorConcentrationReadout.bounds.dilated( READOUT_BOUNDS_DILATION ),
      { fill: INVISIBLE_RECT_FILL, children: [ potassiumInteriorConcentrationReadout ] }
    );
    potassiumInteriorConcentrationReadout.computeShapeBounds = function() { return ( potassiumInteriorConcentrationReadoutRect.bounds ); };

    // add the concentration readouts
    this.addChild( sodiumExteriorConcentrationReadoutRect );
    this.addChild( sodiumInteriorConcentrationReadoutRect );
    this.addChild( potassiumExteriorConcentrationReadoutRect );
    this.addChild( potassiumInteriorConcentrationReadoutRect );

    // Update the readout positions when the zoom factor or visibility changes.  Visibility is used as an optimization -
    // it prevents making updates when the readouts aren't visible.
    Property.multilink( [ zoomProperty, neuronModel.concentrationReadoutVisibleProperty ], function( zoom, visible ) {
        if ( visible ) {
          var maxExteriorReadoutWidth = Math.max( potassiumExteriorConcentrationReadoutRect.bounds.width,
            sodiumExteriorConcentrationReadoutRect.bounds.width );

          // Place the exterior readouts to the upper left, just outside of the membrane.  The algorithm for placement was
          // empirically determined and will need adjustment if anything about the neuron position changes.
          var exteriorIndicatorYOffset = Math.max( self.zoomableRootNode.transform.transformY( 45 ), 5 );
          potassiumExteriorConcentrationReadoutRect.left = viewPortBounds.minX + maxExteriorReadoutWidth -
                                                           potassiumExteriorConcentrationReadoutRect.bounds.width + 4;
          potassiumExteriorConcentrationReadoutRect.top = viewPortBounds.minY + exteriorIndicatorYOffset;
          sodiumExteriorConcentrationReadoutRect.top = potassiumExteriorConcentrationReadoutRect.bottom;
          sodiumExteriorConcentrationReadoutRect.right = potassiumExteriorConcentrationReadoutRect.right;

          // Place the interior readout in a place where it can be seen whether or not the chart is showing and doesn't
          // overlap with the membrane of the neuron.  The Y position calculation is empirically determined.
          var interiorIndicatorYOffset = 80 + self.zoomableRootNode.transform.transformY( 80 ) * 0.5;

          potassiumInteriorConcentrationReadoutRect.centerX = axonCrossSectionNode.centerX;
          potassiumInteriorConcentrationReadoutRect.top = viewPortBounds.y + interiorIndicatorYOffset;
          sodiumInteriorConcentrationReadoutRect.top = potassiumInteriorConcentrationReadoutRect.bottom;
          sodiumInteriorConcentrationReadoutRect.right = potassiumInteriorConcentrationReadoutRect.right;
        }
      }
    );

    // update the readouts when the concentration changes, but only if the readout are visible
    neuronModel.concentrationChangedProperty.link( function( concentrationChanged ) {
      // this is optimized to skip updates if not visible to avoid recalculating bounds
      if ( concentrationChanged && self.isVisible() ) {
        updateConcentrationReadoutValues();
      }
    } );

    // update the readouts when this node transitions from invisible to visible
    this.on( 'visibility', function( a ) {
      if ( self.visible ) {
        updateConcentrationReadoutValues();
      }
    } );
  }

  neuron.register( 'ConcentrationReadoutLayerNode', ConcentrationReadoutLayerNode );

  return inherit( Node, ConcentrationReadoutLayerNode );

} );