// Copyright 2014-2015, University of Colorado Boulder

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
  var AbstractLeakChannel = require( 'NEURON/neuron/model/AbstractLeakChannel' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var neuron = require( 'NEURON/neuron' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var PieSliceShapedCaptureZone = require( 'NEURON/neuron/model/PieSliceShapedCaptureZone' );

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
    AbstractLeakChannel.call( this, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );

    // Set the speed at which particles will move through the channel.
    this.setParticleVelocity( DEFAULT_PARTICLE_VELOCITY );

    // Set up the capture zones for this channel.
    this.setInteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterLocation(), CHANNEL_WIDTH * 5, Math.PI, Math.PI * 0.5 ) );
    this.setExteriorCaptureZone( new PieSliceShapedCaptureZone( this.getCenterLocation(), CHANNEL_WIDTH * 5, 0, Math.PI * 0.5 ) );

    // Set the rate of particle capture for leakage.
    this.setMinInterCaptureTime( MIN_INTER_PARTICLE_CAPTURE_TIME );
    this.setMaxInterCaptureTime( MAX_INTER_PARTICLE_CAPTURE_TIME );

    this.channelColor = BASE_COLOR.colorUtilsDarker( 0.2 );

    // Start the capture timer now, since leak channels are always capturing particles.
    this.restartCaptureCountdownTimer( false );
  }

  neuron.register( 'PotassiumLeakageChannel', PotassiumLeakageChannel );

  return inherit( AbstractLeakChannel, PotassiumLeakageChannel, {

    // @public
    stepInTime: function( dt ) {
      var prevOpenness = this.openness;
      var prevInActivationAmt = this.inactivationAmount;
      AbstractLeakChannel.prototype.stepInTime.call( this, dt );
      this.notifyIfMembraneStateChanged( prevOpenness, prevInActivationAmt );
    },

    // @public
    getChannelColor: function() {
      return this.channelColor;
    },

    // @public
    getEdgeColor: function() {
      return BASE_COLOR;
    },

    // @public
    getParticleTypeToCapture: function() {
      return ParticleType.POTASSIUM_ION;
    },

    // @public
    getChannelType: function() {
      return MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL;
    },

    // @public, @override
    chooseCrossingDirection: function() {
      // Generally, this channel leaks from in to out, since the concentration of potassium is greater on the inside of
      // the cell. However, the IPHY people requested that there should occasionally be some leakage in the other
      // direction for greater realism, hence the random choice below.
      var direction = MembraneCrossingDirection.IN_TO_OUT;
      if ( Math.random() < 0.2 ) {
        direction = MembraneCrossingDirection.OUT_TO_IN;
      }
      return direction;
    }

  } );
} );
