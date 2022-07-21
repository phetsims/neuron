// Copyright 2014-2022, University of Colorado Boulder

/**
 * This class represents the cursor that the user can grab and move around
 * in order to move the sim back and forth in time.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { Color, Rectangle, SimpleDragHandler } from '../../../../../scenery/js/imports.js';
import neuron from '../../../neuron.js';
import GrippyIndentNode from './GrippyIndentNode.js';

// constants
const WIDTH_PROPORTION = 0.013; // empirically determined
const CURSOR_FILL_COLOR = new Color( 50, 50, 200, 0.2 );
const CURSOR_STROKE_COLOR = Color.DARK_GRAY;
const CURSOR_STYLE = 'ew-resize';

class ChartCursor extends Rectangle {

  /**
   * @param {MembranePotentialChart} membranePotentialChart
   */
  constructor( membranePotentialChart ) {

    const topOfPlotArea = membranePotentialChart.chartMvt.modelToViewPosition( new Vector2( 0, membranePotentialChart.range[ 1 ] ) );
    const bottomOfPlotArea = membranePotentialChart.chartMvt.modelToViewPosition( new Vector2( 0, membranePotentialChart.range[ 0 ] ) );

    // Set the shape.  The shape is created so that it is centered
    // around an offset of 0 in the x direction and the top edge is
    // at 0 in the y direction.
    const width = membranePotentialChart.chartDimension.width * WIDTH_PROPORTION;
    const height = bottomOfPlotArea.y - topOfPlotArea.y;

    super( -width / 2, 0, width, height, 0, 0, {
      cursor: CURSOR_STYLE,
      fill: CURSOR_FILL_COLOR,
      stroke: CURSOR_STROKE_COLOR,
      lineWidth: 0.4,
      lineDash: [ 4, 4 ]
    } );

    // Make it easier to grab this cursor by giving it expanded mouse and touch areas.
    this.mouseArea = this.localBounds.dilatedX( 12 );
    this.touchArea = this.localBounds.dilatedX( 12 );

    let pressPoint;
    let pressTime;
    const chartCursorDragHandler = new SimpleDragHandler( {
      allowTouchSnag: true,
      dragCursor: CURSOR_STYLE,

      start: e => {
        pressPoint = e.currentTarget.globalToParentPoint( e.pointer.point );
        pressTime = membranePotentialChart.chartMvt.viewToModelPosition( new Vector2( this.x, this.y ) ).x;
        membranePotentialChart.playingWhenDragStarted = membranePotentialChart.clock.playingProperty.get();
        if ( membranePotentialChart.playingWhenDragStarted ) {
          // The user must be trying to grab the cursor while the sim is running or while recorded content is being
          // played back.  Pause the clock.
          membranePotentialChart.setPlaying( false );
        }
      },

      drag: e => {
        if ( !membranePotentialChart.neuronModel.isPlayback() ) {
          membranePotentialChart.neuronModel.setPlayback( 1 ); // Set into playback mode.
        }
        const dragPoint = e.currentTarget.globalToParentPoint( e.pointer.point );
        const dx = new Vector2( dragPoint.x - pressPoint.x, dragPoint.y - pressPoint.y );
        const modelDiff = membranePotentialChart.chartMvt.viewToModelPosition( dx );
        let recordingTimeIndex = pressTime + modelDiff.x;
        recordingTimeIndex = Utils.clamp( recordingTimeIndex, 0, membranePotentialChart.getLastTimeValue() );
        const compensatedRecordingTimeIndex = recordingTimeIndex / 1000 + membranePotentialChart.neuronModel.getMinRecordedTime();
        membranePotentialChart.neuronModel.setTime( compensatedRecordingTimeIndex );
      },

      end: () => {
        if ( membranePotentialChart.playingWhenDragStarted ) {
          // The clock was playing when the user grabbed this cursor, so now that they are releasing the cursor we
          // should set the mode back to playing.
          membranePotentialChart.setPlaying( true );
        }
      }
    } );

    this.addInputListener( chartCursorDragHandler );

    // Add the indentations that are intended to convey the idea of "gripability".
    const indentSpacing = 0.05 * height;
    const grippyIndent1 = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
    grippyIndent1.translate( 0, height / 2 - indentSpacing );
    this.addChild( grippyIndent1 );
    const grippyIndent2 = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
    grippyIndent2.translate( 0, height / 2 );
    this.addChild( grippyIndent2 );
    const grippyIndent3 = new GrippyIndentNode( width / 2, CURSOR_FILL_COLOR );
    grippyIndent3.translate( 0, height / 2 + indentSpacing );
    this.addChild( grippyIndent3 );
  }
}

neuron.register( 'ChartCursor', ChartCursor );
export default ChartCursor;