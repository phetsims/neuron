// Copyright 2014-2020, University of Colorado Boulder

/**
 * Control panel for the axon cross section module.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import VBox from '../../../../../scenery/js/nodes/VBox.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import Panel from '../../../../../sun/js/Panel.js';
import neuron from '../../../neuron.js';
import neuronStrings from '../../../neuronStrings.js';
import NeuronConstants from '../../common/NeuronConstants.js';

// strings - labels for control panel checkboxes
const allIonsString = neuronStrings.allIons;
const chargesString = neuronStrings.charges;
const concentrationsString = neuronStrings.concentrations;
const potentialChartString = neuronStrings.potentialChart;
const showLegendString = neuronStrings.showLegend;

// constants
const CHECKBOX_OPTIONS = { boxWidth: 15 };
const TEXT_OPTIONS = { font: new PhetFont( 14 ) };
const TOUCH_AREA_X_DILATION = 10;
const TOUCH_AREA_Y_DILATION = 3;

// uniformly expands touch area for controls
function dilateTouchArea( node ) {
  node.touchArea = node.localBounds.dilatedXY( TOUCH_AREA_X_DILATION, TOUCH_AREA_Y_DILATION );
}

class AxonCrossSectionControlPanel extends Panel {

  /**
   * @param {NeuronModel} neuronModel
   * @param {Object} [options]
   */
  constructor( neuronModel, options ) {

    const allIonsSimulatedCheckbox = new Checkbox( new Text( allIonsString, TEXT_OPTIONS ), neuronModel.allIonsSimulatedProperty, CHECKBOX_OPTIONS );
    dilateTouchArea( allIonsSimulatedCheckbox );
    const showChargesCheckbox = new Checkbox( new Text( chargesString, TEXT_OPTIONS ), neuronModel.chargesShownProperty, CHECKBOX_OPTIONS );
    dilateTouchArea( showChargesCheckbox );
    const showConcentrationsCheckbox = new Checkbox( new Text( concentrationsString, TEXT_OPTIONS ), neuronModel.concentrationReadoutVisibleProperty, CHECKBOX_OPTIONS );
    dilateTouchArea( showConcentrationsCheckbox );
    const showPotentialChartCheckbox = new Checkbox( new Text( potentialChartString, TEXT_OPTIONS ), neuronModel.potentialChartVisibleProperty, CHECKBOX_OPTIONS );
    dilateTouchArea( showPotentialChartCheckbox );

    const crossSectionControlContents = [];
    crossSectionControlContents.push( new Text( showLegendString, {
      font: new PhetFont( { size: 16, weight: 'bold' } )
    } ) );
    crossSectionControlContents.push( allIonsSimulatedCheckbox );
    crossSectionControlContents.push( showChargesCheckbox );
    crossSectionControlContents.push( showConcentrationsCheckbox );
    crossSectionControlContents.push( showPotentialChartCheckbox );

    super(
      // content
      new VBox( {
        children: crossSectionControlContents,
        align: 'left',
        spacing: 7
      } ),

      // Panel options
      merge( {
        fill: NeuronConstants.CONTROL_PANEL_BACKGROUND,
        stroke: NeuronConstants.CONTROL_PANEL_STROKE,
        xMargin: 8,
        yMargin: 10,
        align: 'left'
      }, options )
    );

    neuronModel.stimulusLockoutProperty.link( stimulusLockout => {
      // When stimulation is locked out, we also lock out the ability to change the "All Ions Simulated" state, since
      // otherwise ions would have to disappear during an action potential, which would be tricky.
      allIonsSimulatedCheckbox.enabled = !neuronModel.isStimulusInitiationLockedOut();
    } );
  }
}

neuron.register( 'AxonCrossSectionControlPanel', AxonCrossSectionControlPanel );
export default AxonCrossSectionControlPanel;