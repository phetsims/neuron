// Copyright 2015-2021, University of Colorado Boulder
/**
 * Class that visually represents the action potential that travels down the membrane prior to reaching the cross
 * section.  It is meant to look sort of 'electric' or 'energetic'.  This is done as a CanvasNode as an optimization,
 * and is made to be a node that is permanently added to the scene graph rather than recreated each time a new
 * traveling action potential is initiated in the model.
 *
 * @author John Blanco
 */

import { CanvasNode } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';

// constants
const BACKGROUND_COLOR = '#CC66FF';
const BACKGROUND_LINE_WIDTH = 10;
const FOREGROUND_COLOR = 'yellow';
const FOREGROUND_LINE_WIDTH = 5;

class TravelingActionPotentialCanvasNode extends CanvasNode {

  /**
   * @param {ModelViewTransform2} mvt
   * @param {Bounds2} bounds - bounds where the canvas should appear
   */
  constructor( mvt, bounds ) {
    super( { canvasBounds: bounds } );
    this.mvt = mvt;
    this.travelingActionPotential = null; // @private - must hook up an action potential using methods defined below
  }

  /**
   * Attach the model of the action potential to this node.  This is done rather than creating an entirely new node
   * each time an action potential starts in order to get better performance.
   * {TravelingActionPotential} travelingActionPotential
   * @public
   */
  travelingActionPotentialStarted( travelingActionPotential ) {

    this.travelingActionPotential = travelingActionPotential;

    // cause the canvas to get repainted each time the shape of the action potential changes
    this.shapeChangeListener = this.invalidatePaint.bind( this );
    travelingActionPotential.shapeChanged.addListener( this.shapeChangeListener );
  }

  /**
   * Signal that the action potential has ended and no longer needs to be depicted in the view.
   * @public
   */
  travelingActionPotentialEnded() {
    this.travelingActionPotential.shapeChanged.removeListener( this.shapeChangeListener );
    this.travelingActionPotential = null;
    this.invalidatePaint();
  }

  /**
   * Paint the canvas with all of the membrane channels
   * @param {CanvasRenderingContext2D} context
   * @override
   * @public
   */
  paintCanvas( context ) {

    if ( this.travelingActionPotential !== null ) {
      const shapeDescription = this.travelingActionPotential.shapeDescription; // convenience var
      assert && assert( shapeDescription.mode === 'curve' || shapeDescription.mode === 'circle', 'unrecognized mode for action potential shape' );

      // render the action potential in the HTML canvas
      context.beginPath();
      if ( shapeDescription.mode === 'curve' ) {
        context.moveTo(
          this.mvt.modelToViewX( shapeDescription.startPoint.x ),
          this.mvt.modelToViewY( shapeDescription.startPoint.y )
        );
        context.bezierCurveTo(
          this.mvt.modelToViewX( shapeDescription.controlPoint1.x ),
          this.mvt.modelToViewY( shapeDescription.controlPoint1.y ),
          this.mvt.modelToViewX( shapeDescription.controlPoint2.x ),
          this.mvt.modelToViewY( shapeDescription.controlPoint2.y ),
          this.mvt.modelToViewX( shapeDescription.endPoint.x ),
          this.mvt.modelToViewY( shapeDescription.endPoint.y )
        );
      }
      else {
        context.arc(
          this.mvt.modelToViewX( shapeDescription.circleCenter.x ),
          this.mvt.modelToViewY( shapeDescription.circleCenter.y ),
          this.mvt.modelToViewDeltaX( shapeDescription.circleRadius ),
          0,
          Math.PI * 2
        );
      }

      context.lineCap = 'round';
      context.strokeStyle = BACKGROUND_COLOR;
      context.lineWidth = BACKGROUND_LINE_WIDTH;
      context.stroke();
      context.strokeStyle = FOREGROUND_COLOR;
      context.lineWidth = FOREGROUND_LINE_WIDTH;
      context.stroke();
    }
  }
}

neuron.register( 'TravelingActionPotentialCanvasNode', TravelingActionPotentialCanvasNode );

export default TravelingActionPotentialCanvasNode;