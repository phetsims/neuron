// Copyright 2014-2021, University of Colorado Boulder

/**
 * Base type representing a Mode in Record and PlayBack Model. The mode can be either playback, record or live.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';

class Mode {

  constructor() {}

  // @public
  step( simulationTimeChange ) {
    throw new Error( 'step should be implemented in descendant classes.' );
  }

  // @public
  toString() {
    throw new Error( 'toString should be implemented in descendant classes.' );
  }
}

neuron.register( 'Mode', Mode );

export default Mode;