// Copyright 2002-2014, University of Colorado Boulder

/**
 * Control panel for the axon cross section module.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // strings - labels for control panel check boxes
  var showLegendString = require( 'string!NEURON/showLegend' );
  var allIonsString = require( 'string!NEURON/allIons' );
  var potentialChartString = require( 'string!NEURON/potentialChart' );
  var chargesString = require( 'string!NEURON/charges' );
  var concentrationsString = require( 'string!NEURON/concentrations' );

  // constants
  var CHECK_BOX_OPTIONS = { boxWidth: 20 };
  var TEXT_OPTIONS = { font: new PhetFont( 14 ) };
  var TOUCH_AREA_EXPAND_X = 10;
  var TOUCH_AREA_EXPAND_Y = 3;

  // uniformly expands touch area for controls
  var expandTouchArea = function( node ) {
    node.touchArea = node.localBounds.dilatedXY( TOUCH_AREA_EXPAND_X, TOUCH_AREA_EXPAND_Y );
  };

  /**
   * @param {NeuronModel}  neuronModel
   * @constructor
   */
  function AxonCrossSectionControlPanel( neuronModel ) {

    var maxButtonTextWidth = 100;

    // Scale and fit the ButtonText within panel's bounds
    function scaleAndFitTextItem( textItemNode ) {
      var textNodeScaleFactor = Math.min( 1, maxButtonTextWidth / textItemNode.width );
      textItemNode.scale( textNodeScaleFactor );
      return textItemNode;
    }

    var allIonsSimulatedCheckBox = new CheckBox( scaleAndFitTextItem( new Text( allIonsString, TEXT_OPTIONS ) ), neuronModel.allIonsSimulatedProperty, CHECK_BOX_OPTIONS );
    expandTouchArea( allIonsSimulatedCheckBox );
    var showChargesCheckBox = new CheckBox( scaleAndFitTextItem( new Text( chargesString, TEXT_OPTIONS ) ), neuronModel.chargesShownProperty, CHECK_BOX_OPTIONS );
    expandTouchArea( showChargesCheckBox );
    var showConcentrationsCheckBox = new CheckBox( scaleAndFitTextItem( new Text( concentrationsString, TEXT_OPTIONS ) ), neuronModel.concentrationReadoutVisibleProperty, CHECK_BOX_OPTIONS );
    expandTouchArea( showConcentrationsCheckBox );
    var showPotentialChartCheckBox = new CheckBox( scaleAndFitTextItem( new Text( potentialChartString, TEXT_OPTIONS ) ), neuronModel.potentialChartVisibleProperty, CHECK_BOX_OPTIONS );
    expandTouchArea( showPotentialChartCheckBox );


    var crossectionControlContents = [];
    crossectionControlContents.push( new Text( showLegendString, {
      font: new PhetFont( { size: 16, weight: 'bold' } )} ) );
    crossectionControlContents.push( allIonsSimulatedCheckBox );
    crossectionControlContents.push( showChargesCheckBox );
    crossectionControlContents.push( showConcentrationsCheckBox );
    crossectionControlContents.push( showPotentialChartCheckBox );

    // vertical panel
    Panel.call( this, new VBox( {
      children: crossectionControlContents,
      align: 'left',
      spacing: 5
    } ), {
      // panel options
      fill: 'rgb(238,238,238)',
      xMargin: 5,
      yMargin: 6,
      lineWidth: 0
    } );

    neuronModel.stimulasLockoutProperty.link( function( stimulasLockout ) {
      // When stimulation is locked out, we also lock out the
      // ability to change the "All Ions Simulated" state, since
      // otherwise ions would have to disappear during an action potential,
      // which would be tricky.
      allIonsSimulatedCheckBox.enabled = !neuronModel.isStimulusInitiationLockedOut();

    } );

    neuronModel.allIonsSimulatedProperty.lazyLink( function( allIonsSimulated ) {
      neuronModel.setAllIonsSimulated( allIonsSimulated );
    } );


  }

  return inherit( Panel, AxonCrossSectionControlPanel );
} );

