// Copyright 2014-2015, University of Colorado Boulder

 /**
 * This class represents the cursor that the user can grab and move around
 * in order to move the sim back and forth in time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Color = require( 'SCENERY/util/Color' );
  var Vector2 = require( 'DOT/Vector2' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Util = require( 'DOT/Util' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var GrippyIndentNode = require( 'NEURON/neuron/view/chart/GrippyIndentNode' );
  var neuron = require( 'NEURON/neuron' );

  // constants
  var WIDTH_PROPORTION = 0.013; // empirically determined
  var CURSOR_FILL_COLOR = new Color( 50, 50, 200, 0.2 );
  var CURSOR_STROKE_COLOR = Color.DARK_GRAY;

  /**
   * @param {MembranePotentialChart} membranePotentialChart
   * @constructor
   */
  function ChartCursor( membranePotentialChart ) {

    var self = this;
    var topOfPlotArea = membranePotentialChart.chartMvt.modelToViewPosition( new Vector2( 0, membranePotentialChart.range[ 1 ] ) );
    var bottomOfPlotArea = membranePotentialChart.chartMvt.modelToViewPosition( new Vector2( 0, membranePotentialChart.range[ 0 ] ) );

    // Set the shape.  The shape is created so that it is centered
    // around an offset of 0 in the x direction and the top edge is
    // at 0 in the y direction.
    var width = membranePotentialChart.chartDimension.width * WIDTH_PROPORTION;
    var height = bottomOfPlotArea.y - topOfPlotArea.y;

    Rectangle.call( self, -width / 2, 0, width, height, 0, 0, {
      cursor: 'e-resize',
      fill: CURSOR_FILL_COLOR,
      stroke: CURSOR_STROKE_COLOR,
      lineWidth: 0.4,
      lineDash: [ 4, 4 ]
    } );

    // Make it easier to grab this cursor by giving it expanded mouse and touch areas.
    this.mouseArea = this.localBounds.dilatedX( 12 );
    this.touchArea = this.localBounds.dilatedX( 12 );

    var pressPoint;
    var pressTime;
    var chartCursorDragHandler = new SimpleDragHandler( {
      allowTouchSnag: true,
      dragCursor: 'e-resize',

      start: function( e ) {
        pressPoint = e.currentTarget.globalToParentPoint( e.pointer.point );
        pressTime = membranePotentialChart.chartMvt.viewToModelPosition( new Vector2( self.x, self.y ) ).x;
        membranePotentialChart.playingWhenDragStarted = membranePotentialChart.clock.playing;
        if ( membranePotentialChart.playingWhenDragStarted ) {
          // The user must be trying to grab the cursor while the sim is running or while recorded content is being
          // played back.  Pause the clock.
          membranePotentialChart.setPlaying( false );
        }
      },

      drag: function( e ) {
        if ( !membranePotentialChart.neuronModel.isPlayback() ) {
          membranePotentialChart.neuronModel.setPlayback( 1 ); // Set into playback mode.
        }
        var dragPoint = e.currentTarget.globalToParentPoint( e.pointer.point );
        var dx = new Vector2( dragPoint.x - pressPoint.x, dragPoint.y - pressPoint.y );
        var modelDiff = membranePotentialChart.chartMvt.viewToModelPosition( dx );
        var recordingTimeIndex = pressTime + modelDiff.x;
        recordingTimeIndex = Util.clamp( recordingTimeIndex, 0, membranePotentialChart.getLastTimeValue() );
        var compensatedRecordingTimeIndex = recordingTimeIndex / 1000 + membranePotentialChart.neuronModel.getMinRecordedTime();
        membranePotentialChart.neuronModel.setTime( compensatedRecordingTimeIndex );
      },

      end: function() {
        if ( membranePotentialChart.playingWhenDragStarted ) {
          // The clock was playing when the user grabbed this cursor, so now that they are releasing the cursor we
          // should set the mode back to playing.
          membranePotentialChart.setPlaying( true );
        }
      }
    } );

    self.addInputListener( chartCursorDragHandler );

    // Add the indentations that are intended to convey the idea of "gripability".
    var indentSpacing = 0.05 * height;
    var grippyIndent1 = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
    grippyIndent1.translate( 0, height / 2 - indentSpacing );
    self.addChild( grippyIndent1 );
    var grippyIndent2 = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
    grippyIndent2.translate( 0, height / 2 );
    self.addChild( grippyIndent2 );
    var grippyIndent3 = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
    grippyIndent3.translate( 0, height / 2 + indentSpacing );
    self.addChild( grippyIndent3 );
  }

  neuron.register( 'ChartCursor', ChartCursor );

  return inherit( Rectangle, ChartCursor, {} );
} );