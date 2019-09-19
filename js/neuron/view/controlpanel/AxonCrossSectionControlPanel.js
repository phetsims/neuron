// Copyright 2014-2018, University of Colorado Boulder

/**
 * Control panel for the axon cross section module.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const Checkbox = require( 'SUN/Checkbox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const neuron = require( 'NEURON/neuron' );
  const NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings - labels for control panel checkboxes
  const allIonsString = require( 'string!NEURON/allIons' );
  const chargesString = require( 'string!NEURON/charges' );
  const concentrationsString = require( 'string!NEURON/concentrations' );
  const potentialChartString = require( 'string!NEURON/potentialChart' );
  const showLegendString = require( 'string!NEURON/showLegend' );

  // constants
  var CHECK_BOX_OPTIONS = { boxWidth: 15 };
  var TEXT_OPTIONS = { font: new PhetFont( 14 ) };
  var TOUCH_AREA_X_DILATION = 10;
  var TOUCH_AREA_Y_DILATION = 3;

  // uniformly expands touch area for controls
  var dilateTouchArea = function( node ) {
    node.touchArea = node.localBounds.dilatedXY( TOUCH_AREA_X_DILATION, TOUCH_AREA_Y_DILATION );
  };

  /**
   * @param {NeuronModel} neuronModel
   * @param {Object} options
   * @constructor
   */
  function AxonCrossSectionControlPanel( neuronModel, options ) {

    var allIonsSimulatedCheckbox = new Checkbox( new Text( allIonsString, TEXT_OPTIONS ), neuronModel.allIonsSimulatedProperty, CHECK_BOX_OPTIONS );
    dilateTouchArea( allIonsSimulatedCheckbox );
    var showChargesCheckbox = new Checkbox( new Text( chargesString, TEXT_OPTIONS ), neuronModel.chargesShownProperty, CHECK_BOX_OPTIONS );
    dilateTouchArea( showChargesCheckbox );
    var showConcentrationsCheckbox = new Checkbox( new Text( concentrationsString, TEXT_OPTIONS ), neuronModel.concentrationReadoutVisibleProperty, CHECK_BOX_OPTIONS );
    dilateTouchArea( showConcentrationsCheckbox );
    var showPotentialChartCheckbox = new Checkbox( new Text( potentialChartString, TEXT_OPTIONS ), neuronModel.potentialChartVisibleProperty, CHECK_BOX_OPTIONS );
    dilateTouchArea( showPotentialChartCheckbox );

    var crossSectionControlContents = [];
    crossSectionControlContents.push( new Text( showLegendString, {
      font: new PhetFont( { size: 16, weight: 'bold' } )
    } ) );
    crossSectionControlContents.push( allIonsSimulatedCheckbox );
    crossSectionControlContents.push( showChargesCheckbox );
    crossSectionControlContents.push( showConcentrationsCheckbox );
    crossSectionControlContents.push( showPotentialChartCheckbox );

    // vertical panel
    Panel.call( this, new VBox( {
        children: crossSectionControlContents,
        align: 'left',
        spacing: 7
      } ),
      // panel options
      _.extend( {
        fill: NeuronConstants.CONTROL_PANEL_BACKGROUND,
        stroke: NeuronConstants.CONTROL_PANEL_STROKE,
        xMargin: 8,
        yMargin: 10,
        align: 'left'
      }, options )
    );

    neuronModel.stimulusLockoutProperty.link( function( stimulusLockout ) {
      // When stimulation is locked out, we also lock out the ability to change the "All Ions Simulated" state, since
      // otherwise ions would have to disappear during an action potential, which would be tricky.
      allIonsSimulatedCheckbox.enabled = !neuronModel.isStimulusInitiationLockedOut();
    } );
  }

  neuron.register( 'AxonCrossSectionControlPanel', AxonCrossSectionControlPanel );

  return inherit( Panel, AxonCrossSectionControlPanel );
} );
