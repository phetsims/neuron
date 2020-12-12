// Copyright 2014-2020, University of Colorado Boulder
/**
 * Abstract base class for "Capture Zones", which are essentially two dimensional spaces where particles can be
 * captured.
 *
 *@author John Blanco
 *@author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';

class CaptureZone {

  constructor() {
    // does nothing in abstract base class
  }

  // @public
  isPointInZone( x, y ) {
    throw new Error( 'isPointInZone should be implemented in descendant classes.' );
  }

  // @public, assign a random point that is somewhere within the shape.
  assignNewParticlePosition( particle ) {
    particle.setPosition( 0, 0 );
  }

  // @public
  getOriginPoint() {
    throw new Error( 'getOriginPoint should be implemented in descendant classes.' );
  }

  // @public
  setRotationalAngle( angle ) {
    throw new Error( 'setRotationalAngle should be implemented in descendant classes.' );
  }

  // @public
  setOriginPoint( centerPoint ) {
    throw new Error( 'setOriginPoint should be implemented in descendant classes.' );
  }
}

neuron.register( 'CaptureZone', CaptureZone );

export default CaptureZone;
