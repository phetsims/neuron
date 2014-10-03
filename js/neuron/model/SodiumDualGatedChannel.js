// Copyright 2002-2011, University of Colorado
/**
 * A gated channel through which sodium passes when the channel is open.  This
 * implementation has two different gates, which is apparently closer to real-
 * life voltage-gated sodium channels.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var GatedChannel = require( 'NEURON/neuron/model/GatedChannel' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var PieSliceShapedCaptureZone = require( 'NEURON/neuron/model/PieSliceShapedCaptureZone' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var DualGateChannelTraversalMotionStrategy = require( 'NEURON/neuron/model/DualGateChannelTraversalMotionStrategy' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var NeuronSharedConstants = require( 'NEURON/neuron/common/NeuronSharedConstants' );
  var MathUtils = require( 'NEURON/neuron/utils/MathUtils' );

  var CHANNEL_HEIGHT = NeuronConstants.MEMBRANE_THICKNESS * 1.2; // In nanometers.
  var CHANNEL_WIDTH = NeuronConstants.MEMBRANE_THICKNESS * 0.50; // In nanometers.

  //
  // Constant used when calculating how open this gate should be based on
  // a value that exists within the Hodgkin-Huxley model.  This was
  // empirically determined.
  var M3H_WHEN_FULLY_OPEN = 0.25;

  // Possible values for internal state.
  var GateState = Object.freeze( {
    IDLE: 'IDLE', OPENING: 'OPENING', BECOMING_INACTIVE: 'BECOMING_INACTIVE', INACTIVATED: 'INACTIVATED', RESETTING: 'RESETTING'
  } );

  var RAND = {nextDouble: function() {
    return Math.random();
  }};


  // Values used for deciding on state transitions.  These were empirically
  // determined.
  var ACTIVATION_DECISION_THRESHOLD = 0.002;
  var FULLY_INACTIVE_DECISION_THRESHOLD = 0.98;

  // Values used for timed state transitions.
  var INACTIVE_TO_RESETTING_TIME = 0.001; // In seconds of sim time.
  var RESETTING_TO_IDLE_TIME = 0.001; // In seconds of sim time.

// Constants that control the rate at which this channel will capture ions
// when it is open.  Smaller numbers here will increase the capture rate
// and thus make the flow appear to be faster.
  var MIN_INTER_CAPTURE_TIME = 0.00002; // In seconds of sim time.
  var MAX_INTER_CAPTURE_TIME = 0.00010; // In seconds of sim time.

  // Delay range - used to make the timing of the instances of this gate
  // vary a little bit in terms of when they open and close.
  var MAX_STAGGER_DELAY = NeuronSharedConstants.MIN_ACTION_POTENTIAL_CLOCK_DT * 5; // In seconds of sim time.


  /**
   * @param  channelWidth
   * @param {ParticleCapture} modelContainingParticles
   * @param {IHodgkinHuxleyModel}hodgkinHuxleyModel
   * @constructor
   */
  function SodiumDualGatedChannel( modelContainingParticles, hodgkinHuxleyModel ) {
    var thisChannel = this;
    GatedChannel.call( thisChannel, CHANNEL_WIDTH, CHANNEL_HEIGHT, modelContainingParticles );
    thisChannel.gateState = GateState.IDLE;
    thisChannel.hodgkinHuxleyModel = hodgkinHuxleyModel;
    thisChannel.stateTransitionTimer = 0;
    thisChannel.staggerDelay = 0;
    this.previousNormalizedConductance = 0;
    thisChannel.setExteriorCaptureZone( new PieSliceShapedCaptureZone( thisChannel.getCenterLocation(), CHANNEL_WIDTH * 5, 0, Math.PI * 0.7 ) );
    thisChannel.reset();

  }

  return inherit( GatedChannel, SodiumDualGatedChannel, {


    stepInTime: function( dt ) {
      var prevCenterLocation = this.centerLocation.copy();
      var prevOpenness = this.openness;
      var prevInActivationAmt = this.inactivationAmt;
      GatedChannel.prototype.stepInTime.call( this, dt );
      // Get the conductance and normalize it from 0 to 1.
      var normalizedConductance = this.calculateNormalizedConductance();

      if ( normalizedConductance >= 0 && normalizedConductance <= 1 ) {
        // Trim off some digits to limit very small changes.
        normalizedConductance = MathUtils.round( normalizedConductance, 4 );
      }
      else {
        // This shouldn't happen, debug it if it does.
        console.log( "Sodium Dual  Channel Normalized conductance out of range, = " + normalizedConductance );
        assert && assert( false );
      }

      // Update the state.
      switch( this.gateState ) {
        case GateState.IDLE:
          if ( normalizedConductance > ACTIVATION_DECISION_THRESHOLD ) {
            // We are opening, change to the appropriate state.
            this.setOpenness( this.mapOpennessToNormalizedConductance( normalizedConductance ) );
            this.gateState = GateState.OPENING;
          }
          break;

        case GateState.OPENING:
          if ( this.isOpen() && this.getCaptureCountdownTimer() === Number.POSITIVE_INFINITY ) {
            // We are open enough to start capturing particles.
            this.restartCaptureCountdownTimer( true );
          }
          if ( this.previousNormalizedConductance > normalizedConductance ) {
            // We are on the way down, so set a new state.
            this.gateState = GateState.BECOMING_INACTIVE;
            // Should be fully open at this point.
            this.setOpenness( 1 );
          }
          else {
            // Set the openness based on the normalized conductance value.
            // Note the non-linear mapping.  This was done to make them
            // appear to be fully open earlier in the action potential,
            // which was requested by the IPHY folks.
            this.setOpenness( this.mapOpennessToNormalizedConductance( normalizedConductance ) );
          }
          break;

        case GateState.BECOMING_INACTIVE:
          if ( this.getInactivationAmt() < FULLY_INACTIVE_DECISION_THRESHOLD ) {
            // Not yet fully inactive - update the level.  Note the non-
            // linear mapping to the conductance amount.
            this.setInactivationAmt( 1 - Math.pow( normalizedConductance, 7 ) );
          }
          else {
            // Fully inactive, move to next state.
            this.setInactivationAmt( 1 );
            this.gateState = GateState.INACTIVATED;
            this.stateTransitionTimer = INACTIVE_TO_RESETTING_TIME;
          }
          break;

        case GateState.INACTIVATED:
          this.stateTransitionTimer -= dt;
          if ( this.stateTransitionTimer < 0 ) {
            // Time to start resetting.
            this.gateState = GateState.RESETTING;
            this.stateTransitionTimer = RESETTING_TO_IDLE_TIME;
          }
          break;

        case GateState.RESETTING:
          this.stateTransitionTimer -= dt;
          if ( this.stateTransitionTimer >= 0 ) {
            // Move the values of openness and activation back towards
            // their idle (i.e. resting) states.  The mapping of the
            // inactivation amount as a function of time is very non-
            // linear.  This is because the IPHY people requested that
            // the "little ball doesn't pop out" until the the gate has
            // closed up.
            this.setOpenness( 1 - Math.pow( this.stateTransitionTimer / RESETTING_TO_IDLE_TIME - 1, 10 ) );
            this.setInactivationAmt( 1 - Math.pow( this.stateTransitionTimer / RESETTING_TO_IDLE_TIME - 1, 20 ) );
          }
          else {
            // Go back to the idle, or resting, state.
            this.setOpenness( 0 );
            this.setInactivationAmt( 0 );
            this.updateStaggerDelay();
            this.gateState = GateState.IDLE;
          }
          break;
      }

      // Save values for the next time through.
      this.previousNormalizedConductance = normalizedConductance;

      this.notifyIfMembraneStateChanged( prevCenterLocation, prevOpenness, prevInActivationAmt );
    },

    //@Override
    reset: function() {
      GatedChannel.prototype.reset.call( this );

      // Set up the capture time range, which will be used to control the
      // rate of particle capture when this gate is open.
      this.setMinInterCaptureTime( MIN_INTER_CAPTURE_TIME );
      this.setMaxInterCaptureTime( MAX_INTER_CAPTURE_TIME );

      // Initialize some internal state.
      this.gateState = GateState.IDLE;
      this.stateTransitionTimer = 0;
      if ( this.hodgkinHuxleyModel ) {
        this.previousNormalizedConductance = this.calculateNormalizedConductance();
      }

      // Initialize the stagger delay.
      this.updateStaggerDelay();
    },

    getChannelColor: function() {
      return NeuronConstants.SODIUM_COLOR.colorUtilsDarker( 0.2 );
    },
    getEdgeColor: function() {
      return NeuronConstants.SODIUM_COLOR;
    },
    getParticleTypeToCapture: function() {
      return ParticleType.SODIUM_ION;
    },
    updateStaggerDelay: function() {
      this.staggerDelay = RAND.nextDouble() * MAX_STAGGER_DELAY;
    },
    //@Override
    chooseCrossingDirection: function() {
      return MembraneCrossingDirection.OUT_TO_IN;
    },

    //@Override This membrane channel has an inactivation gate.
    getHasInactivationGate: function() {
      return true;
    },
    //@Override
    moveParticleThroughNeuronMembrane: function( particle, maxVelocity ) {
      particle.setMotionStrategy( new DualGateChannelTraversalMotionStrategy( this, particle.getPositionReference() ) );
    },

    mapOpennessToNormalizedConductance: function( normalizedConductance ) {
      assert && assert( normalizedConductance >= 0 && normalizedConductance <= 1 );
      return 1 - Math.pow( normalizedConductance - 1, 20 );
    },
    calculateNormalizedConductance: function() {
      return  Math.min( Math.abs( this.hodgkinHuxleyModel.get_delayed_m3h( this.staggerDelay ) ) / M3H_WHEN_FULLY_OPEN, 1 );

    }

  } );

} );
//
//package edu.colorado.phet.neuron.model;
//
//import java.awt.Color;
//import java.awt.Dimension;
//import java.awt.Point;
//import java.awt.event.ActionEvent;
//import java.awt.event.ActionListener;
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//
//import javax.swing.JButton;
//import javax.swing.JFrame;
//
//import edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockEvent;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock;
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform2D;
//import edu.colorado.phet.common.phetcommon.view.util.ColorUtils;
//import edu.colorado.phet.common.piccolophet.PhetPCanvas;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.colorado.phet.neuron.NeuronConstants;
//import edu.colorado.phet.neuron.module.NeuronDefaults;
//import edu.colorado.phet.neuron.utils.MathUtils;
//import edu.colorado.phet.neuron.view.MembraneChannelNode;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolox.pswing.PSwing;
//

//public class SodiumDualGatedChannel extends GatedChannel {
//
//  //----------------------------------------------------------------------------
//  // Class Data
//  //----------------------------------------------------------------------------
//


//  //----------------------------------------------------------------------------
//  // Instance Data
//  //----------------------------------------------------------------------------
//
//  private IHodgkinHuxleyModel hodgkinHuxleyModel;
//  private GateState gateState = GateState.IDLE;
//  private double previousNormalizedConductance;
//  private double stateTransitionTimer = 0;
//  private double staggerDelay;
//
//  //----------------------------------------------------------------------------
//  // Constructor
//  //----------------------------------------------------------------------------
//
//  public SodiumDualGatedChannel(IParticleCapture modelContainingParticles, IHodgkinHuxleyModel hodgkinHuxleyModel) {
//

//  }
//
//  public SodiumDualGatedChannel(){
//    this(null, null);
//  }
//
//  //----------------------------------------------------------------------------
//  // Methods
//  //----------------------------------------------------------------------------

//
//  @Override
//  public void stepInTime(double dt) {
//

//  }
//


//
//  //----------------------------------------------------------------------------
//  // Test Harness
//  //----------------------------------------------------------------------------
//
//  // For testing, can be removed with main routine when it goes.
//  private static final int INITIAL_INTERMEDIATE_COORD_WIDTH = 786;
//  private static final int INITIAL_INTERMEDIATE_COORD_HEIGHT = 786;
//  private static final Dimension INITIAL_INTERMEDIATE_DIMENSION = new Dimension( INITIAL_INTERMEDIATE_COORD_WIDTH,
//    INITIAL_INTERMEDIATE_COORD_HEIGHT );
//
//
//  /**
//   * Test harness.
//   *
//   * @param args
//   */
//  public static void main(String[] args) {
//
//    ConstantDtClock clock = new ConstantDtClock( NeuronDefaults.CLOCK_FRAME_RATE, NeuronDefaults.DEFAULT_ACTION_POTENTIAL_CLOCK_DT );
//
//    // Set up the model-canvas transform.
//    ModelViewTransform2D mvt = new ModelViewTransform2D(
//      new Point2D.Double(0, 0),
//      new Point(INITIAL_INTERMEDIATE_COORD_WIDTH / 2,
//        (int)Math.round(INITIAL_INTERMEDIATE_COORD_HEIGHT * 0.5 )),
//    20,  // Scale factor - smaller numbers "zoom out", bigger ones "zoom in".
//      true);
//
//    // Create the canvas.
//    PhetPCanvas canvas = new PhetPCanvas();
//    canvas.setWorldTransformStrategy(new PhetPCanvas.CenteringBoxStrategy(canvas, INITIAL_INTERMEDIATE_DIMENSION));
//    canvas.setBackground( NeuronConstants.CANVAS_BACKGROUND );
//
//    // Create a non-transformed test node.
//    PNode nonMvtTestNode = new PhetPPath(new Rectangle2D.Double(0, 0, 100, 100), Color.yellow);
//
//    // Create the channel node.
//    IParticleCapture particleCapture = new IParticleCapture() {
//      public void requestParticleThroughChannel(ParticleType particleType,
//        MembraneChannel membraneChannel, double maxVelocity, MembraneCrossingDirection direction) {
//        // Do nothing.
//      }
//    };
//    final IHodgkinHuxleyModel hhModel = new ModifiedHodgkinHuxleyModel();
//    final SodiumDualGatedChannel sodiumDualGatedChannel = new SodiumDualGatedChannel(particleCapture, hhModel);
//    sodiumDualGatedChannel.setRotationalAngle(Math.PI / 2);
//    MembraneChannelNode channelNode = new MembraneChannelNode(sodiumDualGatedChannel, mvt);
//
//    // Add node(s) to the canvas.
//    canvas.addWorldChild(nonMvtTestNode);
//    canvas.addWorldChild(channelNode);
//
//    // Create and add a node for initiating a stimulation.
//    JButton stimButton = new JButton("Stimulate");
//    stimButton.addActionListener(new ActionListener() {
//
//      public void actionPerformed(ActionEvent e) {
//        hhModel.stimulate();
//      }
//    });
//    PSwing stimButtonPSwing = new PSwing(stimButton);
//    stimButtonPSwing.setOffset(20, 0);
//    canvas.addScreenChild(stimButtonPSwing);
//
//    // Create the frame and put the canvas in it.
//    JFrame frame = new JFrame();
//    frame.setSize(INITIAL_INTERMEDIATE_DIMENSION);
//    frame.setDefaultCloseOperation( JFrame.EXIT_ON_CLOSE );
//    frame.setContentPane(canvas);
//    frame.setVisible(true);
//
//    // Put the channel through its paces.
//    clock.addClockListener(new ClockAdapter(){
//      public void clockTicked( ClockEvent clockEvent ) {
//        hhModel.stepInTime(clockEvent.getSimulationTimeChange());
//        sodiumDualGatedChannel.stepInTime(clockEvent.getSimulationTimeChange());
//      }
//    });
//
//    clock.start();
//  }
//
//  private void updateStaggerDelay(){
//    staggerDelay = RAND.nextDouble() * MAX_STAGGER_DELAY;
//  }
//
//  @Override
//  protected MembraneCrossingDirection chooseCrossingDirection() {
//    return MembraneCrossingDirection.OUT_TO_IN;
//  }
//}
