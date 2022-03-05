// Copyright 2014-2022, University of Colorado Boulder

/**
 * Class that defines a capture zone that contains nothing.  This is useful when wanting to avoid having to do a bunch
 * of null checks.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import { Shape } from '../../../../kite/js/imports.js';
import neuron from '../../neuron.js';
import CaptureZone from './CaptureZone.js';

class NullCaptureZone extends CaptureZone {

  constructor() {
    super( {} );
  }

  // @public
  getShape() {
    return new Shape().ellipse( 0, 0, 0, 0 );
  }

  // @public
  isPointInZone( x, y ) {
    return false;
  }

  // @public - assign a random point that is somewhere within the shape.
  assignNewParticlePosition( particle ) {
    particle.setPosition( 0, 0 );
  }

  // @public
  getOriginPoint() {
    return null;
  }

  // @public
  setRotationalAngle( angle ) {
    // necessary to override, but does nothing in this particular subclass
  }

  // @public
  setOriginPoint( centerPoint ) {
    // necessary to override, but does nothing in this particular subclass
  }
}

neuron.register( 'NullCaptureZone', NullCaptureZone );

export default NullCaptureZone;
