// Copyright 2002-2014, University of Colorado Boulder

/**
 * Control panel for the axon cross section module.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );


  // Labels for control panel check boxes.
  var showLegendString = require( 'string!NEURON/showLegend' );
  var allIonsString = require( 'string!NEURON/allIons' );
  var potentialChartString = require( 'string!NEURON/potentialChart' );
  var chargesString = require( 'string!NEURON/charges' );
  var concentrationsString = require( 'string!NEURON/concentrations' );

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


    var allIonsSimulatedCheckBox = new CheckBox( new Text( allIonsString, TEXT_OPTIONS ), neuronModel.allIonsSimulatedProperty, CHECK_BOX_OPTIONS );
    expandTouchArea( allIonsSimulatedCheckBox );
    var showChargesCheckBox = new CheckBox( new Text( chargesString, TEXT_OPTIONS ), neuronModel.chargesShownProperty, CHECK_BOX_OPTIONS );
    expandTouchArea( showChargesCheckBox );
    var showConcentrationsCheckBox = new CheckBox( new Text( concentrationsString, TEXT_OPTIONS ), neuronModel.concentrationReadoutVisibleProperty, CHECK_BOX_OPTIONS );
    expandTouchArea( showConcentrationsCheckBox );
    var showPotentialChartCheckBox = new CheckBox( new Text( potentialChartString, TEXT_OPTIONS ), neuronModel.potentialChartVisibleProperty, CHECK_BOX_OPTIONS );
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

//// Copyright 2002-2011, University of Colorado
//
//package edu.colorado.phet.neuron.controlpanel;
//
//import java.awt.Color;
//import java.awt.Frame;
//import java.awt.event.ItemEvent;
//import java.awt.event.ItemListener;
//
//import javax.swing.BorderFactory;
//import javax.swing.Box;
//import javax.swing.BoxLayout;
//import javax.swing.JCheckBox;
//import javax.swing.JPanel;
//import javax.swing.border.BevelBorder;
//import javax.swing.border.TitledBorder;
//
//import edu.colorado.phet.common.phetcommon.view.ControlPanel;
//import edu.colorado.phet.common.phetcommon.view.VerticalLayoutPanel;
//import edu.colorado.phet.common.piccolophet.PiccoloModule;
//import edu.colorado.phet.neuron.NeuronConstants;
//import edu.colorado.phet.neuron.NeuronResources;
//import edu.colorado.phet.neuron.NeuronStrings;
//import edu.colorado.phet.neuron.model.NeuronModel;
//

//public class AxonCrossSectionControlPanel extends ControlPanel {
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------
//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//  private NeuronModel axonModel;
//
//  private JCheckBox showAllIonsCheckBox;
//  private JCheckBox chartControlCheckbox;
//  private JCheckBox showChargesCheckBox;
//  private JCheckBox showConcentrationReadoutCheckBox;
//
//  //----------------------------------------------------------------------------
//  // Constructors
//  //----------------------------------------------------------------------------
//
//  /**
//   * Constructor.
//   *
//   * @param module
//   * @param parentFrame parent frame, for creating dialogs
//   */
//  public AxonCrossSectionControlPanel( PiccoloModule module, Frame parentFrame, final NeuronModel model ) {
//    super();
//
//    this.axonModel = model;
//
//    // Listen to the model for changes that affect this control panel.
//    model.addListener(new NeuronModel.Adapter(){
//      @Override
//      public void potentialChartVisibilityChanged() {
//        updateChartVisibilityCheckBox();
//      }
//
//      @Override
//      public void chargesShownChanged() {
//        updateShowChargesCheckBox();
//      }
//
//      @Override
//      public void allIonsSimulatedChanged() {
//        updateShowAllIonsCheckBox();
//      }
//
//      @Override
//      public void stimulationLockoutStateChanged() {
//        // When stimulation is locked out, we also lock out the
//        // ability to change the "All Ions Simulated" state, since
//        // otherwise ions would have to disappear during an action potential,
//        // which would be tricky.
//        showAllIonsCheckBox.setEnabled(!model.isStimulusInitiationLockedOut());
//      }
//
//      @Override
//      public void concentrationReadoutVisibilityChanged() {
//        updateShowConcentrationReadoutCheckBox();
//      }
//    });
//
//    // Set the control panel's minimum width.
//    int minimumWidth = NeuronResources.getInt( "int.minControlPanelWidth", 215 );
//    setMinimumWidth( minimumWidth );
//
//    // Add the legend.
//    addControlFullWidth(new IonsAndChannelsLegendPanel());
//
//    // Add the check boxes.
//    JPanel checkBoxPanel = new VerticalLayoutPanel();
//    BevelBorder baseBorder = (BevelBorder)BorderFactory.createRaisedBevelBorder();
//    TitledBorder titledBorder = BorderFactory.createTitledBorder( baseBorder,
//      NeuronStrings.CONTROL,
//      TitledBorder.LEFT,
//      TitledBorder.TOP,
//      NeuronConstants.CONTROL_PANEL_TITLE_FONT,
//      Color.GRAY );
//    checkBoxPanel.setBorder(titledBorder);
//
//    // Add the check box for hiding/showing all ions.
//    showAllIonsCheckBox = new JCheckBox(NeuronStrings.SHOW_ALL_IONS);
//    showAllIonsCheckBox.setFont(NeuronConstants.CONTROL_PANEL_CONTROL_FONT);
//    showAllIonsCheckBox.addItemListener(new ItemListener() {
//      public void itemStateChanged(ItemEvent e) {
//        axonModel.setAllIonsSimulated(showAllIonsCheckBox.isSelected());
//      }
//    });
//    showAllIonsCheckBox.setAlignmentX(CENTER_ALIGNMENT);
//    checkBoxPanel.add(showAllIonsCheckBox);
//    updateShowAllIonsCheckBox();
//
//    // Add the check box for hiding/showing the potential chart.
//    addControlFullWidth(createVerticalSpacingPanel(5));
//    chartControlCheckbox = new JCheckBox(NeuronStrings.SHOW_POTENTIAL_CHART);
//    chartControlCheckbox.setFont(NeuronConstants.CONTROL_PANEL_CONTROL_FONT);
//    chartControlCheckbox.addItemListener(new ItemListener() {
//      public void itemStateChanged(ItemEvent e) {
//        axonModel.setPotentialChartVisible(chartControlCheckbox.isSelected());
//
//      }
//    });
//    chartControlCheckbox.setAlignmentX(CENTER_ALIGNMENT);
//    checkBoxPanel.add(chartControlCheckbox);
//    updateChartVisibilityCheckBox();
//
//    // Add the check box for controlling whether charge symbols are shown.
//    addControlFullWidth(createVerticalSpacingPanel(5));
//    showChargesCheckBox = new JCheckBox(NeuronStrings.SHOW_CHARGES);
//    showChargesCheckBox.setFont(NeuronConstants.CONTROL_PANEL_CONTROL_FONT);
//    showChargesCheckBox.addItemListener(new ItemListener() {
//      public void itemStateChanged(ItemEvent e) {
//        axonModel.setChargesShown(showChargesCheckBox.isSelected());
//      }
//    });
//    showChargesCheckBox.setAlignmentX(CENTER_ALIGNMENT);
//    checkBoxPanel.add(showChargesCheckBox);
//    updateShowChargesCheckBox();
//
//    // Add the check box for controlling whether the concentration readouts are shown.
//    addControlFullWidth(createVerticalSpacingPanel(5));
//    showConcentrationReadoutCheckBox = new JCheckBox(NeuronStrings.SHOW_CONCENTRATIONS);
//    showConcentrationReadoutCheckBox.setFont(NeuronConstants.CONTROL_PANEL_CONTROL_FONT);
//    showConcentrationReadoutCheckBox.addItemListener(new ItemListener() {
//      public void itemStateChanged(ItemEvent e) {
//        axonModel.setConcentrationReadoutVisible(showConcentrationReadoutCheckBox.isSelected());
//      }
//    });
//    showConcentrationReadoutCheckBox.setAlignmentX(CENTER_ALIGNMENT);
//    checkBoxPanel.add(showConcentrationReadoutCheckBox);
//    updateShowConcentrationReadoutCheckBox();
//
//    // Add the panel containing the check boxes.
//    addControlFullWidth(checkBoxPanel);
//
//    // Add the reset all button.
//    addControlFullWidth(createVerticalSpacingPanel(30));
//    addResetAllButton( module );
//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------
//
//  private JPanel createVerticalSpacingPanel(int space){
//    JPanel spacePanel = new JPanel();
//    spacePanel.setLayout( new BoxLayout( spacePanel, BoxLayout.Y_AXIS ) );
//    spacePanel.add( Box.createVerticalStrut( space ) );
//    return spacePanel;
//  }
//
//  private void updateChartVisibilityCheckBox(){
//    chartControlCheckbox.setSelected(axonModel.isPotentialChartVisible());
//  }
//
//  private void updateShowAllIonsCheckBox(){
//    showAllIonsCheckBox.setSelected(axonModel.isAllIonsSimulated());
//  }
//
//  private void updateShowChargesCheckBox(){
//    showChargesCheckBox.setSelected(axonModel.isChargesShown());
//  }
//
//  private void updateShowConcentrationReadoutCheckBox(){
//    showConcentrationReadoutCheckBox.setSelected(axonModel.isConcentrationReadoutVisible());
//  }
//}
