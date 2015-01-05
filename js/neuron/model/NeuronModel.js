//  Copyright 2002-2014, University of Colorado Boulder
/**
 * Model for the 'Neuron' screen. This class represents the main class for modeling the axon.  It acts as the central
 * location where the interaction between the membrane, the particles (i.e. ions), and the gates is all governed.
 *
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var AxonMembrane = require( 'NEURON/neuron/model/AxonMembrane' );
  var Shape = require( 'KITE/Shape' );
  var ModifiedHodgkinHuxleyModel = require( 'NEURON/neuron/model/ModifiedHodgkinHuxleyModel' );
  var RecordAndPlaybackModel = require( 'NEURON/neuron/recordandplayback/RecordAndPlaybackModel' );
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );
  var NeuronModelState = require( 'NEURON/neuron/model/NeuronModelState' );
  var ParticlePosition = require( 'NEURON/neuron/model/ParticlePosition' );
  var ParticleFactory = require( 'NEURON/neuron/model/ParticleFactory' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var PlaybackParticle = require( 'NEURON/neuron/model/PlaybackParticle' );
  var MembraneChannelFactory = require( 'NEURON/neuron/model/MembraneChannelFactory' );
  var SodiumDualGatedChannel = require( 'NEURON/neuron/model/SodiumDualGatedChannel' );
  var SlowBrownianMotionStrategy = require( 'NEURON/neuron/model/SlowBrownianMotionStrategy' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var TimedFadeInStrategy = require( 'NEURON/neuron/model/TimedFadeInStrategy' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var MathUtils = require( 'NEURON/neuron/utils/MathUtils' );

  // Default configuration values.
  var DEFAULT_FOR_SHOW_ALL_IONS = true;
  var DEFAULT_FOR_MEMBRANE_CHART_VISIBILITY = false;
  var DEFAULT_FOR_CHARGES_SHOWN = false;
  var DEFAULT_FOR_CONCENTRATION_READOUT_SHOWN = false;

  // The following constants define the boundaries for the motion of the
  // particles.  These boundaries are intended to be outside the view port,
  // so that it is not apparent to the user that they exist.  We may at some
  // point want to make these bounds dynamic and set by the view so that the
  // user never encounters a situation where these can be seen.
  var MODEL_HEIGHT = 130; // In nanometers.
  var MODEL_WIDTH = 180; // In nanometers.
  var PARTICLE_BOUNDS = new Shape.rect( -MODEL_WIDTH / 2, -MODEL_HEIGHT / 2, MODEL_WIDTH, MODEL_HEIGHT );

  // Numbers of the various types of channels that are present on the
  // membrane.
  var NUM_GATED_SODIUM_CHANNELS = 20;
  var NUM_GATED_POTASSIUM_CHANNELS = 20;
  var NUM_SODIUM_LEAK_CHANNELS = 3;
  var NUM_POTASSIUM_LEAK_CHANNELS = 7;

  // Nominal concentration values.
  var NOMINAL_SODIUM_EXTERIOR_CONCENTRATION = 145;     // In millimolar (mM)
  var NOMINAL_SODIUM_INTERIOR_CONCENTRATION = 10;      // In millimolar (mM)
  var NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION = 4;    // In millimolar (mM)
  var NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION = 140;  // In millimolar (mM)

  // Numbers of "bulk" ions in and out of the cell when visible.
  var NUM_SODIUM_IONS_OUTSIDE_CELL = 600;
  var NUM_SODIUM_IONS_INSIDE_CELL = 8;
  var NUM_POTASSIUM_IONS_OUTSIDE_CELL = 60;
  var NUM_POTASSIUM_IONS_INSIDE_CELL = 200;

  // Delay between the values in the HH model to the concentration readouts.
  // This is needed to make sure that the concentration readouts don't
  // change before visible potassium or sodium ions have crossed the
  //membrane.
  var CONCENTRATION_READOUT_DELAY = 0.001;  // In seconds of sim time.


  // Thresholds for determining whether an action potential should be
  // considered to be in progress.  These values relate to the rate of flow
  // through the gated sodium, gated potassium, and combination of the
  // sodium and potassium leakage.  If the values from the HH model exceed
  // any of these, and action potential is considered to be in progress.
  // The values were determined empirically, and different HH models may
  // require different values here.
  var POTASSIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL = 0.001;
  var SODIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL = 0.001;
  var LEAKAGE_CURRENT_THRESH_FOR_ACTION_POTENTIAL = 0.444;


  // Rates at which concentration changes during action potential.  These
  // values combined with the conductance at each time step are used to
  // calculate the concentration changes.
  var INTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM = 0.4;
  var EXTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM = 7;
  var INTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM = 2.0;
  var EXTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM = 0.05;

  // Threshold of significant difference for concentration values.
  var CONCENTRATION_DIFF_THRESHOLD = 0.000001;

  // Rate at which concentration is restored to nominal value.  Higher value
  // means quicker restoration.
  var CONCENTRATION_RESTORATION_FACTOR = 1000;

  // Value that controls how much of a change of the membrane potential must
  // occur before a notification is sent out.
  var MEMBRANE_POTENTIAL_CHANGE_THRESHOLD = 0.005;

  // Default values of opaqueness for newly created particles.
  var FOREGROUND_PARTICLE_DEFAULT_OPAQUENESS = 0.25;
  var BACKGROUND_PARTICLE_DEFAULT_OPAQUENESS = 0.10;// default alpha in Java was 0.05, which isn't visible in the canvas so slightly increasing to 0.10


  /**
   * Main constructor for NeuronModel, which contains much of the model logic for the sim.
   * @constructor
   */
  function NeuronModel() {
    var thisModel = this;
    var maxRecordPoints = Math.ceil( NeuronConstants.TIME_SPAN * 1000 / NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT );
    thisModel.axonMembrane = new AxonMembrane();

    // List of the particles that come and go when the simulation is working in real time.
    thisModel.transientParticles = new ObservableArray();

    // Backup of the transient particles, used to restore them when returning
    // to live mode after doing playback.
    thisModel.transientParticlesBackup = new ObservableArray();

    // Particles that are "in the background", meaning that they are always
    // present and they don't cross the membrane.
    thisModel.backgroundParticles = new ObservableArray();

    // List of particles that are shown during playback.
    thisModel.playbackParticles = new ObservableArray();

    thisModel.membraneChannels = new ObservableArray();
    thisModel.hodgkinHuxleyModel = new ModifiedHodgkinHuxleyModel();

    thisModel.crossSectionInnerRadius = (thisModel.axonMembrane.getCrossSectionDiameter() - thisModel.axonMembrane.getMembraneThickness()) / 2;
    thisModel.crossSectionOuterRadius = (thisModel.axonMembrane.getCrossSectionDiameter() + thisModel.axonMembrane.getMembraneThickness()) / 2;


    thisModel.sodiumInteriorConcentration = NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
    thisModel.sodiumExteriorConcentration = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION;
    thisModel.potassiumInteriorConcentration = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION;
    thisModel.potassiumExteriorConcentration = NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;


    RecordAndPlaybackModel.call( thisModel, maxRecordPoints, {

      // Notification Property that the setting for the visibility of the membrane
      //potential chart has changed.
      potentialChartVisible: DEFAULT_FOR_MEMBRANE_CHART_VISIBILITY,
      // Controls whether all ions, or just those near membrane, are simulated.
      // the boolean value that indicates whether all ions are shown in the
      // simulation, or just those that are moving across the membrane.
      allIonsSimulated: DEFAULT_FOR_SHOW_ALL_IONS,
      // Controls whether charges are depicted.
      chargesShown: DEFAULT_FOR_CHARGES_SHOWN,
      // Controls whether concentration readings are depicted.
      concentrationReadoutVisible: DEFAULT_FOR_CONCENTRATION_READOUT_SHOWN,
      membranePotential: 0,
      // Notification Property that the state of stimulation lockout, which prevents
      // stimuli from being initiated too close together, has changed.
      stimulusLockout: false,
      playbackParticlesVisible: false,
      concentrationChanged: false,
      stimulusPulseInitiated: false,// observed by Membrane potential chart
      neuronModelPlaybackState: null,
      particlesStateChanged: false, // to trigger canvas invalidation
      channelRepresentationChanged: false, // A change in any one of channel representation triggers a paint call

      // Allow Step Back/forward only if the user has initiated a StimulusPulse atleast once. Stepping back
      // without initiating a stimulus results in the accumulation of negative delta time
      // values in DelayBuffer which causes undesired behaviour.
      // see https://github.com/phetsims/neuron/issues/26
      allowStepNavigation: false
    } );


    // Listen to the membrane for events that indicate that a traveling
    // action potential has arrived at the location of the transverse
    // cross section.
    thisModel.axonMembrane.travelingActionPotentialReachedCrossSectionProperty.lazyLink( function( reached ) {
      // The action potential has arrived, so stimulate the model
      // the simulates the action potential voltages and current
      // flows.
      if ( reached ) {
        thisModel.hodgkinHuxleyModel.stimulate();
      }

    } );

    function addInitialChannels() {
      // Add the initial channels.  The pattern is intended to be such that
      // the potassium and sodium gated channels are right next to each
      // other, with occasional leak channels interspersed.  There should
      // be one or more of each type of channel on the top of the membrane
      // so when the user zooms in, they can see all types.
      var angle = Math.PI * 0.45;
      var totalNumChannels = NUM_GATED_SODIUM_CHANNELS + NUM_GATED_POTASSIUM_CHANNELS + NUM_SODIUM_LEAK_CHANNELS +
                             NUM_POTASSIUM_LEAK_CHANNELS;
      var angleIncrement = Math.PI * 2 / totalNumChannels;
      var gatedSodiumChansAdded = 0;
      var gatedPotassiumChansAdded = 0;
      var sodiumLeakChansAdded = 0;
      var potassiumLeakChansAdded = 0;

      // Add some of each type so that they are visible at the top portion
      // of the membrane.
      if ( NUM_SODIUM_LEAK_CHANNELS > 0 ) {
        thisModel.addChannel( MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL, angle );
        sodiumLeakChansAdded++;
        angle += angleIncrement;
      }
      if ( NUM_GATED_POTASSIUM_CHANNELS > 0 ) {
        thisModel.addChannel( MembraneChannelTypes.POTASSIUM_GATED_CHANNEL, angle );
        gatedPotassiumChansAdded++;
        angle += angleIncrement;
      }
      if ( NUM_GATED_SODIUM_CHANNELS > 0 ) {
        thisModel.addChannel( MembraneChannelTypes.SODIUM_GATED_CHANNEL, angle );
        gatedSodiumChansAdded++;
        angle += angleIncrement;
      }
      if ( NUM_POTASSIUM_LEAK_CHANNELS > 0 ) {
        thisModel.addChannel( MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL, angle );
        potassiumLeakChansAdded++;
        angle += angleIncrement;
      }

      // Now loop through the rest of the membrane's circumference adding
      // the various types of gates.
      for ( var i = 0; i < totalNumChannels - 4; i++ ) {
        // Calculate the "urgency" for each type of gate.
        var gatedSodiumUrgency = NUM_GATED_SODIUM_CHANNELS / gatedSodiumChansAdded;
        var gatedPotassiumUrgency = NUM_GATED_POTASSIUM_CHANNELS / gatedPotassiumChansAdded;
        var potassiumLeakUrgency = NUM_POTASSIUM_LEAK_CHANNELS / potassiumLeakChansAdded;
        var sodiumLeakUrgency = NUM_SODIUM_LEAK_CHANNELS / sodiumLeakChansAdded;
        var channelTypeToAdd = null;
        if ( gatedSodiumUrgency >= gatedPotassiumUrgency && gatedSodiumUrgency >= potassiumLeakUrgency && gatedSodiumUrgency >= sodiumLeakUrgency ) {
          // Add a gated sodium channel.
          channelTypeToAdd = MembraneChannelTypes.SODIUM_GATED_CHANNEL;
          gatedSodiumChansAdded++;
        }
        else if ( gatedPotassiumUrgency > gatedSodiumUrgency && gatedPotassiumUrgency >= potassiumLeakUrgency && gatedPotassiumUrgency >= sodiumLeakUrgency ) {
          // Add a gated potassium channel.
          channelTypeToAdd = MembraneChannelTypes.POTASSIUM_GATED_CHANNEL;
          gatedPotassiumChansAdded++;
        }
        else if ( potassiumLeakUrgency > gatedSodiumUrgency && potassiumLeakUrgency > gatedPotassiumUrgency && potassiumLeakUrgency >= sodiumLeakUrgency ) {
          // Add a potassium leak channel.
          channelTypeToAdd = MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL;
          potassiumLeakChansAdded++;
        }
        else if ( sodiumLeakUrgency > gatedSodiumUrgency && sodiumLeakUrgency > gatedPotassiumUrgency && sodiumLeakUrgency > potassiumLeakUrgency ) {
          // Add a sodium leak channel.
          channelTypeToAdd = MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL;
          sodiumLeakChansAdded++;
        }
        else {
          assert && assert( false ); // Should never get here, so debug if it does.
        }

        thisModel.addChannel( channelTypeToAdd, angle );
        angle += angleIncrement;
      }
    }

    addInitialChannels();
    // Note: It is expected that the model will be reset once it has been
    // created, and this will set the initial state, including adding the
    // particles to the model.

    thisModel.timeProperty.link( thisModel.updateRecordPlayBack.bind( this ) );
    thisModel.modeProperty.link( thisModel.updateRecordPlayBack.bind( this ) );


    thisModel.stimulusPulseInitiatedProperty.link( function( stimulusPulseInitiated ) {
      if ( stimulusPulseInitiated ) {
        thisModel.startRecording();
        thisModel.allowStepNavigation = true;
      }
    } );


    this.reset(); // This does initialization
  }

  return inherit( RecordAndPlaybackModel, NeuronModel, {

    // dispatched from NeuronClockModelAdapter's step function
    step: function( simulationTimeChange ) {
      if ( simulationTimeChange < 0 && this.getPlaybackSpeed() > 0 ) {
        // This is a step backwards in time but the record-and-playback
        // model is not set up for backstepping, so set it up for
        // backwards stepping.
        this.setPlayback( -1 );  // The -1 indicates playing in reverse.
        if ( this.getTime() > this.getMaxRecordedTime() ) {
          this.setTime( this.getMaxRecordedTime() );
        }
      }
      else if ( this.getPlaybackSpeed() < 0 && simulationTimeChange > 0 && this.isPlayback() ) {
        // This is a step forward in time but the record-and-playback
        // model is set up for backwards stepping, so straighten it out.
        this.setPlayback( 1 );
      }

      RecordAndPlaybackModel.prototype.step.call( this, simulationTimeChange );

      // If we are currently in playback mode and we have reached the end of
      // the recorded data, we should automatically switch to record mode.
      if ( this.isPlayback() && this.getTime() >= this.getMaxRecordedTime() ) {
        this.setModeRecord();
        this.setPaused( false );
      }

    },

    // Called by the active RecordAndPlayback Model mode
    // see the RecordAndPlayBackModel step function
    stepInTime: function( dt ) {
      // Step the membrane in time.  This is done prior to stepping the
      // HH model because the traveling action potential is part of the
      // membrane, so if it reaches the cross section in this time step the
      // membrane potential will be modified.
      this.axonMembrane.stepInTime( dt );

      // This is a step forward in time.  Update the value of the
      // membrane potential by stepping the Hodgkins-Huxley model.
      this.hodgkinHuxleyModel.stepInTime( dt );

      // There is a bit of a threshold on sending out notifications of
      // membrane voltage changes, since otherwise the natural "noise" in
      // the model causes notifications to be sent out continuously.
      if ( Math.abs( this.membranePotential - this.hodgkinHuxleyModel.getMembraneVoltage() ) > MEMBRANE_POTENTIAL_CHANGE_THRESHOLD ) {
        this.membranePotential = this.hodgkinHuxleyModel.getMembraneVoltage();

      }

      // Update the stimulus lockout state.
      this.updateStimulusLockoutState();

      // Step the channels.
      this.membraneChannels.forEach( function( channel ) {
        channel.stepInTime( dt );
      } );

      this.transientParticles.forEach( function( particle ) {
        particle.stepInTime( dt );
      } );

      // Step the background particles, which causes them to exhibit a
      // little Brownian motion
      this.backgroundParticles.forEach( function( particle ) {
        particle.stepInTime( dt );
      } );


      if ( this.concentrationReadoutVisible ) {
        // Adjust the overall potassium and sodium concentration levels based
        // parameters of the HH model.  This is done solely to provide values
        // that can be displayed to the user, and are not used for anything
        // else in the model.
        var concentrationChanged = this.concentrationChanged = false;
        var difference;
        var potassiumConductance = this.hodgkinHuxleyModel.get_delayed_n4( CONCENTRATION_READOUT_DELAY );
        if ( potassiumConductance !== 0 ) {
          // Potassium is moving out of the cell as part of the process of
          // an action potential, so adjust the interior and exterior
          // concentration values.
          this.potassiumExteriorConcentration += potassiumConductance * dt * EXTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM;
          this.potassiumInteriorConcentration -= potassiumConductance * dt * INTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM;
          concentrationChanged = true;
        }
        else {
          if ( this.potassiumExteriorConcentration !== NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION ) {
            difference = Math.abs( this.potassiumExteriorConcentration - NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION );
            if ( difference < CONCENTRATION_DIFF_THRESHOLD ) {
              // Close enough to consider it fully restored.
              this.potassiumExteriorConcentration = NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;
            }
            else {
              // Move closer to the nominal value.
              this.potassiumExteriorConcentration -= difference * CONCENTRATION_RESTORATION_FACTOR * dt;
            }
            concentrationChanged = true;
          }
          if ( this.potassiumInteriorConcentration !== NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION ) {
            difference = Math.abs( this.potassiumInteriorConcentration - NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION );
            if ( difference < CONCENTRATION_DIFF_THRESHOLD ) {
              // Close enough to consider it fully restored.
              this.potassiumInteriorConcentration = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION;
            }
            else {
              // Move closer to the nominal value.
              this.potassiumInteriorConcentration += difference * CONCENTRATION_RESTORATION_FACTOR * dt;
            }
            concentrationChanged = true;
          }
        }
        var sodiumConductance = this.hodgkinHuxleyModel.get_delayed_m3h( CONCENTRATION_READOUT_DELAY );
        if ( this.hodgkinHuxleyModel.get_m3h() !== 0 ) {
          // Sodium is moving in to the cell as part of the process of an
          // action potential, so adjust the interior and exterior
          // concentration values.
          this.sodiumExteriorConcentration -= sodiumConductance * dt * EXTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM;
          this.sodiumInteriorConcentration += sodiumConductance * dt * INTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM;
          concentrationChanged = true;
        }
        else {
          if ( this.sodiumExteriorConcentration !== NOMINAL_SODIUM_EXTERIOR_CONCENTRATION ) {
            difference = Math.abs( this.sodiumExteriorConcentration - NOMINAL_SODIUM_EXTERIOR_CONCENTRATION );
            if ( difference < CONCENTRATION_DIFF_THRESHOLD ) {
              // Close enough to consider it fully restored.
              this.sodiumExteriorConcentration = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION;
            }
            else {
              // Move closer to the nominal value.
              this.sodiumExteriorConcentration += difference * CONCENTRATION_RESTORATION_FACTOR * dt;
            }
            concentrationChanged = true;
          }
          if ( this.sodiumInteriorConcentration !== NOMINAL_SODIUM_INTERIOR_CONCENTRATION ) {
            difference = Math.abs( this.sodiumInteriorConcentration - NOMINAL_SODIUM_INTERIOR_CONCENTRATION );
            if ( difference < CONCENTRATION_DIFF_THRESHOLD ) {
              // Close enough to consider it fully restored.
              this.sodiumInteriorConcentration = NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
            }
            else {
              // Move closer to the nominal value.
              this.sodiumInteriorConcentration -= difference * CONCENTRATION_RESTORATION_FACTOR * dt;
            }
            concentrationChanged = true;
          }
        }
        if ( concentrationChanged ) {
          this.concentrationChanged = true;
        }

      }


      //invert the value and trigger change event
      this.particlesStateChangedProperty.set( !this.particlesStateChangedProperty.get() );

      //If any one channel's state is changed, trigger a channel representation changed event
      this.channelRepresentationChanged = false;
      this.channelRepresentationChanged = _.any( this.membraneChannels.getArray(), 'channelStateChanged' );

      // Return model state after each time step.
      return this.getState();

    },
    // Listen to the record-and-playback model for events that affect the
    // state of the sim model.
    updateRecordPlayBack: function() {
      this.updateStimulusLockoutState();
      this.updateSimAndPlaybackParticleVisibility();
    },

    reset: function() {

      // Reset the superclass, which contains the recording state & data.
      RecordAndPlaybackModel.prototype.resetAll.call( this );

      // Reset the axon membrane.
      this.axonMembrane.reset();

      // Remove all existing particles.
      this.removeAllParticles();


      // Reset all membrane channels.
      this.membraneChannels.forEach( function( membraneChannel ) {
        membraneChannel.reset();
      } );

      // Reset the HH model.
      this.hodgkinHuxleyModel.reset();

      // Reset the concentration readout values.
      var concentrationChanged = this.concentrationChanged = false;
      if ( this.sodiumExteriorConcentration !== NOMINAL_SODIUM_EXTERIOR_CONCENTRATION ) {
        this.sodiumExteriorConcentration = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION;
        concentrationChanged = true;
      }
      if ( this.sodiumInteriorConcentration !== NOMINAL_SODIUM_INTERIOR_CONCENTRATION ) {
        this.sodiumInteriorConcentration = NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
        concentrationChanged = true;
      }
      if ( this.potassiumExteriorConcentration !== NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION ) {
        this.potassiumExteriorConcentration = NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;
        concentrationChanged = true;
      }
      if ( this.potassiumInteriorConcentration !== NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION ) {
        this.potassiumInteriorConcentration = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION;
        concentrationChanged = true;
      }
      if ( concentrationChanged ) {

        this.concentrationChangedProperty.set( true ); // Trigger concentrationReadout change
      }

      // Reset the stimulation lockout.
      this.setStimulusLockout( false );

      // Set the membrane chart to its initial state.
      this.setPotentialChartVisible( DEFAULT_FOR_MEMBRANE_CHART_VISIBILITY );

      // Set the concentration readout visibility to its initial state.
      this.setConcentrationReadoutVisible( DEFAULT_FOR_CONCENTRATION_READOUT_SHOWN );

      // Set the visibility of the charge symbols to its initial state.
      this.setChargesShown( DEFAULT_FOR_CHARGES_SHOWN );

      // Set the boolean that controls whether all ions are simulated to its
      // original state.
      this.setAllIonsSimulated( DEFAULT_FOR_SHOW_ALL_IONS );

      // Set the state of the record-and-playback model to be "live"
      // (neither recording nor playing) and unpaused.
      this.clearHistory();
      this.setModeLive();
      this.setPaused( false );
      this.allowStepNavigation = false;
    },

    /**
     * Starts a particle of the specified type moving through the
     * specified channel.  If one or more particles of the needed type exist
     * within the capture zone for this channel, one will be chosen and set to
     * move through, and another will be created to essentially take its place
     * (though the newly created one will probably be in a slightly different
     * place for better visual effect).  If none of the needed particles
     * exist, two will be created, and one will move through the channel and
     * the other will just hang out in the zone.
     *
     * Note that it is not guaranteed that the particle will make it through
     * the channel, since it is possible that the channel could close before
     * the particle goes through it.
     *
     * @param particleType
     * @param {MembraneChannel}channel
     * @param maxVelocity
     * @param direction
     * @return
     */
    requestParticleThroughChannel: function( particleType, channel, maxVelocity, direction ) {
      var captureZone;
      if ( direction === MembraneCrossingDirection.IN_TO_OUT ) {
        captureZone = channel.getInteriorCaptureZone();
      }
      else {
        captureZone = channel.getExteriorCaptureZone();
      }

      var particleToCapture = this.createTransientParticle( particleType, captureZone );

      // Make the particle fade in.
      particleToCapture.setFadeStrategy( new TimedFadeInStrategy( 0.0005 ) );

      // Set a motion strategy that will cause this particle to move across
      // the membrane.
      channel.moveParticleThroughNeuronMembrane( particleToCapture, maxVelocity );
    },


    /**
     * Return a value indicating whether simulation of all ions is currently
     * turned on in the simulation.  And yes, it would be more grammatically
     * correct to set "areAllIonsSimulated", but we are sticking with the
     * convention for boolean variables.  So get over it.
     */
    isAllIonsSimulated: function() {
      return this.allIonsSimulated;
    },
    /**
     * Set the boolean value that indicates whether all ions are shown in the
     * simulation, or just those that are moving across the membrane.
     *
     * @param allIonsSimulated
     */
    setAllIonsSimulated: function( allIonsSimulated ) {

      // This can only be changed when the stimulus initiation is not locked
      // out.  Otherwise, particles would come and go during an action
      // potential, which would be hard to handle and potentially confusing.
      if ( !this.isStimulusInitiationLockedOut() ) {


        if ( this.allIonsSimulated ) {
          // Add the bulk particles.
          this.addInitialBulkParticles();
        }
        else {
          // Remove all particles.
          this.removeAllParticles();
        }

      }
    },
    /**
     * Add the "bulk particles", which are particles that are inside and
     * outside of the membrane and, except in cases where they happen to end
     * up positioned close to the membrane, they generally stay where
     * initially positioned.
     */
    addInitialBulkParticles: function() {
      var thisModel = this;
      // Make a list of pre-existing particles.
      var preExistingParticles = _.clone( thisModel.transientParticles.getArray() );

      // Add the initial particles.
      thisModel.addBackgroundParticles( ParticleType.SODIUM_ION, ParticlePosition.INSIDE_MEMBRANE, NUM_SODIUM_IONS_INSIDE_CELL );
      thisModel.addBackgroundParticles( ParticleType.SODIUM_ION, ParticlePosition.OUTSIDE_MEMBRANE, NUM_SODIUM_IONS_OUTSIDE_CELL );
      thisModel.addBackgroundParticles( ParticleType.POTASSIUM_ION, ParticlePosition.INSIDE_MEMBRANE, NUM_POTASSIUM_IONS_INSIDE_CELL );
      thisModel.addBackgroundParticles( ParticleType.POTASSIUM_ION, ParticlePosition.OUTSIDE_MEMBRANE, NUM_POTASSIUM_IONS_OUTSIDE_CELL );

      // Look at each sodium gate and, if there are no ions in its capture
      // zone, add some.
      thisModel.membraneChannels.forEach( function( membraneChannel ) {
        if ( membraneChannel instanceof SodiumDualGatedChannel ) {
          var captureZone = membraneChannel.getExteriorCaptureZone();
          var numParticlesInZone = thisModel.scanCaptureZoneForFreeParticles( captureZone, ParticleType.SODIUM_ION );
          if ( numParticlesInZone === 0 ) {
            thisModel.addBackgroundParticlesToZone( ParticleType.SODIUM_ION, captureZone, Math.floor( Math.random() * 2 ) + 1 );
          }
        }
      } );

      // Set all new particles to exhibit simple Brownian motion.
      thisModel.backgroundParticles.forEach( function( backgroundParticle ) {
        if ( preExistingParticles.indexOf( backgroundParticle ) === -1 ) {
          backgroundParticle.setMotionStrategy( new SlowBrownianMotionStrategy( backgroundParticle.getPositionX(), backgroundParticle.getPositionY() ) );
        }
      } );

    },

    /**
     * Create a particle of the specified type in the specified capture zone.
     * In general, this method will be used when a particle is or may soon be
     * needed to travel through a membrane channel.
     *
     * @param particleType
     * @param captureZone
     * @return
     */
    createTransientParticle: function( particleType, captureZone ) {
      var newParticle = ParticleFactory.createParticle( particleType );
      this.transientParticles.add( newParticle );
      if ( captureZone ) {

        //To avoid creation of new Vector instances the capture zone updates the particles position
        captureZone.assignNewParticleLocation( newParticle );

      }
      var thisModel = this;
      newParticle.continueExistingProperty.lazyLink( function( newValue ) {
        if ( !newValue ) {
          thisModel.transientParticles.remove( newParticle );
        }
      } );

      return newParticle;
    },

    /**
     * Add the specified particles to the model.
     *
     * @param {ParticleType}particleType
     * @param {ParticlePosition}position
     * @param numberToAdd
     */
    addBackgroundParticles: function( particleType, position, numberToAdd ) {
      var newParticle = null;
      var thisModel = this;
      _.times( numberToAdd, function( value ) {
        newParticle = thisModel.createBackgroundParticle( particleType );
        if ( position === ParticlePosition.INSIDE_MEMBRANE ) {
          thisModel.positionParticleInsideMembrane( newParticle );
        }
        else {
          thisModel.positionParticleOutsideMembrane( newParticle );
        }
        // Set the opaqueness.
        if ( Math.random() >= 0.5 ) { // replaced for nextBoolean
          newParticle.setOpaqueness( FOREGROUND_PARTICLE_DEFAULT_OPAQUENESS );
        }
        else {
          newParticle.setOpaqueness( BACKGROUND_PARTICLE_DEFAULT_OPAQUENESS );
        }
      } );
    },


    /**
     * Add the specified particles to the given capture zone.
     *
     * @param particleType
     * @param captureZone
     * @param numberToAdd
     */
    addBackgroundParticlesToZone: function( particleType, captureZone, numberToAdd ) {
      var newParticle = null;
      for ( var i = 0; i < numberToAdd; i++ ) {
        newParticle = this.createBackgroundParticle( particleType );
        newParticle.setOpaqueness( FOREGROUND_PARTICLE_DEFAULT_OPAQUENESS );
        captureZone.assignNewParticleLocation( newParticle );

      }
    },


    getParticleMotionBounds: function() {
      return PARTICLE_BOUNDS;
    },

    initiateStimulusPulse: function() {
      if ( !this.isStimulusInitiationLockedOut() ) {
        this.stimulusPulseInitiated = true;
        this.axonMembrane.initiateTravelingActionPotential();
        this.updateStimulusLockoutState();
      }
    },

    /**
     * Place a particle at a random location inside the axon membrane.
     */
    positionParticleInsideMembrane: function( particle ) {
      // Choose any angle.
      var angle = Math.random() * Math.PI * 2;

      // Choose a distance from the cell center that is within the membrane.
      // The multiplier value is created with the intention of weighting the
      // positions toward the outside in order to get an even distribution
      // per unit area.
      var multiplier = Math.max( Math.random(), Math.random() );
      var distance = (this.crossSectionInnerRadius - particle.getRadius() * 2) * multiplier;

      particle.setPosition( distance * Math.cos( angle ), distance * Math.sin( angle ) );
    },

    /**
     * Returns a boolean values indicating whether or not an action potential
     * is in progress.  For the purposes of this sim, this means whether there
     * is an AP traveling down the membrane or if the flow of ions through the
     * channels at the transverse cross section is enough to be considered
     * part of an AP.
     */
    isActionPotentialInProgress: function() {

      return this.axonMembrane.getTravelingActionPotential() ||
             Math.abs( this.hodgkinHuxleyModel.get_k_current() ) > POTASSIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL ||
             Math.abs( this.hodgkinHuxleyModel.get_na_current() ) > SODIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL ||
             Math.abs( this.hodgkinHuxleyModel.get_l_current() ) > LEAKAGE_CURRENT_THRESH_FOR_ACTION_POTENTIAL;
    },

    /**
     * Place a particle at a random location outside the axon membrane.
     */
    positionParticleOutsideMembrane: function( particle ) {
      // Choose any angle.
      var angle = Math.random() * Math.PI * 2;

      // Choose a distance from the cell center that is outside of the
      // membrane. The multiplier value is created with the intention of
      // weighting the positions toward the outside in order to get an even
      // distribution per unit area.
      var multiplier = Math.random();
      var distance = this.crossSectionOuterRadius + particle.getRadius() * 4 +
                     multiplier * this.crossSectionOuterRadius * 2.2;

      particle.setPosition( distance * Math.cos( angle ), distance * Math.sin( angle ) );
    },

    /**
     * Scan the supplied capture zone for particles of the specified type.
     *
     * @param {CaptureZone} zone
     * @param {ParticleType} particleType
     * @return {number}
     */
    scanCaptureZoneForFreeParticles: function( zone, particleType ) {
      var thisModel = this;
      var closestFreeParticle = null;
      var distanceOfClosestParticle = Number.POSITIVE_INFINITY;
      var totalNumberOfParticles = 0;
      var captureZoneOrigin = zone.getOriginPoint();

      thisModel.transientParticles.forEach( function( particle ) {

        //This method is refactored to use position x,y components instead of vector2 instances
        if ( (particle.getType() === particleType) && (particle.isAvailableForCapture()) && (zone.isPointInZone( particle.getPositionX(), particle.getPositionY() )) ) {
          totalNumberOfParticles++;
          if ( closestFreeParticle === null ) {
            closestFreeParticle = particle;
            distanceOfClosestParticle = MathUtils.distanceBetween( captureZoneOrigin.x, captureZoneOrigin.y, closestFreeParticle.getPositionX(), closestFreeParticle.getPositionY() );
          }
          else if ( MathUtils.distanceBetween( captureZoneOrigin.x, captureZoneOrigin.y, closestFreeParticle.getPositionX(), closestFreeParticle.getPositionY() ) < distanceOfClosestParticle ) {
            closestFreeParticle = particle;
            distanceOfClosestParticle = MathUtils.distanceBetween( captureZoneOrigin.x, captureZoneOrigin.y, closestFreeParticle.getPositionX(), closestFreeParticle.getPositionY() );
          }
        }
      } );


      return totalNumberOfParticles;
    },

    updateStimulusLockoutState: function() {
      if ( this.stimulusLockout ) {
        // Currently locked out, see if that should change.
        if ( !this.isPlayback() && !this.isActionPotentialInProgress() ) {
          this.setStimulusLockout( false );
        }
      }
      else {
        // Currently NOT locked out, see if that should change.
        var backwards = this.getTime() - this.getMaxRecordedTime() <= 0;


        if ( this.isActionPotentialInProgress() || (this.isPlayback() && backwards) ) {
          this.setStimulusLockout( true );
        }
      }
    },

    /**
     * There are two sets of particles in this simulation, one that is used
     * when actually simulating, and one that is used when playing back.  This
     * routine updates which set is visible based on state information.
     */
    updateSimAndPlaybackParticleVisibility: function() {
      if ( this.isRecord() || this.isLive() ) {
        // In either of these modes, the simulation particles (as opposed
        // to the playback particles) should be visible.  Make sure that
        // this is the case.
        if ( this.playbackParticlesVisible ) {
          // Hide the playback particles.  This is done by removing them  from the model.
          this.playbackParticles.clear();

          // Show the simulation particles.
          this.transientParticles.addAll( this.transientParticlesBackup.getArray().slice() );
          this.transientParticlesBackup.clear();
          // Update the state variable.
          this.playbackParticlesVisible = false;
        }
      }
      else if ( this.isPlayback() ) {
        // The playback particles should be showing and the simulation
        // particles should be hidden.  Make sure that this is the case.
        if ( !this.playbackParticlesVisible ) {
          // Hide the simulation particles.  This is done by making a
          // backup copy of them (so that they can be added back later)
          // and then removing them from the model.
          this.transientParticlesBackup.addAll( this.transientParticles.getArray().slice() );
          this.transientParticles.clear();

          // Note that we don't explicitly add the playback particles
          // here.  That is taken care of when the playback state is
          // set.  Here we only set the flag.
          this.playbackParticlesVisible = true;
        }

        //Particles are rendered using Canvas, invert the state change  and trigger the paint event
        // see ParticlesNode
        this.particlesStateChangedProperty.set( !this.particlesStateChangedProperty.get() );
      }
      else {
        // Should never happen, debug if it does.
        assert && assert( "Neuron Model updateSimAndPlaybackParticleVisibility Error: Unrecognized record-and-playback mode." );
      }
    },
    /**
     * Get the state of this model.  This is generally used in support of the
     * record-and-playback feature, and the return value contains just enough
     * state information to support this feature.
     */
    getState: function() {
      return new NeuronModelState( this );
    },

    getAxonMembrane: function() {
      return this.axonMembrane;
    },

    getSodiumInteriorConcentration: function() {
      if ( this.isPlayback() ) {
        return this.neuronModelPlaybackState.getSodiumInteriorConcentration();
      }
      else {
        return this.sodiumInteriorConcentration;
      }
    },

    getSodiumExteriorConcentration: function() {
      if ( this.isPlayback() ) {
        return this.neuronModelPlaybackState.getSodiumExteriorConcentration();
      }
      else {
        return this.sodiumExteriorConcentration;
      }
    },

    getPotassiumInteriorConcentration: function() {
      if ( this.isPlayback() ) {
        return this.neuronModelPlaybackState.getPotassiumInteriorConcentration();
      }
      else {
        return this.potassiumInteriorConcentration;
      }
    },

    getPotassiumExteriorConcentration: function() {
      if ( this.isPlayback() ) {
        return this.neuronModelPlaybackState.getPotassiumExteriorConcentration();
      }
      else {
        return this.potassiumExteriorConcentration;
      }
    },


    /**
     * Create a particle of the specified type and add it to the model.
     *
     * @param particleType
     * @return
     */
    createBackgroundParticle: function( particleType ) {

      var newParticle = ParticleFactory.createParticle( particleType );
      this.backgroundParticles.add( newParticle );
      var self = this;
      newParticle.continueExistingProperty.lazyLink( function( newValue ) {
        if ( newValue === false ) {
          self.backgroundParticles.remove( newParticle );
        }
      } );

      return newParticle;
    },

    removeAllParticles: function() {
      this.transientParticles.clear();
      this.backgroundParticles.clear();
    },

    /**
     * Add the provided channel at the specified rotational location.
     * Locations are specified in terms of where on the circle of the membrane
     * they are, with a value of 0 being on the far right, PI/2 on the top,
     * PI on the far left, etc.
     * @param {MembraneChannelTypes}membraneChannelType
     * @param angle
     */
    addChannel: function( membraneChannelType, angle ) {
      var membraneChannel = MembraneChannelFactory.createMembraneChannel( membraneChannelType, this, this.hodgkinHuxleyModel );

      var radius = this.axonMembrane.getCrossSectionDiameter() / 2;
      var newLocation = new Vector2( radius * Math.cos( angle ), radius * Math.sin( angle ) );

      // Position the channel on the membrane.
      membraneChannel.setRotationalAngle( angle );
      membraneChannel.setCenterLocation( newLocation );

      // Add the channel and let everyone know it exists.
      this.membraneChannels.push( membraneChannel );

    },
    /**
     * Get a boolean value that indicates whether the initiation of a new
     * stimulus (i.e. action potential) is currently locked out.  This is done
     * to prevent the situation where multiple action potentials are moving
     * down the membrane at the same time.
     *
     * @return
     */
    isStimulusInitiationLockedOut: function() {
      return this.stimulusLockout;
    },
    setPotentialChartVisible: function( isVisible ) {
      this.potentialChartVisibleProperty.set( isVisible );
    },
    isConcentrationReadoutVisible: function() {
      return this.concentrationReadoutVisible;
    },

    setConcentrationReadoutVisible: function( isVisible ) {
      this.concentrationReadoutVisibleProperty.set( isVisible );
    },
    isChargesShown: function() {
      return this.chargesShown;
    },
    setChargesShown: function( chargesShown ) {
      this.chargesShownProperty.set( chargesShown );
    },
    isPotentialChartVisible: function() {
      return this.potentialChartVisible;
    },
    setStimulusLockout: function( lockout ) {
      this.stimulusLockoutProperty.set( lockout );
      if ( !lockout ) {
        this.stimulusPulseInitiated = false;
      }
    },
    getMembranePotential: function() {
      if ( this.isPlayback() ) {
        return this.neuronModelPlaybackState.getMembranePotential();
      }
      else {
        return this.hodgkinHuxleyModel.getMembraneVoltage();
      }
    },

    /**
     * Set the playback state, which is the state that is presented to the
     * user during playback.  The provided state variable defines the state
     * of the simulation that is being set.
     * @param {NeuronModelState}state
     */
    setPlaybackState: function( state ) {

      this.concentrationChanged = false;

      // Set the membrane channel state.
      this.axonMembrane.setState( state.getAxonMembraneState() );

      // Set the states of the membrane channels.
      this.membraneChannels.forEach( function( membraneChannel ) {
        var mcs = state.getMembraneChannelStateMap().get( membraneChannel );
        // Error handling.
        if ( mcs === null ) {
          assert && assert( " NeuronModel  Error: No state found for membrane channel." );
          return;
        }
        // Restore the state.
        membraneChannel.setState( mcs );

      } );

      // Set the state of the playback particles.  This maps the particle
      // mementos in to the playback particles so that we don't have to
      // delete and add back a bunch of particles at each step.
      var additionalPlaybackParticlesNeeded = state.getPlaybackParticleMementos().length - this.playbackParticles.length;
      var thisModel = this;
      if ( additionalPlaybackParticlesNeeded > 0 ) {
        _.times( additionalPlaybackParticlesNeeded, function( idx ) {
          var newPlaybackParticle = new PlaybackParticle();
          thisModel.playbackParticles.push( newPlaybackParticle );
        } );

      }
      else if ( additionalPlaybackParticlesNeeded < 0 ) {
        _.times( Math.abs( additionalPlaybackParticlesNeeded ), function( idx ) {
          thisModel.playbackParticles.pop();// remove the last item
        } );
      }

      // Set playback particle states from the mementos.
      var playbackParticleIndex = 0;
      var mementos = state.getPlaybackParticleMementos();
      mementos.forEach( function( memento ) {
        thisModel.playbackParticles.get( playbackParticleIndex ).restoreFromMemento( memento );
        playbackParticleIndex++;
      } );

      this.neuronModelPlaybackState = state;
      this.membranePotential = state.getMembranePotential();

      // For the sake of simplicity, always send out notifications for the
      // concentration changes.
      this.concentrationChanged = true;

      // If any one channel's state is changed, trigger a channel representation changed event
      this.channelRepresentationChanged = false;
      this.channelRepresentationChanged = _.any( this.membraneChannels.getArray(), 'channelStateChanged' );
    }
  } );
} );

