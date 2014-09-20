//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A class for reporting the closest particle to the origin in a capture
 * zone and the total number of particles in the zone.
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  function CaptureZoneScanResult( closestParticle, numParticlesInZone ) {
    this.closestFreeParticle = closestParticle;
    this.numParticlesInZone = numParticlesInZone;
  }

  CaptureZoneScanResult.prototype = {
    getClosestFreeParticle: function() {
      return this.closestFreeParticle;
    },
    getNumParticlesInZone: function() {
      return this.numParticlesInZone;
    }
  };
  return CaptureZoneScanResult;
} );