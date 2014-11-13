// Copyright 2002-2011, University of Colorado
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
 * This chart also controls the record-and-playback state of the model.  This
 * is done so that the window of recorded data in the model matches that shown
 * in the chart, allowing the user to set the model state at any time shown in
 * the chart.
 * <p/>
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var NeuronSharedConstants = require( 'NEURON/neuron/common/NeuronSharedConstants' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var dot = require( 'DOT/dot' );
  var MembranePotentialXYDataSeries = require( 'NEURON/neuron/chart/model/MembranePotentialXYDataSeries' );
  var ChartCursor = require( 'NEURON/neuron/chart/view/ChartCursor' );
  var Util = require( 'DOT/Util' );

  // strings
  var chartTitleString = require( 'string!NEURON/chartTitle' );
  var chartClearString = require( 'string!NEURON/chartClear' );
  var chartXAxisLabelString = require( 'string!NEURON/chartXAxisLabel' );
  var chartYAxisLabelString = require( 'string!NEURON/chartYAxisLabel' );


  var GRID_TICK_TEXT_FONT = new PhetFont( 8 );
  var TIME_SPAN = 25; // In seconds.

  // This value sets the frequency of chart updates, which helps to reduce
  // the processor consumption.
  var UPDATE_PERIOD = 1 * NeuronSharedConstants.DEFAULT_ACTION_POTENTIAL_CLOCK_DT; // In seconds

  /**
   *
   * @param {Dimension2} chartDimension
   * @param {NeuronClockModelAdapter }neuronClockModelAdapter
   * @constructor
   */
  function MembranePotentialChart( chartDimension, neuronClockModelAdapter ) {

    var thisChart = this;
    Node.call( thisChart, {} );
    thisChart.chartDimension = chartDimension;
    thisChart.clock = neuronClockModelAdapter;
    thisChart.neuronModel = neuronClockModelAdapter.model;

    thisChart.updateCountdownTimer = 0; // Init to zero to an update occurs right away.
    thisChart.timeIndexOfFirstDataPt = 0;
    thisChart.pausedWhenDragStarted = false;
    thisChart.dataSeries = new MembranePotentialXYDataSeries( {color: 'red'} );

    var plotNode = new Node();
    thisChart.addChild( plotNode );

    this.domain = [0, TIME_SPAN];
    this.range = [ -100, 100 ];


    var numVerticalGridLines = 25;
    var numHorizontalGridLines = 8;

    //To create Horizontal Labels
    var domainMap = new dot.LinearFunction( 0, numVerticalGridLines, this.domain[0], this.domain[1] );

    //To create Vertical Labels
    var rangeMap = new dot.LinearFunction( 0, numHorizontalGridLines, this.range[1], this.range[0] );

    var bounds2 = new Bounds2( 0, 0, 0, 0 );

    function computeShapeBounds() {
      return bounds2;
    }


    var plotGrid = new Node();
    var lineWidth = 0.3;
    var line;
    //vertical grid lines
    for ( var i = 0; i < numVerticalGridLines + 1; i++ ) {
      line = new Line( i * chartDimension.width / numVerticalGridLines, 0, i * chartDimension.width / numVerticalGridLines, chartDimension.height, {stroke: 'gray', lineWidth: lineWidth} );
      line.computeShapeBounds = computeShapeBounds;
      plotGrid.addChild( line );
      plotGrid.addChild( new Text( domainMap( i ), {font: GRID_TICK_TEXT_FONT, centerX: line.centerX, top: line.bottom + 6} ) );
    }

    //horizontal grid lines
    for ( i = 0; i < numHorizontalGridLines + 1; i++ ) {
      line = new Line( 0, i * chartDimension.height / numHorizontalGridLines, chartDimension.width, i * chartDimension.height / numHorizontalGridLines, {stroke: 'gray', lineWidth: lineWidth} );
      line.computeShapeBounds = computeShapeBounds;
      plotGrid.addChild( line );
      plotGrid.addChild( new Text( rangeMap( i ), {font: GRID_TICK_TEXT_FONT, centerY: line.centerY, right: line.left - 6} ) );

    }

    plotNode.addChild( plotGrid );
    var chartContentNode = new Node();
    plotNode.addChild( chartContentNode );

    neuronClockModelAdapter.registerStepCallback( thisChart.step.bind( thisChart ) );

    neuronClockModelAdapter.registerRestCallback( function() {
      thisChart.updateOnSimulationReset();
    } );


    thisChart.neuronModel.stimulusPulseInitiatedProperty.link( function( stimulusPulseInitiated ) {
      if ( stimulusPulseInitiated ) {
        if ( !thisChart.neuronModel.isPotentialChartVisible() ) {
          // If the chart is not visible, we clear any previous
          // recording.
          thisChart.clearChart();
        }
        // Start recording, if it isn't already happening.
        thisChart.neuronModel.startRecording();
      }

    } );

    var chartTitleNode = new Text( chartTitleString, {font: new PhetFont( {size: 16, weight: 'bold'} )} );
    var clearChartButton = new TextPushButton( chartClearString, {
      font: new PhetFont( {size: 12} ),
      baseColor: 'silver',
      buttonAppearanceStrategy: RectangularButtonView.flatAppearanceStrategy
    } );
    clearChartButton.addListener( function() {thisChart.clearChart();} );

    var closeIconRadius = 4;

    var xIcon = new Path( new Shape()
      .moveTo( -closeIconRadius, -closeIconRadius )
      .lineTo( closeIconRadius, closeIconRadius )
      .moveTo( closeIconRadius, -closeIconRadius )
      .lineTo( -closeIconRadius, closeIconRadius ), {stroke: 'white', lineWidth: 2} );
    //close button
    var closeButton = new RectangularPushButton( {
      baseColor: 'red',
      content: xIcon,
      buttonAppearanceStrategy: RectangularButtonView.flatAppearanceStrategy,
      // click to toggle
      listener: function() {
        thisChart.neuronModel.potentialChartVisible = false;
      }
    } );


    var buttonGroupBox = new LayoutBox( {orientation: 'horizontal',
      children: [clearChartButton, closeButton],
      spacing: 20
    } );

    // Scale to fit the Title Node within Chart's bounds
    var maxTitleWidth = 250;
    var titleNodeScaleFactor = Math.min( 1, maxTitleWidth / chartTitleNode.width );
    chartTitleNode.scale( titleNodeScaleFactor );

    var panelTopContentBox = new HBox( {children: [chartTitleNode, buttonGroupBox],
      spacing: 120 * titleNodeScaleFactor
    } );


    var axisLabelFont = {font: new PhetFont( {size: 12} )};
    var chartXAxisLabelNode = new Text( chartXAxisLabelString, axisLabelFont );
    var chartYAxisLabelNode = new Text( chartYAxisLabelString, axisLabelFont );
    chartYAxisLabelNode.rotation = -Math.PI / 2;

    // Scale to fit the Y axis within Chart's bounds
    var yAxisMaxHeight = chartDimension.height;
    var yAxisLabelScaleFactor = Math.min( 1, yAxisMaxHeight / (0.8 * chartYAxisLabelNode.height) );
    chartYAxisLabelNode.scale( yAxisLabelScaleFactor );

    // domain(0,25) map -> range(-100,100)
    thisChart.chartMvt = ModelViewTransform2.createRectangleInvertedYMapping( new Bounds2( this.domain[0], this.range[0], this.domain[1], this.range[1] ), new Bounds2( 0, 0, chartDimension.width, chartDimension.height ), 1, 1 );


    thisChart.dataSeries.addDataSeriesListener( function( x, y, xPrevious, yPrevious ) {
      if ( xPrevious && yPrevious && (xPrevious !== 0 || yPrevious !== 0 ) ) {
        var line = new Line( thisChart.chartMvt.modelToViewX( xPrevious ), thisChart.chartMvt.modelToViewY( yPrevious ), thisChart.chartMvt.modelToViewX( x ), thisChart.chartMvt.modelToViewY( y ), {
            stroke: thisChart.dataSeries.color}
        );
        line.computeShapeBounds = computeShapeBounds;
        chartContentNode.addChild( line );
      }

      thisChart.dataSeries.addDataClearListener( function() {
        chartContentNode.removeAllChildren();
      } );

    } );

    this.chartCursor = new ChartCursor( thisChart );
    plotNode.addChild( this.chartCursor );

    neuronClockModelAdapter.pausedProperty.link( function( paused ) {
      thisChart.updateOnClockPaused();
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
    var maxPanelWidth = 554;
    var adjustMargin = (maxPanelWidth - contentWidth) / 2;

    // vertical panel
    Panel.call( this, new VBox( {
          children: [panelTopContentBox, new HBox( {
            children: [chartYAxisLabelNode, plotNode],
            spacing: xSpace
          } ), chartXAxisLabelNode], align: 'center', spacing: 4 }
      ), {fill: 'white', xMargin: xMargin + adjustMargin, yMargin: 6, lineWidth: 1, cornerRadius: 2 }
    );


    thisChart.neuronModel.potentialChartVisibleProperty.link( function( chartVisibile ) {
      thisChart.visible = chartVisibile;
    } );


  }

  return inherit( Panel, MembranePotentialChart, {

    /**
     * Add a data point to the graph.
     *
     * @param time    - Time in milliseconds.
     * @param voltage - Voltage in volts.
     * @param update  - Controls if graph should be refreshed on the screen.
     */
    addDataPoint: function( time, voltage, update ) {

      if ( this.dataSeries.length === 0 ) {
        // This is the first data point added since the last time the
        // chart was cleared or since it was created.  Record the time
        // index for future reference.
        this.timeIndexOfFirstDataPt = time;
      }

      // If the chart isn't full, add the data point to the data series.
      // Note that internally we work in millivolts, not volts.
      assert && assert( time - this.timeIndexOfFirstDataPt >= 0 );
      if ( time - this.timeIndexOfFirstDataPt <= TIME_SPAN ) {
        this.dataSeries.addPoint( time - this.timeIndexOfFirstDataPt, voltage * 1000 );
        this.chartIsFull = false;
      }
      else if ( !this.chartIsFull ) {
        // This is the first data point to be received that is outside of
        // the chart's range.  Add it anyway so that there is no gap
        // in the data shown at the end of the chart.
        this.dataSeries.addPoint( time - this.timeIndexOfFirstDataPt, voltage * 1000 );
        this.chartIsFull = true;
      }
      else {
        console.log( "MembrancePotential Chart Warning: Attempt to add data to full chart, ignoring." );
      }
    },

    /**
     * Get the last time value in the data series.  This is assumed to be the
     * highest time value, since data points are expected to be added in order
     * of increasing time.  If no data is present, 0 is returned.
     */
    getLastTimeValue: function() {
      var timeOfLastDataPoint = 0;
      if ( this.dataSeries.length > 0 ) {
        timeOfLastDataPoint = this.dataSeries.getX( this.dataSeries.length - 1 );
      }
      return timeOfLastDataPoint;
    },
    /**
     * Update the chart based on the current time and the model that is being
     * monitored.
     *
     * @param dt
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
      var dataExists = this.dataSeries.length > 0;
      var chartCursorVisible = isCurrentTimeOnChart && dataExists;
      this.chartCursor.setVisible( chartCursorVisible );
    },

    /**
     * called on every step dt
     */
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
      this.chartCursor.y = this.chartMvt.transformY( this.range[1] );
    },

    updateOnSimulationReset: function() {
      this.neuronModel.setModeLive();
      this.clearChart();
      this.updateChartCursorVisibility();
    },
    updateOnClockPaused: function() {
      this.updateChartCursorPos();
      this.updateChartCursorVisibility();
    },
    /**
     * Used to control the paused state of Neuron clock
     * Example : Clock is paused on/off when user drags the MembranePotential chart cursor
     * @param paused
     */
    setPaused: function( paused ) {
      this.clock.setPaused( paused );
    }

  } );

} );
