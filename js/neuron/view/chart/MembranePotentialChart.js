// Copyright 2014-2022, University of Colorado Boulder
/**
 * Chart for depicting the membrane potential.  This is a Node, and as such is intended for use primarily in the play
 * area.
 *
 * Originally, this chart was designed to scroll once there was enough data the fill the chart half way, but this
 * turned out to be too CPU intensive, so it was changed to draw one line of data across the screen and then stop. The
 * user can clear the chart and trigger another action potential to start recording data again.
 *
 * This chart can also be used to control the record-and-playback state of the model.  This is done so that the window
 * of recorded data in the model matches that shown in the chart, allowing the user to set the model state to any time
 * shown in the chart.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../../dot/js/LinearFunction.js';
import Utils from '../../../../../dot/js/Utils.js';
import DynamicSeries from '../../../../../griddle/js/DynamicSeries.js';
import { Shape } from '../../../../../kite/js/imports.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import CloseButton from '../../../../../scenery-phet/js/buttons/CloseButton.js';
import PhetColorScheme from '../../../../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Path, Text } from '../../../../../scenery/js/imports.js';
import TextPushButton from '../../../../../sun/js/buttons/TextPushButton.js';
import Panel from '../../../../../sun/js/Panel.js';
import neuron from '../../../neuron.js';
import NeuronStrings from '../../../NeuronStrings.js';
import NeuronConstants from '../../common/NeuronConstants.js';
import ChartCursor from './ChartCursor.js';
import DataLineCanvasNode from './DataLineCanvasNode.js';

const chartClearString = NeuronStrings.chartClear;
const chartTitleString = NeuronStrings.chartTitle;
const chartXAxisLabelString = NeuronStrings.chartXAxisLabel;
const chartYAxisLabelString = NeuronStrings.chartYAxisLabel;

// constants
const GRID_TICK_TEXT_FONT = new PhetFont( 8 );
const TIME_SPAN = 25; // In seconds.
const MAX_PANEL_WIDTH = 554;
const MIN_DISTANCE_SQUARED_BETWEEN_POINTS = 0.01;

// This value sets the frequency of chart updates, which helps to reduce the processor consumption.
const UPDATE_PERIOD = NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT; // in seconds of sim time (not wall time)

class MembranePotentialChart extends Node {

  /**
   * @param {Dimension2} chartDimension
   * @param {NeuronClockModelAdapter} neuronClockModelAdapter
   */
  constructor( chartDimension, neuronClockModelAdapter ) {

    super();

    // @private
    this.chartDimension = chartDimension;
    this.clock = neuronClockModelAdapter;
    this.neuronModel = neuronClockModelAdapter.model;
    this.updateCountdownTimer = 0; // init to zero so that an update occurs right away
    this.timeIndexOfFirstDataPt = 0;
    this.playingWhenDragStarted = true;
    this.dataSeries = new DynamicSeries( {
      color: PhetColorScheme.RED_COLORBLIND
    } );
    this.domain = [ 0, TIME_SPAN ];
    this.range = [ -100, 100 ];
    this.mostRecentXValue = 0;
    this.mostRecentYValue = 0;

    // Create the root node for the plot.
    const plotNode = new Node();

    const numVerticalGridLines = 25;
    const numHorizontalGridLines = 8;

    // create a function to generate horizontal labels (The LinearFunction returns a map function which can be used
    // to get the appropriate label value based on the index of each vertical line).
    const domainMap = new LinearFunction( 0, numVerticalGridLines, this.domain[ 0 ], this.domain[ 1 ] );

    // To create Vertical Labels
    // Example:- for the value of 3 it returns a value of -50 and for 5 it returns 0 (because range is -100 to 100)
    const rangeMap = new LinearFunction( 0, numHorizontalGridLines, this.range[ 1 ], this.range[ 0 ] );

    const gridShape = new Shape();

    // vertical grid lines
    for ( let i = 0; i < numVerticalGridLines + 1; i++ ) {
      gridShape.moveTo( i * chartDimension.width / numVerticalGridLines, 0 );
      gridShape.lineTo( i * chartDimension.width / numVerticalGridLines, chartDimension.height );
      plotNode.addChild( new Text( domainMap.evaluate( i ), {
        font: GRID_TICK_TEXT_FONT,
        //Text controls need to aligned to each grid line based on the line's orientation.
        centerX: i * chartDimension.width / numVerticalGridLines,
        top: chartDimension.height + 6
      } ) );
    }

    // horizontal grid lines
    for ( let i = 0; i < numHorizontalGridLines + 1; i++ ) {
      gridShape.moveTo( 0, i * chartDimension.height / numHorizontalGridLines );
      gridShape.lineTo( chartDimension.width, i * chartDimension.height / numHorizontalGridLines );
      plotNode.addChild( new Text( rangeMap.evaluate( i ), {
        font: GRID_TICK_TEXT_FONT,
        centerY: i * chartDimension.height / numHorizontalGridLines,
        right: -6
      } ) );
    }

    plotNode.addChild( new Path( gridShape, { stroke: 'gray', lineWidth: 0.6, boundsMethod: 'none' } ) );

    neuronClockModelAdapter.registerStepCallback( this.step.bind( this ) );

    neuronClockModelAdapter.registerResetCallback( () => {
      this.updateOnSimulationReset();
    } );

    this.neuronModel.stimulusPulseInitiatedProperty.link( stimulusPulseInitiated => {
      if ( stimulusPulseInitiated && !this.neuronModel.isPotentialChartVisible() ) {
        // If the chart is not visible, we clear any previous recording.
        this.clearChart();
      }
      if ( stimulusPulseInitiated && !this.chartIsFull ) {
        // initiate recording
        this.neuronModel.startRecording();
      }
    } );

    // title
    const chartTitleNode = new Text( chartTitleString, {
      font: new PhetFont( { size: 16, weight: 'bold' } ),
      maxWidth: chartDimension.width * 0.5, // multiplier empirically determined through testing with long strings
      top: 0
    } );

    // clear button
    const clearChartButton = new TextPushButton( chartClearString, {
      font: new PhetFont( { size: 12 } ),
      maxWidth: 100, // empirically determined
      listener: () => {
        if ( this.neuronModel.isActionPotentialInProgress() ) {
          this.neuronModel.setModeRecord();
        }
        else {
          this.neuronModel.setModeLive();
        }
        this.clearChart();
      }
    } );

    // close button
    const closeButton = new CloseButton( {
      iconLength: 12,
      listener: () => {
        this.neuronModel.potentialChartVisibleProperty.set( false );
      }
    } );

    // Scale to fit the Title Node within Chart's bounds.
    const maxTitleWidth = chartDimension.width * 0.67;
    const titleNodeScaleFactor = Math.min( 1, maxTitleWidth / chartTitleNode.width );
    chartTitleNode.scale( titleNodeScaleFactor );

    const axisLabelFont = { font: new PhetFont( { size: 12 } ) };
    const chartXAxisLabelNode = new Text( chartXAxisLabelString, axisLabelFont );
    const chartYAxisLabelNode = new Text( chartYAxisLabelString, axisLabelFont );
    chartYAxisLabelNode.rotation = -Math.PI / 2;

    // Scale to fit the Y axis within Chart's bounds
    const yAxisMaxHeight = chartDimension.height;
    const yAxisLabelScaleFactor = Math.min( 1, yAxisMaxHeight / ( 0.8 * chartYAxisLabelNode.height ) );
    chartYAxisLabelNode.scale( yAxisLabelScaleFactor );

    // use domain(0,25) and range(-100,100) as Model View Map
    this.chartMvt = ModelViewTransform2.createRectangleInvertedYMapping( new Bounds2( this.domain[ 0 ], this.range[ 0 ],
      this.domain[ 1 ], this.range[ 1 ] ), new Bounds2( 0, 0, chartDimension.width, chartDimension.height ), 1, 1 );

    // create and add the node that will represent the data line on the chart
    this.dataLineNode = new DataLineCanvasNode( chartDimension.width, chartDimension.height, this.dataSeries, this.chartMvt );
    plotNode.addChild( this.dataLineNode );

    // add the cursor that shows the time value of the neuron state
    this.chartCursor = new ChartCursor( this );
    plotNode.addChild( this.chartCursor );

    neuronClockModelAdapter.playingProperty.link( () => {
      this.updateCursorState();
    } );

    this.neuronModel.timeProperty.link( this.updateChartCursor.bind( this ) );
    this.neuronModel.modeProperty.link( mode => {
      if ( mode ) {
        this.updateChartCursor.bind( this );
      }
    } );

    const xMargin = 12;
    const xSpace = 4;
    // align exactly with clipped area's edges
    const contentWidth = chartYAxisLabelNode.width + plotNode.width + ( 2 * xMargin ) + xSpace;
    const adjustMargin = ( MAX_PANEL_WIDTH - contentWidth ) / 2;

    // Put the chart, title, and controls in a node together and lay them out.
    const plotAndYLabel = new HBox( {
      children: [ chartYAxisLabelNode, plotNode ],
      spacing: xSpace,
      top: Math.max( chartTitleNode.height, clearChartButton.height, closeButton.height ),
      resize: false
    } );
    const panelContents = new Node();
    chartTitleNode.centerX = plotAndYLabel.width / 2;
    panelContents.addChild( chartTitleNode );
    panelContents.addChild( plotAndYLabel );
    closeButton.right = plotAndYLabel.width;
    panelContents.addChild( closeButton );
    clearChartButton.right = closeButton.left - 10;
    panelContents.addChild( clearChartButton );
    chartXAxisLabelNode.centerX = plotAndYLabel.width / 2;
    chartXAxisLabelNode.top = plotAndYLabel.bottom;
    panelContents.addChild( chartXAxisLabelNode );

    // put everything in a panel
    this.addChild( new Panel( panelContents, {
        fill: 'white',
        xMargin: xMargin + adjustMargin,
        yMargin: 6,
        lineWidth: 1,
        cornerRadius: 2,
        resize: false
      }
    ) );

    this.neuronModel.potentialChartVisibleProperty.link( chartVisible => {
      this.visible = chartVisible;
    } );
  }

  /**
   * Add a data point to the graph.
   * @param {number} time - time in milliseconds
   * @param {number} voltage - voltage in volts
   * @public
   */
  addDataPoint( time, voltage ) {
    let firstDataPoint = false;
    if ( this.dataSeries.getLength() === 0 ) {
      // This is the first data point added since the last time the chart was cleared or since it was created. Record
      // the time index for future reference.
      this.timeIndexOfFirstDataPt = time;
      firstDataPoint = true;
    }

    // compute the x and y values that will be added to the data set if the necessary conditions are met
    const xValue = time - this.timeIndexOfFirstDataPt;
    const yValue = voltage * 1000; // this chart uses millivolts internally

    // Calculate the distance from the most recently added point so that we can add as few points as possible and
    // still get a reasonable looking graph.  This is done as an optimization.
    let distanceFromLastPointSquared = Number.POSITIVE_INFINITY;
    if ( !firstDataPoint ) {
      distanceFromLastPointSquared = Math.pow( xValue - this.mostRecentXValue, 2 ) +
                                     Math.pow( yValue - this.mostRecentYValue, 2 );
    }

    // Add the data point if it is in range, if it is sufficiently far from the previous data point, and if the chart
    // isn't full.
    assert && assert( time - this.timeIndexOfFirstDataPt >= 0 );
    if ( time - this.timeIndexOfFirstDataPt <= TIME_SPAN && distanceFromLastPointSquared > MIN_DISTANCE_SQUARED_BETWEEN_POINTS ) {
      this.dataSeries.addXYDataPoint( xValue, yValue );
      this.mostRecentXValue = xValue;
      this.mostRecentYValue = yValue;
      this.chartIsFull = false;
    }
    else if ( time - this.timeIndexOfFirstDataPt > TIME_SPAN && !this.chartIsFull ) {

      // This is the first data point to be received that is outside of the chart's X range.  Add it anyway so that
      // there is no gap in the data shown at the end of the chart.
      this.dataSeries.addXYDataPoint( TIME_SPAN, yValue );
      this.chartIsFull = true;
    }
  }

  /**
   * Get the last time value in the data series.  This is assumed to be the
   * highest time value, since data points are expected to be added in order
   * of increasing time.  If no data is present, 0 is returned.
   * @public
   */
  getLastTimeValue() {
    let timeOfLastDataPoint = 0;
    if ( this.dataSeries.hasData() ) {
      timeOfLastDataPoint = this.dataSeries.getDataPoint( this.dataSeries.getLength() - 1 ).x;
    }
    return timeOfLastDataPoint;
  }

  /**
   * Update the chart based on the current time and the model that is being monitored.
   * @param {number} simulationTimeChange - in seconds
   * @public
   */
  step( simulationTimeChange ) {
    if ( this.neuronModel.isRecord() ) {
      if ( !this.chartIsFull && simulationTimeChange > 0 ) {
        this.updateCountdownTimer -= simulationTimeChange;

        const timeInMilliseconds = this.neuronModel.getTime() * 1000;

        if ( this.updateCountdownTimer <= 0 ) {
          this.addDataPoint( timeInMilliseconds, this.neuronModel.getMembranePotential(), true );
          this.updateCountdownTimer = UPDATE_PERIOD;
        }
        else {
          this.addDataPoint( timeInMilliseconds, this.neuronModel.getMembranePotential(), false );
        }
      }

      if ( this.chartIsFull && this.neuronModel.isRecord() ) {
        // The chart is full, so it is time to stop recording.
        this.neuronModel.setModeLive();
      }
    }
  }

  // @public
  clearChart() {
    this.dataSeries.clear();
    this.chartIsFull = false;
    this.neuronModel.clearHistory();
    this.updateChartCursorVisibility();
  }

  // @private
  updateChartCursorVisibility() {

    // Deciding whether or not the chart cursor should be visible is a little tricky, so I've tried to make the logic
    // very explicit for easier maintenance.  Basically, any time we are in playback mode and we are somewhere on the
    // chart, or when stepping and recording, the cursor should be seen.
    const timeOnChart = ( this.neuronModel.getTime() - this.neuronModel.getMinRecordedTime() ) * 1000;
    const isCurrentTimeOnChart = ( timeOnChart >= 0 ) && ( timeOnChart <= TIME_SPAN );
    const chartCursorVisible = isCurrentTimeOnChart && this.dataSeries.hasData();
    this.chartCursor.setVisible( chartCursorVisible );
  }

  // @private - update the position of the chart cursor
  updateChartCursor() {
    this.updateChartCursorVisibility();
    if ( this.chartCursor.isVisible() ) {
      this.updateChartCursorPos();
    }
  }

  // @private
  updateChartCursorPos() {
    const recordingStartTime = this.neuronModel.getMinRecordedTime();
    const recordingCurrentTime = this.neuronModel.getTime();
    this.moveChartCursorToTime( ( recordingCurrentTime - recordingStartTime ) * 1000 );
  }

  // @private
  moveChartCursorToTime( time ) {
    this.chartCursor.x = Utils.clamp( this.chartMvt.transformX( time ), 0, this.chartDimension.width );
    this.chartCursor.y = this.chartMvt.transformY( this.range[ 1 ] );
  }

  // @private
  updateOnSimulationReset() {
    this.neuronModel.setModeLive();
    this.clearChart();
    this.updateChartCursorVisibility();
  }

  // @private
  updateCursorState() {
    this.updateChartCursorPos();
    this.updateChartCursorVisibility();
  }

  /**
   * Used to control the play/pause state of clock, since grabbing the cursor causes the clock to pause.
   * @param {boolean} playing
   * @public
   */
  setPlaying( playing ) {
    this.clock.playingProperty.set( playing );
  }
}

neuron.register( 'MembranePotentialChart', MembranePotentialChart );

export default MembranePotentialChart;