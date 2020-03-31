// Copyright 2014-2020, University of Colorado Boulder
/**
 * This node acts as a layer to which all concentration readouts are added
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import inherit from '../../../../phet-core/js/inherit.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import neuronStrings from '../../neuronStrings.js';
import neuron from '../../neuron.js';
import PotassiumIon from '../model/PotassiumIon.js';
import SodiumIon from '../model/SodiumIon.js';

const concentrationReadoutPattern0Label1Value2UnitsString = neuronStrings.concentrationReadoutPattern[ '0label' ][ '1value' ][ '2units' ];
const potassiumChemicalSymbolString = neuronStrings.potassiumChemicalSymbol;
const sodiumChemicalSymbolString = neuronStrings.sodiumChemicalSymbol;
const unitsMMString = neuronStrings.units.mM;

// constants that control aspects of the concentration readout.
const CONCENTRATION_READOUT_NUM_PLACES = 5;
const READ_OUT_FONT_SIZE = 14;
const READOUT_BOUNDS_DILATION = 2;
const INVISIBLE_RECT_FILL = 'rgba( 0, 0, 0, 0 )';

/**
 * @param {NeuronModel} neuronModel
 * @param {Property.<number>} zoomProperty
 * @param {Node} zoomableRootNode
 * @param {Bounds2} viewPortBounds
 * @param {AxonCrossSectionNode} axonCrossSectionNode
 * @constructor
 */
function ConcentrationReadoutLayerNode( neuronModel, zoomProperty, zoomableRootNode, viewPortBounds, axonCrossSectionNode ) {

  const self = this;
  Node.call( this );
  this.zoomableRootNode = zoomableRootNode;

  // Concentration readouts.
  const sodiumExteriorConcentrationReadout = new Text( '', {
    font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
    fill: new SodiumIon().getRepresentationColor()
  } );
  const sodiumInteriorConcentrationReadout = new Text( '', {
    font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
    fill: new SodiumIon().getRepresentationColor()
  } );
  const potassiumExteriorConcentrationReadout = new Text( '', {
    font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
    fill: new PotassiumIon().getRepresentationColor().darkerColor( 0.5 )
  } );
  const potassiumInteriorConcentrationReadout = new Text( '', {
    font: new PhetFont( { size: READ_OUT_FONT_SIZE } ),
    fill: new PotassiumIon().getRepresentationColor().darkerColor( 0.5 )
  } );

  // convenience function for formatting the readouts
  function createConcentrationReadoutString( label, value ) {
    const valueText = Utils.toFixed( value, CONCENTRATION_READOUT_NUM_PLACES );
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
  const sodiumExteriorConcentrationReadoutRect = Rectangle.bounds(
    sodiumExteriorConcentrationReadout.bounds.dilated( READOUT_BOUNDS_DILATION ),
    { fill: INVISIBLE_RECT_FILL, children: [ sodiumExteriorConcentrationReadout ] }
  );
  sodiumExteriorConcentrationReadout.computeShapeBounds = function() { return ( sodiumExteriorConcentrationReadoutRect.bounds ); };
  const sodiumInteriorConcentrationReadoutRect = Rectangle.bounds(
    sodiumInteriorConcentrationReadout.bounds.dilated( READOUT_BOUNDS_DILATION ),
    { fill: INVISIBLE_RECT_FILL, children: [ sodiumInteriorConcentrationReadout ] }
  );
  sodiumInteriorConcentrationReadout.computeShapeBounds = function() { return ( sodiumInteriorConcentrationReadoutRect.bounds ); };
  const potassiumExteriorConcentrationReadoutRect = Rectangle.bounds(
    potassiumExteriorConcentrationReadout.bounds.dilated( READOUT_BOUNDS_DILATION ),
    { fill: INVISIBLE_RECT_FILL, children: [ potassiumExteriorConcentrationReadout ] }
  );
  potassiumExteriorConcentrationReadout.computeShapeBounds = function() { return ( potassiumExteriorConcentrationReadoutRect.bounds ); };
  const potassiumInteriorConcentrationReadoutRect = Rectangle.bounds(
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
        const maxExteriorReadoutWidth = Math.max( potassiumExteriorConcentrationReadoutRect.bounds.width,
          sodiumExteriorConcentrationReadoutRect.bounds.width );

        // Place the exterior readouts to the upper left, just outside of the membrane.  The algorithm for placement was
        // empirically determined and will need adjustment if anything about the neuron position changes.
        const exteriorIndicatorYOffset = Math.max( self.zoomableRootNode.transform.transformY( 45 ), 5 );
        potassiumExteriorConcentrationReadoutRect.left = viewPortBounds.minX + maxExteriorReadoutWidth -
                                                         potassiumExteriorConcentrationReadoutRect.bounds.width + 4;
        potassiumExteriorConcentrationReadoutRect.top = viewPortBounds.minY + exteriorIndicatorYOffset;
        sodiumExteriorConcentrationReadoutRect.top = potassiumExteriorConcentrationReadoutRect.bottom;
        sodiumExteriorConcentrationReadoutRect.right = potassiumExteriorConcentrationReadoutRect.right;

        // Place the interior readout in a place where it can be seen whether or not the chart is showing and doesn't
        // overlap with the membrane of the neuron.  The Y position calculation is empirically determined.
        const interiorIndicatorYOffset = 80 + self.zoomableRootNode.transform.transformY( 80 ) * 0.5;

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

inherit( Node, ConcentrationReadoutLayerNode );
export default ConcentrationReadoutLayerNode;