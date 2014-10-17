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

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var NeuronSharedConstants = require( 'NEURON/neuron/common/NeuronSharedConstants' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Panel = require( 'SUN/Panel' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var RectangularButtonView = require( 'SUN/buttons/RectangularButtonView' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var dot = require( 'DOT/dot' );
  var MembranePotentialXYDataSeries = require( 'NEURON/neuron/chart/model/MembranePotentialXYDataSeries' );
  var ChartCursor = require( 'NEURON/neuron/chart/view/ChartCursor' );


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
   * @param {Dimension2}chartDimension
   * @param {NeuronClockModelAdapter }neuronClockModelAdapter
   * @constructor
   */
  function MembranePotentialChart( chartDimension, neuronClockModelAdapter ) {

    var thisChart = this;
    Node.call( thisChart, {} );
    thisChart.chartDimension = chartDimension;
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

    neuronClockModelAdapter.simulationTimeResetProperty.link( function( simulationTimeReset ) {
      if ( simulationTimeReset ) {
        thisChart.updateOnSimulationReset();
      }
    } );

    neuronClockModelAdapter.pausedProperty.link( function( paused ) {
      if ( paused ) {
        thisChart.updateOnClockPaused();
      }
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

    var panelTopContentBox = new LayoutBox( {orientation: 'horizontal',
      children: [chartTitleNode, clearChartButton],
      spacing: 80
    } );


    var chartXAxisLabelNode = new Text( chartXAxisLabelString, {font: new PhetFont( {size: 10} )} );
    var chartYAxisLabelNode = new Text( chartYAxisLabelString, {font: new PhetFont( {size: 10} )} );
    chartYAxisLabelNode.rotation = -Math.PI / 2;


    // vertical panel
    Panel.call( this, new VBox( {
          children: [panelTopContentBox, new HBox( {
            children: [chartYAxisLabelNode, plotNode],
            spacing: 5
          } ), chartXAxisLabelNode], align: 'center', spacing: 3 }
      ), {fill: 'white', xMargin: 10, yMargin: 6, lineWidth: 1 }
    );


    // domain(0,25) map -> range(-100,100)
    thisChart.chartMvt = ModelViewTransform2.createRectangleInvertedYMapping( new Bounds2( this.domain[0], this.range[0], this.domain[1], this.range[1] ), new Bounds2( 0, 0, chartDimension.width, chartDimension.height ), 1, 1 );

    thisChart.neuronModel.potentialChartVisibleProperty.link( function( chartVisibile ) {
      thisChart.visible = chartVisibile;
    } );

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

    thisChart.neuronModel.timeProperty.link( thisChart.updateChartCursor.bind( this ) );


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
      this.chartCursor.x = this.chartMvt.transformX( time );
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
    }

  } );

} );

//// Copyright 2002-2011, University of Colorado
//
//package edu.colorado.phet.neuron.view;
//
//import java.awt.BasicStroke;
//import java.awt.Color;
//import java.awt.Cursor;
//import java.awt.Dimension;
//import java.awt.Stroke;
//import java.awt.event.ActionEvent;
//import java.awt.event.ActionListener;
//import java.awt.geom.Dimension2D;
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//
//import javax.swing.ImageIcon;
//import javax.swing.JButton;
//
//import org.jfree.chart.ChartFactory;
//import org.jfree.chart.JFreeChart;
//import org.jfree.chart.plot.PlotOrientation;
//import org.jfree.chart.plot.XYPlot;
//import org.jfree.chart.renderer.xy.XYItemRenderer;
//import org.jfree.data.xy.XYDataset;
//import org.jfree.data.xy.XYSeries;
//import org.jfree.data.xy.XYSeriesCollection;
//
//import edu.colorado.phet.common.jfreechartphet.piccolo.JFreeChartNode;
//import edu.colorado.phet.common.phetcommon.math.MathUtil;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockEvent;
//import edu.colorado.phet.common.phetcommon.resources.PhetCommonResources;
//import edu.colorado.phet.common.phetcommon.util.SimpleObserver;
//import edu.colorado.phet.common.phetcommon.view.util.PhetFont;
//import edu.colorado.phet.common.piccolophet.event.CursorHandler;
//import edu.colorado.phet.neuron.NeuronStrings;
//import edu.colorado.phet.neuron.model.NeuronModel;
//import edu.colorado.phet.neuron.module.NeuronDefaults;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolo.event.PBasicInputEventHandler;
//import edu.umd.cs.piccolo.event.PInputEvent;
//import edu.umd.cs.piccolo.nodes.PPath;
//import edu.umd.cs.piccolox.pswing.PSwing;

//public class MembranePotentialChart extends PNode implements SimpleObserver {
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------
//

//
//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//
//  private final JFreeChart chart;
//  private final JFreeChartNode jFreeChartNode;
//  private final NeuronModel neuronModel;
//  private final XYSeries dataSeries = new XYSeries( "0" );
//  private final ChartCursor chartCursor;
//  private boolean chartIsFull = false;
//  private double updateCountdownTimer = 0; // Init to zero to an update occurs right away.
//  private double timeIndexOfFirstDataPt = 0;
//  private boolean pausedWhenDragStarted = false;
//
//  //----------------------------------------------------------------------------
//  // Constructor(s)
//  //----------------------------------------------------------------------------
//
//  public MembranePotentialChart( Dimension2D size, String title, final NeuronModel neuronModel ) {

//
//    // Create the chart itself, i.e. the place where date will be shown.
//    XYDataset dataset = new XYSeriesCollection( dataSeries );
//    chart = createXYLineChart( title, NeuronStrings.MEMBRANE_POTENTIAL_X_AXIS_LABEL,
//      NeuronStrings.MEMBRANE_POTENTIAL_Y_AXIS_LABEL, dataset, PlotOrientation.VERTICAL );
//    chart.getXYPlot().getRangeAxis().setTickLabelsVisible( true );
//    chart.getXYPlot().getRangeAxis().setRange( -100, 100 );
//    jFreeChartNode = new JFreeChartNode( chart, false );
//    jFreeChartNode.setBounds( 0, 0, size.getWidth(), size.getHeight() );
//    chart.getXYPlot().getDomainAxis().setRange( 0, TIME_SPAN );
//    jFreeChartNode.updateChartRenderingInfo();
//
//    // Add the chart to this node.
//    addChild( jFreeChartNode );
//
//    // Add the chart cursor, which will allow the user to move back and
//    // forth through time.
//    chartCursor = new ChartCursor( jFreeChartNode );
//    addChild( chartCursor );
//
//    // Add a handler to the chart cursor that will track when it is moved
//    // by the user and will set the model time accordingly.
//
//    chartCursor.addInputEventListener( new PBasicInputEventHandler() {
//
//      Point2D pressPoint;
//      double pressTime;
//
//      @Override
//      public void mousePressed( PInputEvent event ) {
//        pressPoint = event.getPositionRelativeTo( MembranePotentialChart.this );
//        pressTime = jFreeChartNode.nodeToPlot( chartCursor.getOffset() ).getX();
//        pausedWhenDragStarted = neuronModel.getClock().isPaused();
//        if ( !pausedWhenDragStarted ) {
//          // The user must be trying to grab the cursor while
//          // the recorded content is being played back.  Pause the
//          // clock.
//          neuronModel.getClock().setPaused( true );
//        }
//      }
//
//      public Point2D localToPlotDifferential( double dx, double dy ) {
//        Point2D pt1 = new Point2D.Double( 0, 0 );
//        Point2D pt2 = new Point2D.Double( dx, dy );
//        localToGlobal( pt1 );
//        localToGlobal( pt2 );
//        jFreeChartNode.globalToLocal( pt1 );
//        jFreeChartNode.globalToLocal( pt2 );
//        pt1 = jFreeChartNode.nodeToPlot( pt1 );
//        pt2 = jFreeChartNode.nodeToPlot( pt2 );
//        return new Point2D.Double( pt2.getX() - pt1.getX(), pt2.getY() - pt1.getY() );
//      }
//
//      @Override
//      public void mouseDragged( PInputEvent event ) {
//        if ( !neuronModel.isPlayback() ) {
//          neuronModel.setPlayback( 1 ); // Set into playback mode.
//        }
//        Point2D d = event.getPositionRelativeTo( MembranePotentialChart.this );
//        Point2D dx = new Point2D.Double( d.getX() - pressPoint.getX(), d.getY() - pressPoint.getY() );
//        Point2D diff = localToPlotDifferential( dx.getX(), dx.getY() );
//        double recordingTimeIndex = pressTime + diff.getX();
//        recordingTimeIndex = MathUtil.clamp( 0, recordingTimeIndex, getLastTimeValue() );
//        double compensatedRecordingTimeIndex = recordingTimeIndex / 1000 + neuronModel.getMinRecordedTime();
//        neuronModel.setTime( compensatedRecordingTimeIndex );
//      }
//
//      @Override
//      public void mouseReleased( PInputEvent event ) {
//        if ( !pausedWhenDragStarted ) {
//          // The clock wasn't paused when the user grabbed this
//          // cursor, so now that they are releasing the cursor we
//          // should un-pause the clock.
//          neuronModel.getClock().setPaused( false );
//        }
//      }
//    } );
//
//    // Add the button that will allow the user to close the chart.  This
//    // will look like a red 'x' in the corner of the chart, much like the
//    // one seen on standard MS Windows apps.
//    ImageIcon imageIcon = new ImageIcon(
//      PhetCommonResources.getInstance().getImage( PhetCommonResources.IMAGE_CLOSE_BUTTON ) );
//    JButton closeButton = new JButton( imageIcon );
//    closeButton.setPreferredSize( new Dimension( imageIcon.getIconWidth(), imageIcon.getIconHeight() ) );
//    closeButton.addActionListener( new ActionListener() {
//      public void actionPerformed( ActionEvent e ) {
//        neuronModel.setPotentialChartVisible( false );
//      }
//    } );
//
//    PSwing closePSwing = new PSwing( closeButton );
//    closePSwing.setOffset( size.getWidth() - closeButton.getBounds().width - 2, 2 );
//    closePSwing.addInputEventListener( new CursorHandler( Cursor.HAND_CURSOR ) );
//    addChild( closePSwing );
//
//    // Add the button for clearing the chart.
//    JButton clearButton = new JButton( NeuronStrings.MEMBRANE_POTENTIAL_CLEAR_CHART );
//    clearButton.setFont( new PhetFont( 14 ) );
//    clearButton.addActionListener( new ActionListener() {
//      public void actionPerformed( ActionEvent e ) {
//        // If an action potential is in progress, start or continue
//        // recording.
//        if ( neuronModel.isActionPotentialInProgress() ) {
//          neuronModel.startRecording();
//        }
//        else if ( neuronModel.isRecord() ) {
//          // Stop recording if one is in progress.
//          neuronModel.setModeLive();
//        }
//        // Clear the chart.
//        clearChart();
//      }
//    } );
//    PSwing clearButtonPSwing = new PSwing( clearButton );
//    clearButtonPSwing.setOffset(
//        closePSwing.getFullBoundsReference().getMinX() - clearButtonPSwing.getFullBoundsReference().width - 10,
//      0 );
//    addChild( clearButtonPSwing );
//
//    // Final initialization steps.
//    updateChartCursorVisibility();
//    updateChartCursorPos();
//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------
//
//  /**
//   * Add a data point to the graph.
//   *
//   * @param time    - Time in milliseconds.
//   * @param voltage - Voltage in volts.
//   * @param update  - Controls if graph should be refreshed on the screen.
//   */
//  private void addDataPoint( double time, double voltage, boolean update ) {
//
//    if ( dataSeries.getItemCount() == 0 ) {
//      // This is the first data point added since the last time the
//      // chart was cleared or since it was created.  Record the time
//      // index for future reference.
//      timeIndexOfFirstDataPt = time;
//    }
//
//    // If the chart isn't full, add the data point to the data series.
//    // Note that internally we work in millivolts, not volts.
//    assert ( time - timeIndexOfFirstDataPt >= 0 );
//    if ( time - timeIndexOfFirstDataPt <= TIME_SPAN ) {
//      dataSeries.add( time - timeIndexOfFirstDataPt, voltage * 1000, update );
//      chartIsFull = false;
//    }
//    else if ( !chartIsFull ) {
//      // This is the first data point to be received that is outside of
//      // the chart's range.  Add it anyway so that there is no gap
//      // in the data shown at the end of the chart.
//      dataSeries.add( time - timeIndexOfFirstDataPt, voltage * 1000, true );
//      chartIsFull = true;
//    }
//    else {
//      System.out.println( getClass().getName() + " Warning: Attempt to add data to full chart, ignoring." );
//    }
//  }
//
//  /**
//   * Get the last time value in the data series.  This is assumed to be the
//   * highest time value, since data points are expected to be added in order
//   * of increasing time.  If no data is present, 0 is returned.
//   */
//  private double getLastTimeValue() {
//    double timeOfLastDataPoint = 0;
//    if ( dataSeries.getItemCount() > 0 ) {
//      timeOfLastDataPoint = dataSeries.getX( dataSeries.getItemCount() - 1 ).doubleValue();
//    }
//    return timeOfLastDataPoint;
//  }
//
//  /**
//   * Create the JFreeChart chart that will show the data and that will be
//   * contained by this node.
//   *
//   * @param title
//   * @param xAxisLabel
//   * @param yAxisLabel
//   * @param dataset
//   * @param orientation
//   * @return
//   */
//  private static JFreeChart createXYLineChart( String title, String xAxisLabel, String yAxisLabel,
//    XYDataset dataset, PlotOrientation orientation ) {
//
//    if ( orientation == null ) {
//      throw new IllegalArgumentException( "Null 'orientation' argument." );
//    }
//
//    JFreeChart chart = ChartFactory.createXYLineChart(
//      title,
//      xAxisLabel,
//      yAxisLabel,
//      dataset,
//      PlotOrientation.VERTICAL,
//      false, // legend
//      false, // tooltips
//      false // urls
//    );
//
//    // Set the stroke for the data line to be larger than the default.
//    XYPlot plot = chart.getXYPlot();
//    XYItemRenderer renderer = plot.getRenderer();
//    renderer.setStroke( new BasicStroke( 3f, BasicStroke.JOIN_ROUND, BasicStroke.JOIN_BEVEL ) );
//
//    return chart;
//  }
//
//  /**
//   * Update the chart based on the current time and the model that is being
//   * monitored.
//   *
//   * @param clockEvent
//   */
//  private void updateChart( ClockEvent clockEvent ) {
//
//    if ( neuronModel.isRecord() ) {
//      if ( !chartIsFull && clockEvent.getSimulationTimeChange() > 0 ) {
//        updateCountdownTimer -= clockEvent.getSimulationTimeChange();
//
//        double timeInMilliseconds = neuronModel.getTime() * 1000;
//
//        if ( updateCountdownTimer <= 0 ) {
//          addDataPoint( timeInMilliseconds, neuronModel.getMembranePotential(), true );
//          updateCountdownTimer = UPDATE_PERIOD;
//        }
//        else {
//          addDataPoint( timeInMilliseconds, neuronModel.getMembranePotential(), false );
//        }
//      }
//
//      if ( chartIsFull && neuronModel.isRecord() ) {
//        // The chart is full, so it is time to stop recording.
//        neuronModel.setModeLive();
//      }
//    }
//  }
//
//  /**
//   * Clear all data from the chart.
//   */
//  private void clearChart() {
//    dataSeries.clear();
//    chartIsFull = false;
//    neuronModel.clearHistory();
//    updateChartCursorVisibility();
//  }
//
//  private void updateChartCursorVisibility() {
//    // Deciding whether or not the chart cursor should be visible is a
//    // little tricky, so I've tried to make the logic very explicit for
//    // easier maintenance.  Basically, any time we are in playback mode
//    // and we are somewhere on the chart, or when stepping and recording,
//    // the cursor should be seen.
//
//    double timeOnChart = ( neuronModel.getTime() - neuronModel.getMinRecordedTime() ) * 1000;
//    boolean isCurrentTimeOnChart = ( timeOnChart >= 0 ) && ( timeOnChart <= TIME_SPAN );
//    boolean dataExists = dataSeries.getItemCount() > 0;
//
// // boolean chartCursorVisible = isCurrentTimeOnChart && dataExists &&
// // (neuronModel.isPlayback() || (neuronModel.getClock().isPaused() && !neuronModel.isLive()));
//    boolean chartCursorVisible = isCurrentTimeOnChart && dataExists;
//
//    chartCursor.setVisible( chartCursorVisible );
//  }
//
//  private void moveChartCursorToTime( double time ) {
//    Point2D cursorPos = jFreeChartNode.plotToNode( new Point2D.Double( time, jFreeChartNode.getChart().getXYPlot().getRangeAxis().getRange().getUpperBound() ) );
//    chartCursor.setOffset( cursorPos );
//  }
//
//  //----------------------------------------------------------------------------
//  // Inner Classes and Interfaces
//  //----------------------------------------------------------------------------
//
//  /**
//   * This class represents the cursor that the user can grab and move around
//   * in order to move the sim back and forth in time.
//   */
//  private static class ChartCursor extends PPath {
//
//    private static final double WIDTH_PROPORTION = 0.013;
//    private static final Color FILL_COLOR = new Color( 50, 50, 200, 80 );
//    private static final Color STROKE_COLOR = Color.DARK_GRAY;
//    private static final Stroke STROKE = new BasicStroke( 1.0f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER, 1.0f, new float[] { 10.0f, 5.0f }, 0 );
//
//    public ChartCursor( JFreeChartNode jFreeChartNode ) {
//
//      // Set up the general appearance.
//      setStroke( STROKE );
//      setStrokePaint( STROKE_COLOR );
//      setPaint( FILL_COLOR );
//
//      Point2D topOfPlotArea = jFreeChartNode.plotToNode( new Point2D.Double( 0, jFreeChartNode.getChart().getXYPlot().getRangeAxis().getRange().getUpperBound() ) );
//      Point2D bottomOfPlotArea = jFreeChartNode.plotToNode( new Point2D.Double( 0, jFreeChartNode.getChart().getXYPlot().getRangeAxis().getRange().getLowerBound() ) );
//
//      // Set the shape.  The shape is created so that it is centered
//      // around an offset of 0 in the x direction and the top edge is
//      // at 0 in the y direction.
//      double width = jFreeChartNode.getFullBoundsReference().width * WIDTH_PROPORTION;
//      double height = bottomOfPlotArea.getY() - topOfPlotArea.getY();
//      setPathTo( new Rectangle2D.Double( -width / 2, 0, width, height ) );
//
//      // Add the indentations that are intended to convey the idea of
//      // "gripability".
//      double indentSpacing = 0.05 * height;
//      PNode grippyIndent1 = new GrippyIndentNode( width / 2, FILL_COLOR );
//      grippyIndent1.setOffset( 0, height / 2 - indentSpacing );
//      addChild( grippyIndent1 );
//      PNode grippyIndent2 = new GrippyIndentNode( width / 2, FILL_COLOR );
//      grippyIndent2.setOffset( 0, height / 2 );
//      addChild( grippyIndent2 );
//      PNode grippyIndent3 = new GrippyIndentNode( width / 2, FILL_COLOR );
//      grippyIndent3.setOffset( 0, height / 2 + indentSpacing );
//      addChild( grippyIndent3 );
//
//      // Set a cursor handler for this node.
//      addInputEventListener( new CursorHandler( Cursor.E_RESIZE_CURSOR ) );
//    }
//  }
//
//  private void updateChartCursorPos() {
//    double recordingStartTime = neuronModel.getMinRecordedTime();
//    double recordingCurrentTime = neuronModel.getTime();
//    moveChartCursorToTime( ( recordingCurrentTime - recordingStartTime ) * 1000 );
//  }
//
//  /**
//   * Handle change notifications from the record-and-playback portion of the
//   * model.
//   */
//  public void update() {
//    updateChartCursorVisibility();
//    if ( chartCursor.getVisible() ) {
//      updateChartCursorPos();
//    }
//  }
//}
