// Copyright 2014-2019, University of Colorado Boulder

/**
 * Class that defines a capture zone that contains nothing.  This is useful when wanting to avoid having to do a bunch
 * of null checks.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Shape from '../../../../kite/js/Shape.js';
import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';
import CaptureZone from './CaptureZone.js';

/**
 * @constructor
 */
function NullCaptureZone() {
  CaptureZone.call( this, {} );
}

neuron.register( 'NullCaptureZone', NullCaptureZone );

export default inherit( CaptureZone, NullCaptureZone, {

  // @public
  getShape: function() {
    return new Shape().ellipse( 0, 0, 0, 0 );
  },

  // @public
  isPointInZone: function( x, y ) {
    return false;
  },

  // @public - assign a random point that is somewhere within the shape.
  assignNewParticleLocation: function( particle ) {
    particle.setPosition( 0, 0 );
  },

  // @public
  getOriginPoint: function() {
    return null;
  },

  // @public
  setRotationalAngle: function( angle ) {
    // necessary to override, but does nothing in this particular subclass
  },

  // @public
  setOriginPoint: function( centerPoint ) {
    // necessary to override, but does nothing in this particular subclass
  }

} );