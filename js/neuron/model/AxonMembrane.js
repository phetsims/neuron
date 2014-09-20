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


  // Fixed membrane characteristics.
//public constants

  var BODY_LENGTH = NeuronConstants.DEFAULT_DIAMETER * 1.5;
  var BODY_TILT_ANGLE = Math.PI / 4;

  /*
   * @constructor
   */
  function AxonMembrane() {

    var thisModel = this;

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
      thisModel.curveA = new Shape()
        .moveTo( thisModel.vanishingPoint.x, thisModel.vanishingPoint.y )
        .cubicCurveTo( thisModel.cntrlPtA2.x, thisModel.cntrlPtA2.y, thisModel.cntrlPtA1.x, thisModel.cntrlPtA1.y, thisModel.intersectionPointA.x,
        thisModel.intersectionPointA.y );
      thisModel.curveB = new Shape()
        .moveTo( thisModel.vanishingPoint.x, thisModel.vanishingPoint.y )
        .cubicCurveTo( thisModel.cntrlPtB1.x,
        thisModel.cntrlPtB1.y, thisModel.cntrlPtB2.x, thisModel.cntrlPtB2.y, thisModel.intersectionPointB.x,
        thisModel.intersectionPointB.y );


      // Reverse Path Iteration for drawing
      thisModel.axonBodyShape.moveTo( thisModel.intersectionPointA.x,
        thisModel.intersectionPointA.y );
      thisModel.axonBodyShape.cubicCurveTo( thisModel.cntrlPtA1.x, thisModel.cntrlPtA1.y, thisModel.cntrlPtA2.x, thisModel.cntrlPtA2.y, thisModel.vanishingPoint.x, thisModel.vanishingPoint.y );

      _.each( thisModel.curveB.subpaths, function( subpath ) {
        thisModel.axonBodyShape.addSubpath( subpath );
      } );

      thisModel.axonBodyShape.lineTo( thisModel.intersectionPointA.x, thisModel.intersectionPointA.y );


    };

    createAxonBodyShape();//creates axonBodyShape and assigns to this model

    // Shape of the cross section of the membrane.	For now, and unless there
    // is some reason to do otherwise, the center of the cross section is
    // positioned at the origin.

    thisModel.crossSectionEllipseShape = new Shape().ellipse( 0, 0, NeuronConstants.DEFAULT_DIAMETER / 2, NeuronConstants.DEFAULT_DIAMETER / 2 );


  }

  return inherit( PropertySet, AxonMembrane, {
    step:function(dt){
      //TODO
    },
    getMembraneThickness: function() {
      return NeuronConstants.MEMBRANE_THICKNESS;
    },

    getCrossSectionDiameter: function() {
      return NeuronConstants.DEFAULT_DIAMETER;
    },

    getCrossSectionEllipseShape: function() {
      return new Shape().ellipse( this.crossSectionEllipseShape.x, this.crossSectionEllipseShape.y,
        this.crossSectionEllipseShape.bounds.getWidth(), this.crossSectionEllipseShape.bounds.getHeight() );
    },
    reset:function(){
     //TODO
    }
  } );

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
//  /**
//   * Evaluate the curve in order to locate a point given a distance along
//   * the curve.  This uses the DeCasteljau algorithm.
//   *
//   * @param curve - The CubicCurve2D that is being evaluated.
//   * @param t - proportional distance along the curve from the first control point, must be from 0 to 1.
//   * @return point corresponding to the location of the curve at the specified distance.
//   */
//  private static Point2D evaluateCurve(CubicCurve2D curve, double t){
//    if ( t < 0 || t > 1 ) {
//      throw new IllegalArgumentException( "t is out of range: " + t );
//    }
//    Point2D ab = linearInterpolation(curve.getP1(), curve.getCtrlP1(), t);
//    Point2D bc = linearInterpolation(curve.getCtrlP1(), curve.getCtrlP2(), t);
//    Point2D cd = linearInterpolation(curve.getCtrlP2(), curve.getP2(), t);
//    Point2D abbc = linearInterpolation(ab, bc, t);
//    Point2D bccd = linearInterpolation(bc, cd, t);
//
//    return linearInterpolation(abbc, bccd, t);
//  }
//
//  /**
//   * Simple linear interpolation between two points.
//   */
//  private static Point2D linearInterpolation(Point2D a, Point2D b, double t){
//    return ( new Point2D.Double( a.getX() + (b.getX() - a.getX()) * t,  a.getY() + (b.getY() - a.getY()) * t));
//  }
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
//  /**
//   * Remove the traveling action potential, either because it has reached
//   * the cross section and is done existing, or for some other reason (such
//   * as a reset or jump in the playback state).
//   */
//  private void removeTravelingActionPotential(){
//    travelingActionPotential.removeAllListeners();
//    travelingActionPotential = null;
//    notifyTravelingActionPotentialEnded();
//  }
//
//  /**
//   * Get the object that defines the current traveling action potential.
//   * Returns null if no action potential is happening.
//   */
//  public TravelingActionPotential getTravelingActionPotential(){
//    return travelingActionPotential;
//  }
//
//  public void reset(){
//    if (travelingActionPotential != null){
//      // Force premature termination of the action potential.
//      removeTravelingActionPotential();
//    }
//  }
//
//  /**
//   * Step this model element forward in time by the specified delta.
//   *
//   * @param dt - delta time, in seconds.
//   */
//  public void stepInTime(double dt){
//    if (travelingActionPotential != null){
//      travelingActionPotential.stepInTime(dt);
//    }
//  }
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
//  /**
//   * Class that defines the behavior of the action potential that travels
//   * along the membrane before reaching the location of the transverse cross
//   * section.  This is essentially just a shape that is intended to look
//   * like something moving along the outer membrane.  The shape moves for a
//   * while, then reaches the cross section, and then lingers there for a
//   * bit.
//   */
//  public static class TravelingActionPotential {
//
//    private static double TRAVELING_TIME = 0.0020; // In seconds of sim time (not wall time).
//    private static double LINGER_AT_CROSS_SECTION_TIME = 0.0005; // In seconds of sim time (not wall time).
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
//    /**
//     * Step this model component forward by the specified time.  This will
//     * update the shape such that it will appear to move down the axon
//     * membrane.
//     *
//     * @param dt
//     */
//    public void stepInTime(double dt){
//      if (travelTimeCountdownTimer > 0){
//        travelTimeCountdownTimer -= dt;
//        updateShape();
//        if (travelTimeCountdownTimer <= 0){
//          // We've reached the cross section and will now linger
//          // there for a bit.
//          notifyCrossSectionReached();
//          lingerCountdownTimer = LINGER_AT_CROSS_SECTION_TIME;
//        }
//      }
//      else if (lingerCountdownTimer > 0){
//        lingerCountdownTimer -= dt;
//        if (lingerCountdownTimer <= 0){
//          shape = null;
//          notifyLingeringCompleted();
//        }
//        else{
//          updateShape();
//        }
//      }
//    }
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
