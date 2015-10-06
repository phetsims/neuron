// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model representation of a membrane channel through which potassium 'leaks', meaning that it is always passing
 * through and there is no gating action.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var AbstractLeakChannel = require( 'NEURON/neuron/model/AbstractLeakChannel' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var PieSliceShapedCaptureZone = require( 'NEURON/neuron/model/PieSliceShapedCaptureZone' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var Color = require( 'SCENERY/util/Color' );
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );

  // constants
  var CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
  var CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.
  var BASE_COLOR = Color.interpolateRGBA( NeuronConstants.POTASSIUM_COLOR, new Color( 0, 200, 255 ), 0.6 );
  var DEFAULT_PARTICLE_VELOCITY = 5000; // In nanometers per sec of sim time.

  // constants that define the rate and variability of particle capture.
  var MIN_INTER_PARTICLE_CAPTURE_TIME = 0.002; // In seconds of sim time.
  var MAX_INTER_PARTICLE_CAPTURE_TIME = 0.004; // In seconds of sim time.

  /**
   * @param {NeuronModel} modelContainingParticles
   * @param {ModifiedHodgkinHuxleyModel} hodgkinHuxleyModel
   * @constructor
   */
  function PotassiumLeakageChannel( modelContainingParticles, hodgkinHuxleyModel ) {
    var thisChannel = this;
    AbstractLeakChannel.call( thisChannel, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );

    // Set the speed at which particles will move through the channel.
    thisChannel.setParticleVelocity( DEFAULT_PARTICLE_VELOCITY );

    // Set up the capture zones for this channel.
    thisChannel.setInteriorCaptureZone( new PieSliceShapedCaptureZone( thisChannel.getCenterLocation(), CHANNEL_WIDTH * 5, Math.PI, Math.PI * 0.5 ) );
    thisChannel.setExteriorCaptureZone( new PieSliceShapedCaptureZone( thisChannel.getCenterLocation(), CHANNEL_WIDTH * 5, 0, Math.PI * 0.5 ) );

    // Set the rate of particle capture for leakage.
    thisChannel.setMinInterCaptureTime( MIN_INTER_PARTICLE_CAPTURE_TIME );
    thisChannel.setMaxInterCaptureTime( MAX_INTER_PARTICLE_CAPTURE_TIME );

    thisChannel.channelColor = BASE_COLOR.colorUtilsDarker( 0.2 );
    // Start the capture timer now, since leak channels are always
    // capturing particles.
    thisChannel.restartCaptureCountdownTimer( false );
  }

  return inherit( AbstractLeakChannel, PotassiumLeakageChannel, {

    stepInTime: function( dt ) {
      var prevOpenness = this.openness;
      var prevInActivationAmt = this.inactivationAmt;
      AbstractLeakChannel.prototype.stepInTime.call( this, dt );
      this.notifyIfMembraneStateChanged( prevOpenness, prevInActivationAmt );
    },

    getChannelColor: function() {
      return this.channelColor;
    },

    getEdgeColor: function() {
      return BASE_COLOR;
    },

    getParticleTypeToCapture: function() {
      return ParticleType.POTASSIUM_ION;
    },

    getChannelType: function() {
      return MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL;
    },

    //  @Override
    chooseCrossingDirection: function() {
      // Generally, this channel leaks from in to out, since the
      // concentration of potassium is greater on the inside of the cell.
      // However, the IPHY people requested that there should occasionally
      // be some leakage in the other direction for greater realism, hence
      // the random choice below.
      var direction = MembraneCrossingDirection.IN_TO_OUT;
      if ( Math.random() < 0.2 ) {
        direction = MembraneCrossingDirection.OUT_TO_IN;
      }
      return direction;
    }

  } );

} );
