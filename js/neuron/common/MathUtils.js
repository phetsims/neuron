// Copyright 2014-2020, University of Colorado Boulder

/**
 * A utility class, contains methods to do certain math operations without creating new Vector2 instances
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import neuron from '../../neuron.js';

// These vectors are used as temporary objects for calculating distance without creating new Vector2 instances, see
// the createTraversalPoint method.
const distanceCalculatorVectorLHS = new Vector2( 0, 0 );
const distanceCalculatorVectorRHS = new Vector2( 0, 0 );

const MathUtils = {

  /**
   * A method to calculate distance by reusing vector instances. This method is created to reduce Vector2 instance
   * allocation during distance calculation.
   * @param {number} posX
   * @param {number} posY
   * @param {number} otherPosX
   * @param {number} otherPosY
   * @returns {number}
   * @public
   */
  distanceBetween( posX, posY, otherPosX, otherPosY ) {
    distanceCalculatorVectorLHS.x = posX;
    distanceCalculatorVectorLHS.y = posY;
    distanceCalculatorVectorRHS.x = otherPosX;
    distanceCalculatorVectorRHS.y = otherPosY;
    return distanceCalculatorVectorLHS.distance( distanceCalculatorVectorRHS );
  },

  /**
   * Rounds to a specific number of places
   * @param {number} val
   * @param {number} places
   * @returns {number}
   * @public
   */
  round( val, places ) {
    const factor = Math.pow( 10, places );

    // Shift the decimal the correct number of places
    // to the right.
    val = val * factor;

    // Round to the nearest integer.
    const tmp = Utils.roundSymmetric( val );

    // Shift the decimal the correct number of places
    // back to the left.
    return tmp / factor;
  }
};

neuron.register( 'MathUtils', MathUtils );

export default MathUtils;