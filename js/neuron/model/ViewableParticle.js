// Copyright 2014-2020, University of Colorado Boulder

/**
 * Interface for a particle that can be viewed, i.e. displayed to the user.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';

class ViewableParticle {

  constructor() {}

  // @public, subclasses must implement
  getType() {
    throw new Error( 'getType should be implemented in descendant classes.' );
  }

  // @public, subclasses must implement
  getPositionX() {
    throw new Error( 'getPositionX should be implemented in descendant classes.' );
  }

  // @public, subclasses must implement
  getPositionY() {
    throw new Error( 'getPositionY should be implemented in descendant classes.' );
  }

  /**
   * Get the radius of this particle in nano meters.  This is approximate in the case of non-round particles.
   * @public
   */
  getRadius() {
    throw new Error( 'getRadius should be implemented in descendant classes.' );
  }

  /**
   * Get the base color to be used when representing this particle.
   * @public
   */
  getRepresentationColor() {
    throw new Error( 'getRepresentationColor should be implemented in descendant classes.' );
  }

  // @public, subclasses must implement
  getOpacity() {
    throw new Error( 'getOpacity should be implemented in descendant classes.' );
  }
}

neuron.register( 'ViewableParticle', ViewableParticle );

export default ViewableParticle;