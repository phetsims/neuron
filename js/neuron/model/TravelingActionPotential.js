//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Class that defines the behavior of the action potential that travels
 * along the membrane before reaching the location of the transverse cross
 * section.  This is essentially just a shape that is intended to look
 * like something moving along the outer membrane.  The shape moves for a
 * while, then reaches the cross section, and then lingers there for a
 * bit.

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
  var TravelingActionPotentialState = require( 'NEURON/neuron/model/TravelingActionPotentialState' );


  var TRAVELING_TIME = 0.0020; // In seconds of sim time (not wall time).
  var LINGER_AT_CROSS_SECTION_TIME = 0.0005; // In seconds of sim time (not wall time).

  function TravelingActionPotential( axonMembrane ) {
    var thisPotential = this;
    thisPotential.axonMembrane = axonMembrane;
    PropertySet.call( thisPotential, {
        //Notify the listener that the shape of this model element has  changed.
        shapeChanged: false,

        //Notify the listener that the cross section has been reached.
        crossSectionReached: false,

        // Notify the listener that this has finished traveling down the
        //membrane and lingering at the cross section.
        lingeringCompleted: false}
    );

    this.travelTimeCountdownTimer = TRAVELING_TIME;
    this.lingerCountdownTimer = 0;
    this.shape = null;
    this.updateShape(); // Also create an initialize Shape

  }

  return inherit( PropertySet, TravelingActionPotential, {


    /**
     * Step this model component forward by the specified time.  This will
     * update the shape such that it will appear to move down the axon
     * membrane.
     *
     * @param dt
     */
    stepInTime: function( dt ) {
      if ( this.travelTimeCountdownTimer > 0 ) {
        this.travelTimeCountdownTimer -= dt;
        this.updateShape();
        if ( this.travelTimeCountdownTimer <= 0 ) {
          // We've reached the cross section and will now linger
          // there for a bit.
          this.crossSectionReachedProperty.set( true );
          this.lingerCountdownTimer = LINGER_AT_CROSS_SECTION_TIME;
        }
      }
      else if ( this.lingerCountdownTimer > 0 ) {
        this.lingerCountdownTimer -= dt;
        if ( this.lingerCountdownTimer <= 0 ) {
          this.shape = null;
          this.lingeringCompletedProperty.set( true );
        }
        else {
          this.updateShape();
        }
      }
    },

    /**
     * Update the shape as a function of the current value of the lifetime
     * counter.
     *
     * NOTE: An attempt was made to generalize this so that it would work
     * for pretty much any shape of the axon body, but this turned out to
     * be a lot of work.  As a result, if significant changes are made to
     * the axon body shape, this routine will need to be updated.
     */
    updateShape: function() {
      if ( this.travelTimeCountdownTimer > 0 ) {
        // Depict the traveling action potential as a curved line
        // moving down the axon.  Start by calculating the start and
        // end points.
        var travelAmtFactor = 1 - this.travelTimeCountdownTimer / TRAVELING_TIME;
        var startPoint = this.axonMembrane.evaluateCurve( this.axonMembrane.getCurveA(), travelAmtFactor );
        var endPoint = this.axonMembrane.evaluateCurve( this.axonMembrane.getCurveB(), travelAmtFactor );
        var midPoint = new Vector2( (startPoint.x + endPoint.x) / 2, (startPoint.y + endPoint.y) / 2 );
        // The exponents used in the control point distances can be
        // adjusted to make the top or bottom more or less curved as the
        // potential moves down the membrane.
        var ctrlPoint1Distance = endPoint.distance( startPoint ) * 0.7 * Math.pow( (travelAmtFactor), 1.8 );
        var ctrlPoint2Distance = endPoint.distance( startPoint ) * 0.7 * Math.pow( (travelAmtFactor), 0.8 );
        var perpendicularAngle = Math.atan2( endPoint.y - startPoint.y, endPoint.x - startPoint.x ) + Math.PI / 2;
        var ctrlPoint1 = new Vector2(
            midPoint.x + ctrlPoint1Distance * Math.cos( perpendicularAngle + Math.PI / 6 ),
            midPoint.y + ctrlPoint1Distance * Math.sin( perpendicularAngle + Math.PI / 6 ) );
        var ctrlPoint2 = new Vector2(
            midPoint.x + ctrlPoint2Distance * Math.cos( perpendicularAngle - Math.PI / 6 ),
            midPoint.y + ctrlPoint2Distance * Math.sin( perpendicularAngle - Math.PI / 6 ) );
        this.shape = new Shape();
        this.shape.moveTo( startPoint.x, startPoint.y );
        this.shape.cubicCurveTo( ctrlPoint1.x, ctrlPoint1.y, ctrlPoint2.x, ctrlPoint2.y, endPoint.x, endPoint.y );
      }
      else {
        // The action potential is "lingering" at the point of the
        // cross section.  Define the shape as a circle that changes
        // shape a bit. This is done when the action potential has
        //essentially reached the point of the cross section.
        var crossSectionEllipse = this.axonMembrane.getCrossSectionEllipseShape();
        // Make the shape a little bigger than the cross section so
        // that it can be seen behind it, and have it grow while it
        // is there.
        var growthFactor = (1 - Math.abs( this.lingerCountdownTimer / LINGER_AT_CROSS_SECTION_TIME - 0.5 ) * 2) * 0.04 + 1;
        var newWidth = crossSectionEllipse.bounds.getWidth() * growthFactor;
        var newHeight = crossSectionEllipse.bounds.getHeight() * growthFactor;
        this.shape = new Shape().circle( 0, 0, newWidth / 2, newHeight / 2 );
      }

      this.shapeChangedProperty.set( !this.shapeChangedProperty.get() );
    },
    getShape: function() {
      return this.shape;
    },
    /**
     * Set the state from a (probably previously captured) version of
     * the interal state.
     */
    setState: function( state ) {
      this.travelTimeCountdownTimer = state.getTravelTimeCountdownTimer();
      this.lingerCountdownTimer = state.getLingerCountdownTimer();
      this.updateShape();
    },

    /**
     * Get the state, generally for use in setting the state later for
     * some sort of playback.
     */
    getState: function() {
      return new TravelingActionPotentialState( this.travelTimeCountdownTimer, this.lingerCountdownTimer );
    }


  } );
} );