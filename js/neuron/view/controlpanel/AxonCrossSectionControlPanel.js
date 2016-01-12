// Copyright 2014-2015, University of Colorado Boulder

/**
 * Control panel for the axon cross section module.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var CheckBox = require( 'SUN/CheckBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings - labels for control panel check boxes
  var showLegendString = require( 'string!NEURON/showLegend' );
  var allIonsString = require( 'string!NEURON/allIons' );
  var potentialChartString = require( 'string!NEURON/potentialChart' );
  var chargesString = require( 'string!NEURON/charges' );
  var concentrationsString = require( 'string!NEURON/concentrations' );

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
   * @param {object} options
   * @constructor
   */
  function AxonCrossSectionControlPanel( neuronModel, options ) {

    var allIonsSimulatedCheckBox = new CheckBox( new Text( allIonsString, TEXT_OPTIONS ), neuronModel.allIonsSimulatedProperty, CHECK_BOX_OPTIONS );
    dilateTouchArea( allIonsSimulatedCheckBox );
    var showChargesCheckBox = new CheckBox( new Text( chargesString, TEXT_OPTIONS ), neuronModel.chargesShownProperty, CHECK_BOX_OPTIONS );
    dilateTouchArea( showChargesCheckBox );
    var showConcentrationsCheckBox = new CheckBox( new Text( concentrationsString, TEXT_OPTIONS ), neuronModel.concentrationReadoutVisibleProperty, CHECK_BOX_OPTIONS );
    dilateTouchArea( showConcentrationsCheckBox );
    var showPotentialChartCheckBox = new CheckBox( new Text( potentialChartString, TEXT_OPTIONS ), neuronModel.potentialChartVisibleProperty, CHECK_BOX_OPTIONS );
    dilateTouchArea( showPotentialChartCheckBox );

    var crossSectionControlContents = [];
    crossSectionControlContents.push( new Text( showLegendString, {
      font: new PhetFont( { size: 16, weight: 'bold' } )
    } ) );
    crossSectionControlContents.push( allIonsSimulatedCheckBox );
    crossSectionControlContents.push( showChargesCheckBox );
    crossSectionControlContents.push( showConcentrationsCheckBox );
    crossSectionControlContents.push( showPotentialChartCheckBox );

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
      allIonsSimulatedCheckBox.enabled = !neuronModel.isStimulusInitiationLockedOut();
    } );
  }

  return inherit( Panel, AxonCrossSectionControlPanel );
} );
