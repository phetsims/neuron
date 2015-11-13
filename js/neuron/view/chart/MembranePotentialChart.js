// Copyright 2014-2015, University of Colorado Boulder
/**
 * Chart for depicting the membrane potential.  This is a Node, and as such
 * is intended for use primarily in the play area.
 * <p/>
 * Originally, this chart was designed to scroll once there was enough data
 * the fill the chart half way, but this turned out to be too CPU intensive,
 * so it was changed to draw one line of data across the screen and then stop.
 * The user can clear the chart and trigger another action potential to start
 * recording data again.
 * <p/>
 * This chart can also be used to control the record-and-playback state of the
 * model.  This is done so that the window of recorded data in the model matches
 * that shown in the chart, allowing the user to set the model state to any time
 * shown in the chart.
 * <p/>
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ChartCursor = require( 'NEURON/neuron/view/chart/ChartCursor' );
  var DataLineCanvasNode = require( 'NEURON/neuron/view/chart/DataLineCanvasNode' );
  var dot = require( 'DOT/dot' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var Util = require( 'DOT/Util' );
  var XYDataSeries = require( 'GRIDDLE/XYDataSeries' );

  // strings
  var chartTitleString = require( 'string!NEURON/chartTitle' );
  var chartClearString = require( 'string!NEURON/chartClear' );
  var chartXAxisLabelString = require( 'string!NEURON/chartXAxisLabel' );
  var chartYAxisLabelString = require( 'string!NEURON/chartYAxisLabel' );

  // constants
  var GRID_TICK_TEXT_FONT = new PhetFont( 8 );
  var TIME_SPAN = 25; // In seconds.
  var MAX_PANEL_WIDTH = 554;
  var MIN_DISTANCE_SQUARED_BETWEEN_POINTS = 0.01;

  // This value sets the frequency of chart updates, which helps to reduce the processor consumption.
  var UPDATE_PERIOD = NeuronConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT; // In seconds of sim time (not wall time)

  /**
   * @param {Dimension2} chartDimension
   * @param {NeuronClockModelAdapter }neuronClockModelAdapter
   * @constructor
   */
  function MembranePotentialChart( chartDimension, neuronClockModelAdapter ) {

    var thisChart = this;
    Node.call( thisChart );

    thisChart.chartDimension = chartDimension;
    thisChart.clock = neuronClockModelAdapter;
    thisChart.neuronModel = neuronClockModelAdapter.model;
    thisChart.updateCountdownTimer = 0; // Init to zero so that an update occurs right away.
    thisChart.timeIndexOfFirstDataPt = 0;
    thisChart.playingWhenDragStarted = true;
    thisChart.dataSeries = new XYDataSeries( {
      color: PhetColorScheme.RED_COLORBLIND,
      maxPoints: 750 // empirically determined
    } );
    thisChart.domain = [ 0, TIME_SPAN ];
    thisChart.range = [ -100, 100 ];
    thisChart.mostRecentXValue = 0;
    thisChart.mostRecentYValue = 0;

    // Create the root node for the plot.
    var plotNode = new Node();

    var numVerticalGridLines = 25;
    var numHorizontalGridLines = 8;

    // create a function to generate horizontal labels (The dot.LinearFunction returns a map function which can be used
    // to get the appropriate label value based on the index of each vertical line).
    var domainMap = new dot.LinearFunction( 0, numVerticalGridLines, this.domain[ 0 ], this.domain[ 1 ] );

    // To create Vertical Labels
    // Example:- for the value of 3 it returns a value of -50 and for 5 it returns 0 (because range is -100 to 100)
    var rangeMap = new dot.LinearFunction( 0, numHorizontalGridLines, this.range[ 1 ], this.range[ 0 ] );

    var gridShape = new Shape();

    // vertical grid lines
    for ( var i = 0; i < numVerticalGridLines + 1; i++ ) {
      gridShape.moveTo( i * chartDimension.width / numVerticalGridLines, 0 );
      gridShape.lineTo( i * chartDimension.width / numVerticalGridLines, chartDimension.height );
      plotNode.addChild( new Text( domainMap( i ), {
        font: GRID_TICK_TEXT_FONT,
        //Text controls need to aligned to each grid line based on the line's orientation.
        centerX: i * chartDimension.width / numVerticalGridLines,
        top: chartDimension.height + 6
      } ) );
    }

    // horizontal grid lines
    for ( i = 0; i < numHorizontalGridLines + 1; i++ ) {
      gridShape.moveTo( 0, i * chartDimension.height / numHorizontalGridLines );
      gridShape.lineTo( chartDimension.width, i * chartDimension.height / numHorizontalGridLines );
      plotNode.addChild( new Text( rangeMap( i ), {
        font: GRID_TICK_TEXT_FONT,
        centerY: i * chartDimension.height / numHorizontalGridLines,
        right: -6
      } ) );
    }

    plotNode.addChild( new Path( gridShape, { stroke: 'gray', lineWidth: 0.6, boundsMethod: 'none' } ) );

    neuronClockModelAdapter.registerStepCallback( thisChart.step.bind( thisChart ) );

    neuronClockModelAdapter.registerResetCallback( function() {
      thisChart.updateOnSimulationReset();
    } );

    thisChart.neuronModel.stimulusPulseInitiatedProperty.link( function( stimulusPulseInitiated ) {
      if ( stimulusPulseInitiated ) {
        if ( !thisChart.neuronModel.isPotentialChartVisible() ) {
          // If the chart is not visible, we clear any previous recording.
          thisChart.clearChart();
        }
        // Start recording, if it isn't already happening.
        thisChart.neuronModel.startRecording();
      }
    } );

    // title
    var chartTitleNode = new Text( chartTitleString, {
      font: new PhetFont( { size: 16, weight: 'bold' } ),
      top: 0
    } );

    // clear button
    var clearChartButton = new TextPushButton( chartClearString, {
      font: new PhetFont( { size: 12 } ),
      listener: function() {thisChart.clearChart();}
    } );

    // close button
    // TODO: Should go into common code if not already there
    var closeIconLength = 5;
    var xIcon = new Path( new Shape()
        .moveTo( -closeIconLength, -closeIconLength )
        .lineTo( closeIconLength, closeIconLength )
        .moveTo( closeIconLength, -closeIconLength )
        .lineTo( -closeIconLength, closeIconLength ),
      { stroke: 'white', lineWidth: 2.5 }
    );
    var closeButton = new RectangularPushButton( {
      baseColor: PhetColorScheme.RED_COLORBLIND,
      content: xIcon,
      xMargin: 4,
      yMargin: 4,
      listener: function() {
        thisChart.neuronModel.potentialChartVisible = false;
      }
    } );

    // Scale to fit the Title Node within Chart's bounds.
    var maxTitleWidth = chartDimension.width * 0.67;
    var titleNodeScaleFactor = Math.min( 1, maxTitleWidth / chartTitleNode.width );
    chartTitleNode.scale( titleNodeScaleFactor );

    var axisLabelFont = { font: new PhetFont( { size: 12 } ) };
    var chartXAxisLabelNode = new Text( chartXAxisLabelString, axisLabelFont );
    var chartYAxisLabelNode = new Text( chartYAxisLabelString, axisLabelFont );
    chartYAxisLabelNode.rotation = -Math.PI / 2;

    // Scale to fit the Y axis within Chart's bounds
    var yAxisMaxHeight = chartDimension.height;
    var yAxisLabelScaleFactor = Math.min( 1, yAxisMaxHeight / (0.8 * chartYAxisLabelNode.height) );
    chartYAxisLabelNode.scale( yAxisLabelScaleFactor );

    // use domain(0,25) and range(-100,100) as Model View Map
    thisChart.chartMvt = ModelViewTransform2.createRectangleInvertedYMapping( new Bounds2( this.domain[ 0 ], this.range[ 0 ],
      this.domain[ 1 ], this.range[ 1 ] ), new Bounds2( 0, 0, chartDimension.width, chartDimension.height ), 1, 1 );

    // create and add the node that will represent the data line on the chart
    var dataLineNode = new DataLineCanvasNode( chartDimension.width, chartDimension.height, thisChart.dataSeries, this.chartMvt );
    plotNode.addChild( dataLineNode );

    // add the cursor that shows the time value of the neuron state
    this.chartCursor = new ChartCursor( thisChart );
    plotNode.addChild( this.chartCursor );

    neuronClockModelAdapter.playingProperty.link( function() {
      thisChart.updateCursorState();
    } );

    thisChart.neuronModel.timeProperty.link( thisChart.updateChartCursor.bind( thisChart ) );
    thisChart.neuronModel.modeProperty.link( function( mode ) {
      if ( mode ) {
        thisChart.updateChartCursor.bind( thisChart );
      }
    } );

    var xMargin = 12;
    var xSpace = 4;
    // align exactly with clipped area's edges
    var contentWidth = chartYAxisLabelNode.width + plotNode.width + (2 * xMargin) + xSpace;
    var adjustMargin = (MAX_PANEL_WIDTH - contentWidth) / 2;

    // Put the chart, title, and controls in a node together and lay them out.
    var plotAndYLabel = new HBox( {
      children: [ chartYAxisLabelNode, plotNode ],
      spacing: xSpace,
      top: Math.max( chartTitleNode.height, clearChartButton.height ),
      resize: false
    } );
    var panelContents = new Node();
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

    thisChart.neuronModel.potentialChartVisibleProperty.link( function( chartVisible ) {
      thisChart.visible = chartVisible;
    } );
  }

  return inherit( Panel, MembranePotentialChart, {

    /**
     * Add a data point to the graph.
     * @param time    - Time in milliseconds.
     * @param voltage - Voltage in volts.
     * @public
     */
    addDataPoint: function( time, voltage ) {
      var firstDataPoint = false;
      if ( this.dataSeries.getLength() === 0 ) {
        // This is the first data point added since the last time the chart was cleared or since it was created. Record
        // the time index for future reference.
        this.timeIndexOfFirstDataPt = time;
        firstDataPoint = true;
      }

      // compute the x and y values that will be added to the data set if the necessary conditions are met
      var xValue = time - this.timeIndexOfFirstDataPt;
      var yValue = voltage * 1000; // this chart uses millivolts internally

      // Calculate the distance from the most recently added point so that we can add as few points as possible and
      // still get a reasonable looking graph.  This is done as an optimization.
      var distanceFromLastPointSquared = Number.POSITIVE_INFINITY;
      if ( !firstDataPoint ) {
        distanceFromLastPointSquared = Math.pow( xValue - this.mostRecentXValue, 2 ) +
                                       Math.pow( yValue - this.mostRecentYValue, 2 );
      }

      // Add the data point if it is in range, if it is sufficiently far from the previous data point, and if the chart
      // isn't full.
      assert && assert( time - this.timeIndexOfFirstDataPt >= 0 );
      if ( time - this.timeIndexOfFirstDataPt <= TIME_SPAN && distanceFromLastPointSquared > MIN_DISTANCE_SQUARED_BETWEEN_POINTS ) {
        this.dataSeries.addPoint( xValue, yValue );
        this.mostRecentXValue = xValue;
        this.mostRecentYValue = yValue;
        this.chartIsFull = false;
      }
      else if ( time - this.timeIndexOfFirstDataPt > TIME_SPAN && !this.chartIsFull ) {
        // This is the first data point to be received that is outside of the chart's X range.  Add it anyway so that
        // there is no gap in the data shown at the end of the chart.
        this.dataSeries.addPoint( TIME_SPAN, yValue );
        this.chartIsFull = true;
      }
    },

    /**
     * Get the last time value in the data series.  This is assumed to be the
     * highest time value, since data points are expected to be added in order
     * of increasing time.  If no data is present, 0 is returned.
     */
    getLastTimeValue: function() {
      var timeOfLastDataPoint = 0;
      if ( this.dataSeries.getLength() > 0 ) {
        timeOfLastDataPoint = this.dataSeries.getX( this.dataSeries.getLength() - 1 );
      }
      return timeOfLastDataPoint;
    },

    /**
     * Update the chart based on the current time and the model that is being
     * monitored.
     *
     * @param {number} simulationTimeChange - in seconds
     */
    step: function( simulationTimeChange ) {
      if ( this.neuronModel.isRecord() ) {
        if ( !this.chartIsFull && simulationTimeChange > 0 ) {
          this.updateCountdownTimer -= simulationTimeChange;

          var timeInMilliseconds = this.neuronModel.getTime() * 1000;

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
    },

    clearChart: function() {
      this.dataSeries.clear();
      this.chartIsFull = false;
      this.neuronModel.clearHistory();
      this.updateChartCursorVisibility();
    },

    updateChartCursorVisibility: function() {

      // Deciding whether or not the chart cursor should be visible is a
      // little tricky, so I've tried to make the logic very explicit for
      // easier maintenance.  Basically, any time we are in playback mode
      // and we are somewhere on the chart, or when stepping and recording,
      // the cursor should be seen.
      var timeOnChart = ( this.neuronModel.getTime() - this.neuronModel.getMinRecordedTime() ) * 1000;
      var isCurrentTimeOnChart = ( timeOnChart >= 0 ) && ( timeOnChart <= TIME_SPAN );
      var dataExists = this.dataSeries.getLength() > 0;
      var chartCursorVisible = isCurrentTimeOnChart && dataExists;
      this.chartCursor.setVisible( chartCursorVisible );
    },

    // @private - update the position of the chart cursor
    updateChartCursor: function() {
      this.updateChartCursorVisibility();
      if ( this.chartCursor.isVisible() ) {
        this.updateChartCursorPos();
      }
    },

    updateChartCursorPos: function() {
      var recordingStartTime = this.neuronModel.getMinRecordedTime();
      var recordingCurrentTime = this.neuronModel.getTime();
      this.moveChartCursorToTime( ( recordingCurrentTime - recordingStartTime ) * 1000 );
    },

    moveChartCursorToTime: function( time ) {
      this.chartCursor.x = Util.clamp( this.chartMvt.transformX( time ), 0, this.chartDimension.width );
      this.chartCursor.y = this.chartMvt.transformY( this.range[ 1 ] );
    },

    updateOnSimulationReset: function() {
      this.neuronModel.setModeLive();
      this.clearChart();
      this.updateChartCursorVisibility();
    },

    updateCursorState: function() {
      this.updateChartCursorPos();
      this.updateChartCursorVisibility();
    },

    /**
     * Used to control the play/pause state of clock, since grabbing the cursor causes the clock to pause.
     * @param {boolean} playing
     */
    setPlaying: function( playing ) {
      this.clock.playing = playing;
    }
  } );
} );