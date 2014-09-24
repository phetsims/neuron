// Copyright 2002-2011, University of Colorado

/**
 * Model representation for the axon membrane.  Represents it as a cross
 * section and a shape that is intended to look like the body of the axon
 * receding into the distance.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var TravelingActionPotential = require( 'NEURON/neuron/model/TravelingActionPotential' );
  var Cubic = require( 'KITE/segments/Cubic' );


  // Fixed membrane characteristics.

  var BODY_LENGTH = NeuronConstants.DEFAULT_DIAMETER * 1.5;
  var BODY_TILT_ANGLE = Math.PI / 4;

  /*
   * @constructor
   */
  function AxonMembrane() {

    var thisModel = this;

    PropertySet.call( thisModel, {
      travelingActionPotentialStarted: false,
      travelingActionPotentialReachedCrossSection: false,
      travelingActionPotentialEnded: false
    } );

    thisModel.travelingActionPotential = null;

    var createAxonBodyShape = function() {
      // Shape of the body of the axon.
      thisModel.axonBodyShape = new Shape();
      // Points that define the body shape.
      thisModel.vanishingPoint = new Vector2( BODY_LENGTH * Math.cos( BODY_TILT_ANGLE ), BODY_LENGTH * Math.sin( BODY_TILT_ANGLE ) );

      // Find the two points at which the shape will intersect the outer
      // edge of the cross section.
      var r = thisModel.getCrossSectionDiameter() / 2 + thisModel.getMembraneThickness() / 2;
      var theta = BODY_TILT_ANGLE + Math.PI * 0.45; // Multiplier tweaked a bit for improved appearance.
      thisModel.intersectionPointA = new Vector2( r * Math.cos( theta ), r * Math.sin( theta ) );
      theta += Math.PI;
      thisModel.intersectionPointB = new Vector2( r * Math.cos( theta ), r * Math.sin( theta ) );

      // Define the control points for the two curves.  Note that there is
      // some tweaking in here, so change as needed to get the desired look.
      // If you can figure it out, that is.  Hints: The shape is drawn
      // starting as a curve from the vanishing point to intersection point
      // A, then a line to intersection point B, then as a curve back to the
      // vanishing point.

      var angleToVanishingPt = Math.atan2( thisModel.vanishingPoint.y - thisModel.intersectionPointA.y, thisModel.vanishingPoint.x - thisModel.intersectionPointA.x );
      var ctrlPtRadius = thisModel.intersectionPointA.distance( thisModel.vanishingPoint ) * 0.33;
      thisModel.cntrlPtA1 = new Vector2(
          thisModel.intersectionPointA.x + ctrlPtRadius * Math.cos( angleToVanishingPt + 0.15 ),
          thisModel.intersectionPointA.y + ctrlPtRadius * Math.sin( angleToVanishingPt + 0.15 ) );
      ctrlPtRadius = thisModel.intersectionPointA.distance( thisModel.vanishingPoint ) * 0.67;
      thisModel.cntrlPtA2 = new Vector2(
          thisModel.intersectionPointA.x + ctrlPtRadius * Math.cos( angleToVanishingPt - 0.5 ),
          thisModel.intersectionPointA.y + ctrlPtRadius * Math.sin( angleToVanishingPt - 0.5 ) );

      var angleToIntersectionPt = Math.atan2( thisModel.intersectionPointB.y - thisModel.vanishingPoint.y,
          thisModel.intersectionPointB.x - thisModel.intersectionPointB.x );
      ctrlPtRadius = thisModel.intersectionPointB.distance( thisModel.vanishingPoint ) * 0.33;
      thisModel.cntrlPtB1 = new Vector2(
          thisModel.vanishingPoint.x + ctrlPtRadius * Math.cos( angleToIntersectionPt + 0.1 ),
          thisModel.vanishingPoint.y + ctrlPtRadius * Math.sin( angleToIntersectionPt + 0.1 ) );
      ctrlPtRadius = thisModel.intersectionPointB.distance( thisModel.vanishingPoint ) * 0.67;
      thisModel.cntrlPtB2 = new Vector2(
          thisModel.vanishingPoint.x + ctrlPtRadius * Math.cos( angleToIntersectionPt - 0.25 ),
          thisModel.vanishingPoint.y + ctrlPtRadius * Math.sin( angleToIntersectionPt - 0.25 ) );

      // Create the curves that define the boundaries of the body.
      thisModel.curveA = new Cubic( thisModel.vanishingPoint, thisModel.cntrlPtA2, thisModel.cntrlPtA1, thisModel.intersectionPointA );
      thisModel.curveB = new Cubic( thisModel.vanishingPoint, thisModel.cntrlPtB1, thisModel.cntrlPtB2, thisModel.intersectionPointB );


      // Reverse Path Iteration for drawing
      thisModel.axonBodyShape.moveTo( thisModel.intersectionPointA.x,
        thisModel.intersectionPointA.y );
      thisModel.axonBodyShape.cubicCurveTo( thisModel.cntrlPtA1.x, thisModel.cntrlPtA1.y, thisModel.cntrlPtA2.x, thisModel.cntrlPtA2.y, thisModel.vanishingPoint.x, thisModel.vanishingPoint.y );

      thisModel.axonBodyShape.moveTo( thisModel.vanishingPoint.x, thisModel.vanishingPoint.y );
      thisModel.axonBodyShape.cubicCurveTo( thisModel.cntrlPtB1.x,
        thisModel.cntrlPtB1.y, thisModel.cntrlPtB2.x, thisModel.cntrlPtB2.y, thisModel.intersectionPointB.x,
        thisModel.intersectionPointB.y );

      thisModel.axonBodyShape.lineTo( thisModel.intersectionPointA.x, thisModel.intersectionPointA.y );


    };

    createAxonBodyShape();//creates axonBodyShape and assigns to this model

    // Shape of the cross section of the membrane.	For now, and unless there
    // is some reason to do otherwise, the center of the cross section is
    // positioned at the origin.

    thisModel.crossSectionEllipseShape = new Shape().ellipse( 0, 0, NeuronConstants.DEFAULT_DIAMETER / 2, NeuronConstants.DEFAULT_DIAMETER / 2 );


  }

  return inherit( PropertySet, AxonMembrane, {
      /**
       * Step this model element forward in time by the specified delta.
       *
       * @param dt - delta time, in seconds.
       */
      stepInTime: function( dt ) {
        if ( this.travelingActionPotential ) {
          this.travelingActionPotential.stepInTime( dt );
        }
      },
      /**
       * Start an action potential that will travel down the length of the
       * membrane toward the transverse cross section.
       */
      initiateTravelingActionPotential: function() {
        var thisAxonMembrane = this;
        this.travelingActionPotential = new TravelingActionPotential( this );
        this.travelingActionPotential.crossSectionReachedProperty.lazyLink( function( reached ) {
          if ( reached ) {
            thisAxonMembrane.travelingActionPotentialReachedCrossSection = true;
          }
        } );

        this.travelingActionPotential.lingeringCompletedProperty.lazyLink( function( lingeringCompleted ) {
          if ( lingeringCompleted ) {
            thisAxonMembrane.removeTravelingActionPotential();
          }
        } );

        thisAxonMembrane.travelingActionPotentialStarted = true;
        thisAxonMembrane.travelingActionPotentialEnded = false;
        thisAxonMembrane.travelingActionPotentialReachedCrossSection=false;
        

      },

      /**
       * Remove the traveling action potential, either because it has reached
       * the cross section and is done existing, or for some other reason (such
       * as a reset or jump in the playback state).
       */
      removeTravelingActionPotential: function() {
        this.travelingActionPotentialStarted = false;
        this.travelingActionPotentialReachedCrossSection = false;
        this.travelingActionPotentialEnded = true;
        this.stimulusPulseInitiated = false;
        this.travelingActionPotential = null;

      },

      /**
       * Get the object that defines the current traveling action potential.
       * Returns null if no action potential is happening.
       */
      getTravelingActionPotential: function() {
        return this.travelingActionPotential;
      },

      getMembraneThickness: function() {
        return NeuronConstants.MEMBRANE_THICKNESS;
      },

      getCrossSectionDiameter: function() {
        return NeuronConstants.DEFAULT_DIAMETER;
      },

      getCrossSectionEllipseShape: function() {
        return new Shape().ellipse( this.crossSectionEllipseShape.x, this.crossSectionEllipseShape.y,
            this.crossSectionEllipseShape.bounds.getWidth() / 2, this.crossSectionEllipseShape.bounds.getHeight() / 2 );

      },
      reset: function() {
        if ( this.travelingActionPotential ) {
          // Force premature termination of the action potential.
          this.removeTravelingActionPotential();
        }
      },
      getCurveA: function() {
        return this.curveA;
      },
      getCurveB: function() {
        return this.curveB;
      },

      /**
       * Evaluate the curve in order to locate a point given a distance along
       * the curve.  This uses the DeCasteljau algorithm.
       *
       * @param curve - The Curve Shape that is being evaluated.
       * @param t - proportional distance along the curve from the first control point, must be from 0 to 1.
       * @return point corresponding to the location of the curve at the specified distance.
       *
       * This method was converted from static to instance to prevent  circularly dependency between Traveling Potential and AxonMembrane  (Ashraf)
       */
      evaluateCurve: function( curve, t ) {
        if ( t < 0 || t > 1 ) {
          throw new Error( "t is out of range: " + t );
        }
        var ab = this.linearInterpolation( curve.start, curve.control1, t );
        var bc = this.linearInterpolation( curve.control1, curve.control2, t );
        var cd = this.linearInterpolation( curve.control2, curve.end, t );
        var abbc = this.linearInterpolation( ab, bc, t );
        var bccd = this.linearInterpolation( bc, cd, t );

        return this.linearInterpolation( abbc, bccd, t );
      },

      /**
       * Simple linear interpolation between two points.
       * @param {Vector2} a
       * @param {Vector2} b
       */
      linearInterpolation: function( a, b, t ) {
        return ( new Vector2( a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t ));
      }
    }
  );

} );


//
//package edu.colorado.phet.neuron.model;
//
//import java.awt.Shape;
//import java.awt.geom.CubicCurve2D;
//import java.awt.geom.Ellipse2D;
//import java.awt.geom.GeneralPath;
//import java.awt.geom.Point2D;
//import java.util.ArrayList;
//
//import edu.colorado.phet.common.phetcommon.view.graphics.ReversePathIterator;
//import edu.colorado.phet.neuron.model.AxonMembrane.TravelingActionPotential.TravelingActionPotentialState;
//
//
///**
// * Model representation for the axon membrane.  Represents it as a cross
// * section and a shape that is intended to look like the body of the axon
// * receding into the distance.
// *
// * @author John Blanco
// */
//public class AxonMembrane {
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
//  private ArrayList<Listener> listeners = new ArrayList<Listener>();
//

//
//  // Shape of the body of the axon.
//  private Shape bodyShape;
//
//  // Traveling action potential that moves down the membrane.
//  private TravelingActionPotential travelingActionPotential;
//

//
//  //----------------------------------------------------------------------------
//  // Constructor
//  //----------------------------------------------------------------------------
//
//  public AxonMembrane() {
//    bodyShape = createAxonBodyShape();
//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------


//
//  public Shape getAxonBodyShape(){
//    return bodyShape;
//  }
//
//  public CubicCurve2D getCurveA(){
//    return curveA;
//  }
//
//  public CubicCurve2D getCurveB(){
//    return curveB;
//  }
//
//  public AxonMembraneState getState(){
//    if (travelingActionPotential == null){
//      return new AxonMembraneState(null);
//    }
//    else{
//      return new AxonMembraneState(travelingActionPotential.getState());
//    }
//  }
//
//  public void setState(AxonMembraneState axonMembraneState){
//    if (axonMembraneState.getTravelingActionPotentialState() == null && travelingActionPotential != null){
//      // Get rid of the existing TAP.
//      removeTravelingActionPotential();
//    }
//    else if (axonMembraneState.getTravelingActionPotentialState() != null && travelingActionPotential == null){
//      // A traveling action potential needs to be added.
//      initiateTravelingActionPotential();
//    }
//
//    if (travelingActionPotential != null){
//      // Set the state to match the new given state.
//      travelingActionPotential.setState(axonMembraneState.getTravelingActionPotentialState());
//    }
//  }
//
//  /**
//   * Create the shape of the axon body based on the size and position of the
//   * cross section and some other fixed parameters.  This is a 2D shape that
//   * is intended to look like a receding 3D shape when presented in the
//   * view, so its creation is a little unusual.
//   */
//  private Shape createAxonBodyShape(){

//  }
//

//
//  /**
//   * Start an action potential that will travel down the length of the
//   * membrane toward the transverse cross section.
//   */
//  public void initiateTravelingActionPotential(){
//    travelingActionPotential = new TravelingActionPotential(this);
//    travelingActionPotential.addListener(new TravelingActionPotential.Adapter(){
//      public void crossSectionReached() {
//        notifyTravelingActionPotentialReachedCrossSection();
//      }
//      public void lingeringCompleted() {
//        removeTravelingActionPotential();
//      }
//    });
//    notifyTravelingActionPotentialStarted();
//  }
//


//


//
//  public void addListener(Listener listener){
//    listeners.add(listener);
//  }
//
//  public void removeListener(Listener listener){
//    listeners.remove(listener);
//  }
//
//  private void notifyTravelingActionPotentialStarted(){
//    for (Listener listener : listeners){
//      listener.travelingActionPotentialStarted();
//    }
//  }
//
//  private void notifyTravelingActionPotentialReachedCrossSection(){
//    for (Listener listener : listeners){
//      listener.travelingActionPotentialReachedCrossSection();
//    }
//  }
//
//  private void notifyTravelingActionPotentialEnded(){
//    for (Listener listener : listeners){
//      listener.travelingActionPotentialEnded();
//    }
//  }
//
//  public class AxonMembraneState {
//    private final TravelingActionPotentialState travelingActionPotentialState;
//
//    public AxonMembraneState( TravelingActionPotentialState travelingActionPotentialState) {
//      this.travelingActionPotentialState = travelingActionPotentialState;
//    }
//
//    /**
//     * Return the state of the traveling action potential.  If null, no
//     * travling action potential exists.
//     * @return
//     */
//    protected TravelingActionPotentialState getTravelingActionPotentialState() {
//      return travelingActionPotentialState;
//    }
//
//  }
//
//  /**
//   * Interface for listening to notifications from the axon membrane.
//   *
//   */
//  public interface Listener {
//    void travelingActionPotentialStarted();
//    void travelingActionPotentialReachedCrossSection();
//    void travelingActionPotentialEnded();
//  }
//
//  public static class Adapter implements Listener {
//    public void travelingActionPotentialEnded() {}
//    public void travelingActionPotentialReachedCrossSection() {}
//    public void travelingActionPotentialStarted() {}
//  }
//

//  public static class TravelingActionPotential {
//

//
//    private ArrayList<Listener> listeners = new ArrayList<Listener>();
//    private double travelTimeCountdownTimer = TRAVELING_TIME;
//    private double lingerCountdownTimer;
//    private Shape shape;
//    private AxonMembrane axonMembrane;
//
//    public TravelingActionPotential(AxonMembrane axonMembrane){
//      this.axonMembrane = axonMembrane;
//      updateShape();
//    }
//

//
//    /**
//     * Set the state from a (probably previously captured) version of
//     * the interal state.
//     */
//    public void setState(TravelingActionPotentialState state){
//      this.travelTimeCountdownTimer = state.getTravelTimeCountdownTimer();
//      this.lingerCountdownTimer = state.getLingerCountdownTimer();
//      updateShape();
//    }
//
//    /**
//     * Get the state, generally for use in setting the state later for
//     * some sort of playback.
//     */
//    public TravelingActionPotentialState getState(){
//      return new TravelingActionPotentialState(travelTimeCountdownTimer, lingerCountdownTimer);
//    }
//
//    /**
//     * Update the shape as a function of the current value of the lifetime
//     * counter.
//     *
//     * NOTE: An attempt was made to generalize this so that it would work
//     * for pretty much any shape of the axon body, but this turned out to
//     * be a lot of work.  As a result, if significant changes are made to
//     * the axon body shape, this routine will need to be updated.
//     */
//    private void updateShape(){
//      if (travelTimeCountdownTimer > 0){
//        // Depict the traveling action potential as a curved line
//        // moving down the axon.  Start by calculating the start and
//        // end points.
//        double travelAmtFactor = 1 - travelTimeCountdownTimer / TRAVELING_TIME;
//        Point2D startPoint = AxonMembrane.evaluateCurve(axonMembrane.getCurveA(), travelAmtFactor);
//        Point2D endPoint = AxonMembrane.evaluateCurve(axonMembrane.getCurveB(), travelAmtFactor);
//        Point2D midPoint = new Point2D.Double((startPoint.getX() + endPoint.getX()) / 2, (startPoint.getY() + endPoint.getY()) / 2);
//        // The exponents used in the control point distances can be
//        // adjusted to make the top or bottom more or less curved as the
//        // potential moves down the membrane.
//        double ctrlPoint1Distance = endPoint.distance(startPoint) * 0.7 * Math.pow((travelAmtFactor), 1.8);
//        double ctrlPoint2Distance = endPoint.distance(startPoint) * 0.7 * Math.pow((travelAmtFactor), 0.8);
//        double perpendicularAngle = Math.atan2(endPoint.getY() - startPoint.getY(), endPoint.getX() - startPoint.getX()) + Math.PI / 2;
//        Point2D ctrlPoint1 = new Point2D.Double(
//            midPoint.getX() + ctrlPoint1Distance * Math.cos(perpendicularAngle + Math.PI / 6),
//            midPoint.getY() + ctrlPoint1Distance * Math.sin(perpendicularAngle + Math.PI / 6));
//        Point2D ctrlPoint2 = new Point2D.Double(
//            midPoint.getX() + ctrlPoint2Distance * Math.cos(perpendicularAngle - Math.PI / 6),
//            midPoint.getY() + ctrlPoint2Distance * Math.sin(perpendicularAngle - Math.PI / 6));
//        shape = new CubicCurve2D.Double(startPoint.getX(), startPoint.getY(), ctrlPoint1.getX(), ctrlPoint1.getY(), ctrlPoint2.getX(), ctrlPoint2.getY(), endPoint.getX(), endPoint.getY());
//      }
//      else{
//        // The action potential is "lingering" at the point of the
//        // cross section.  Define the shape as a circle that changes
//        // shape a bit. This is done when the action potential has
//        //essentially reached the point of the cross section.
//        Ellipse2D crossSectionEllipse = axonMembrane.getCrossSectionEllipseShape();
//        // Make the shape a little bigger than the cross section so
//        // that it can be seen behind it, and have it grow while it
//        // is there.
//        double growthFactor = (1 - Math.abs(lingerCountdownTimer / LINGER_AT_CROSS_SECTION_TIME - 0.5) * 2) * 0.04 + 1;
//        double newWidth = crossSectionEllipse.getWidth() * growthFactor;
//        double newHeight = crossSectionEllipse.getHeight() * growthFactor;
//        shape = new Ellipse2D.Double( -newWidth / 2, -newHeight / 2, newWidth, newHeight );
//      }
//      notifyShapeChanged();
//    }
//
//    public Shape getShape(){
//      return shape;
//    }
//
//    public void addListener(Listener listener){
//      listeners.add(listener);
//    }
//
//    public void removeListener(Listener listener){
//      listeners.remove(listener);
//    }
//
//    public void removeAllListeners(){
//      listeners.clear();
//    }
//
//    private void notifyLingeringCompleted(){
//      ArrayList<Listener> listenersCopy = new ArrayList<Listener>(listeners);
//      for (Listener listener : listenersCopy){
//        listener.lingeringCompleted();
//      }
//    }
//
//    private void notifyCrossSectionReached(){
//      ArrayList<Listener> listenersCopy = new ArrayList<Listener>(listeners);
//      for (Listener listener : listenersCopy){
//        listener.crossSectionReached();
//      }
//    }
//
//    private void notifyShapeChanged(){
//      ArrayList<Listener> listenersCopy = new ArrayList<Listener>(listeners);
//      for (Listener listener : listenersCopy){
//        listener.shapeChanged();
//      }
//    }
//
//    public interface Listener {
//
//      /**
//       * Notify the listener that the shape of this model element has
//       * changed.
//       */
//      void shapeChanged();
//
//      /**
//       * Notify the listener that the cross section has been reached.
//       */
//      void crossSectionReached();
//
//      /**
//       * Notify the listener that this has finished traveling down the
//       * membrane and lingering at the cross section.
//       */
//      void lingeringCompleted();
//    }
//
//    public static class Adapter implements Listener {
//      public void shapeChanged() {}
//      public void crossSectionReached() {}
//      public void lingeringCompleted() {}
//    }
//
//    public static class TravelingActionPotentialState {
//
//      private final double travelTimeCountdownTimer;
//      private final double lingerCountdownTimer;
//
//      public TravelingActionPotentialState(
//        double travelTimeCountdownTimer, double lingerCountdownTimer) {
//        this.travelTimeCountdownTimer = travelTimeCountdownTimer;
//        this.lingerCountdownTimer = lingerCountdownTimer;
//      }
//
//      protected double getLingerCountdownTimer() {
//        return lingerCountdownTimer;
//      }
//
//      protected double getTravelTimeCountdownTimer() {
//        return travelTimeCountdownTimer;
//      }
//    }
//  }
//}
