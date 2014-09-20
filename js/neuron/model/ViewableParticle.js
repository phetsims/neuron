// Copyright 2002-2011, University of Colorado

/**
 * Interface for a particle that can be viewed, i.e. displayed to the user.
 * @author John Blanco
 * @Sharfudeen Ashraf (for Ghnet University)
 */

define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  function ViewableParticle() {

  }

  return inherit( PropertySet, ViewableParticle, {

    //subclasses must implement
    getType: function() {
      throw new Error( 'getType should be implemented in descendant classes.' );
    },
    getPosition: function() {
      throw new Error( 'getPosition should be implemented in descendant classes.' );
    },
    getPositionReference: function() {
      throw new Error( 'getPositionReference should be implemented in descendant classes.' );
    },
    /**
     * Get the radius of this particle in nano meters.  This is approximate in
     * the case of non-round particles.
     */
    getRadius: function() {
      throw new Error( 'getRadius should be implemented in descendant classes.' );
    },
    /**
     * Get the base color to be used when representing this particle.
     */
    getRepresentationColor: function() {
      throw new Error( 'getRepresentationColor should be implemented in descendant classes.' );
    },
    getOpaqueness: function() {
      throw new Error( 'getOpaqueness should be implemented in descendant classes.' );
    }

  } );

} );
//
//// Copyright 2002-2011, University of Colorado

//package edu.colorado.phet.neuron.model;
//
//import java.awt.Color;
//import java.awt.geom.Point2D;
//
///**
// * Interface for a particle that can be viewed, i.e. displayed to the user.
// *
// * @author John Blanco
// */
//public interface IViewableParticle {
//
//  public abstract ParticleType getType();
//
//  public abstract Point2D getPosition();
//
//  public abstract Point2D getPositionReference();
//
//  public abstract double getOpaqueness();
//
//  /**
//   * This is called to remove this particle from the model.  It simply sends
//   * out a notification of removal, and all listeners (including the view)
//   * are expected to act appropriately and to remove all references.
//   */
//  public abstract void removeFromModel();
//
//  /**
//   * Get the radius of this particle in nano meters.  This is approximate in
//   * the case of non-round particles.
//   */
//  public abstract double getRadius();
//
//  /**
//   * Get the base color to be used when representing this particle.
//   */
//  abstract public Color getRepresentationColor();
//
//  public abstract void addListener( IParticleListener listener );
//
//  public abstract void removeListener( IParticleListener listener );
//
//}