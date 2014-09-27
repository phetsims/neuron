//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for the 'Neuron' screen.
 * This class represents the main class for modeling the axon.  It acts as the
 * central location where the interaction between the membrane, the particles
 * (i.e. ions), and the gates is all governed.
 *
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var AxonMembrane = require( 'NEURON/neuron/model/AxonMembrane' );
  var Shape = require( 'KITE/Shape' );
  var ModifiedHodgkinHuxleyModel = require( 'NEURON/neuron/model/ModifiedHodgkinHuxleyModel' );
  var MembraneChannelTypes = require( 'NEURON/neuron/model/MembraneChannelTypes' );
  var ParticleCapture = require( 'NEURON/neuron/model/ParticleCapture' );
  var NeuronModelState = require( 'NEURON/neuron/model/NeuronModelState' );
  var ParticlePosition = require( 'NEURON/neuron/model/ParticlePosition' );
  var ParticleFactory = require( 'NEURON/neuron/model/ParticleFactory' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var PlaybackParticle = require( 'NEURON/neuron/model/PlaybackParticle' );
  var MembraneChannelFactory = require( 'NEURON/neuron/model/MembraneChannelFactory' );
  var SodiumDualGatedChannel = require( 'NEURON/neuron/model/SodiumDualGatedChannel' );
  var SlowBrownianMotionStrategy = require( 'NEURON/neuron/model/SlowBrownianMotionStrategy' );
  var MembraneCrossingDirection = require( 'NEURON/neuron/model/MembraneCrossingDirection' );
  var CaptureZoneScanResult = require( 'NEURON/neuron/model/CaptureZoneScanResult' );
  var TimedFadeInStrategy = require( 'NEURON/neuron/model/TimedFadeInStrategy' );
  var NeuronSharedConstants = require( 'NEURON/neuron/common/NeuronSharedConstants' );



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
  var FOREGROUND_PARTICLE_DEFAULT_OPAQUENESS = 0.20;
  var BACKGROUND_PARTICLE_DEFAULT_OPAQUENESS = 0.05;

  var RAND = {nextDouble: function() {
    return Math.random();
  }};


  /**
   * Main constructor for NeuronModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function NeuronModel() {
    var thisModel = this;
    var maxRecordPoints = Math.ceil( NeuronSharedConstants.TIME_SPAN * 1000 / NeuronSharedConstants.MIN_ACTION_POTENTIAL_CLOCK_DT );
    //Particle Capture is a PropertySet
    ParticleCapture.call( thisModel, maxRecordPoints,{
      potentialChartVisible: DEFAULT_FOR_MEMBRANE_CHART_VISIBILITY,
      // Controls whether all ions, or just those near membrane, are simulated.
      allIonsSimulated: DEFAULT_FOR_SHOW_ALL_IONS,
      // Controls whether charges are depicted.
      chargesShown: DEFAULT_FOR_CHARGES_SHOWN,
      // Controls whether concentration readings are depicted.
      concentrationReadoutVisible: DEFAULT_FOR_CONCENTRATION_READOUT_SHOWN,
      previousMembranePotential: 0,
      stimulasLockout: false,
      playbackParticlesVisible: false,
      concentrationChanged: false,
      stimulusPulseInitiated: false,// observed by Membrane potential chart
      membranePotentialChanged: false,
      neuronModelPlaybackState: null,
      // record playback related
      paused: false,
      particlesStateChanged: false // to trigger canvas invalidation
    } );


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

    thisModel.previousMembranePotential = 0;
    thisModel.sodiumInteriorConcentration = NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
    thisModel.sodiumExteriorConcentration = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION;
    thisModel.potassiumInteriorConcentration = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION;
    thisModel.potassiumExteriorConcentration = NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;

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

    this.reset(); // This does initialization
  }

  return inherit( ParticleCapture, NeuronModel, {

    //Animation Loop Entry
    step: function( simulationTimeChange ) {

      simulationTimeChange = simulationTimeChange / 1000;

      if (simulationTimeChange < 0 && this.getPlaybackSpeed() > 0){
        // This is a step backwards in time but the record-and-playback
        // model is not set up for backstepping, so set it up for
        // backwards stepping.
        this.setPlayback(-1);  // The -1 indicates playing in reverse.
        if (this.getTime() > this.getMaxRecordedTime()){
          this.setTime(this.getMaxRecordedTime());
        }
      }
      else if (this.getPlaybackSpeed() < 0 && simulationTimeChange > 0 && this.isPlayback()){
        // This is a step forward in time but the record-and-playback
        // model is set up for backwards stepping, so straighten it out.
        this.setPlayback(1);
      }

      ParticleCapture.prototype.step.call( this, simulationTimeChange );// TODO Test Code, need to implement NeuronClock Model

      // If we are currently in playback mode and we have reached the end of
      // the recorded data, we should automatically switch to record mode.
      if (this.isPlayback() && this.getTime() >= this.getMaxRecordedTime()){
        this.setModeRecord();
        this.setPaused(false);
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
      if ( Math.abs( this.previousMembranePotential - this.hodgkinHuxleyModel.getMembraneVoltage() ) > MEMBRANE_POTENTIAL_CHANGE_THRESHOLD ) {
        this.previousMembranePotentialProperty.set( this.hodgkinHuxleyModel.getMembraneVoltage() );

      }

      // Update the stimulus lockout state.
      this.updateStimulasLockoutState();

      // Step the channels.
      this.membraneChannels.forEach( function( channel ) {
        channel.stepInTime( dt );
      } );


      // Step the transient particles.  Since these particles may remove
      // themselves as a result of being stepped, we need to copy the list
      // in order to avoid concurrent modification exceptions.
      var particlesCopy = this.transientParticles.getArray().slice();
      particlesCopy.forEach( function( particle ) {
        particle.stepInTime( dt );
      } );

      // Step the background particles, which causes them to exhibit a
      // little Brownian motion
      this.backgroundParticles.forEach( function( particle ) {
        particle.stepInTime( dt );
      } );


      // Adjust the overall potassium and sodium concentration levels based
      // parameters of the HH model.  This is done solely to provide values
      // that can be displayed to the user, and are not used for anything
      // else in the model.
      var concentrationChanged = false;
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
        this.concentrationChangedProperty.set( !this.concentrationChanged ); // trigger property change
      }

      //invert the value and trigger change event
      this.particlesStateChangedProperty.set( !this.particlesStateChangedProperty.get() );
      // Return model state after each time step.
      return this.getState();

    },

    reset: function() {

      // Reset the superclass, which contains the recording state & data.
      // ParticleCapture is PropertySet
      ParticleCapture.prototype.reset.call( this );

      // Reset the axon membrane.
      this.axonMembrane.reset();

      // Remove all existing particles.
      this.removeAllParticles();
      this.allIonsSimulated = false;

      // Reset all membrane channels.
      this.membraneChannels.forEach( function( membraneChannel ) {
        membraneChannel.reset();
      } );

      // Reset the HH model.
      this.hodgkinHuxleyModel.reset();

      // Reset the concentration readout values.
      var concentrationChanged = false;
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

        this.concentrationChangedProperty.set( !this.concentrationChanged ); // Trigger property change
      }

      // Reset the stimulation lockout.
      this.setStimulasLockout( false );

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

      // This can only be changed when the stimlus initiation is not locked
      // out.  Otherwise, particles would come and go during an action
      // potential, which would be hard to handle and potentially confusing.
      if ( !this.isStimulusInitiationLockedOut() ) {
        if ( this.allIonsSimulated !== allIonsSimulated ) {
          this.allIonsSimulatedProperty.set( allIonsSimulated );

          if ( this.allIonsSimulated ) {
            // Add the bulk particles.
            this.addInitialBulkParticles();
          }
          else {
            // Remove all particles.
            this.removeAllParticles();
          }
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
          //CaptureZoneScanResult
          var czsr = thisModel.scanCaptureZoneForFreeParticles( captureZone, ParticleType.SODIUM_ION );
          if ( czsr.numParticlesInZone === 0 ) {
            thisModel.addBackgroundParticles( ParticleType.SODIUM_ION, captureZone, Math.floor( Math.random() * 2 ) + 1 );
          }
        }
      } );

      // Set all new particles to exhibit simple Brownian motion.
      thisModel.backgroundParticles.forEach( function( backgroundParticle ) {
        if ( preExistingParticles.indexOf( backgroundParticle ) === -1 ) {
          backgroundParticle.setMotionStrategy( new SlowBrownianMotionStrategy( backgroundParticle.getPositionReference() ) );
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
      if ( captureZone !== null ) {
        var location = captureZone.getSuggestedNewParticleLocation();
        newParticle.setPosition( location );
      }
      var thisModel = this;
      newParticle.continueExistingProperty.link( function( newValue ) {
        if ( newValue === false ) {
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


    getParticleMotionBounds: function() {
      return PARTICLE_BOUNDS;
    },

    initiateStimulusPulse: function() {
      if ( !this.isStimulusInitiationLockedOut() ) {
        this.axonMembrane.initiateTravelingActionPotential();
        this.stimulusPulseInitiated = true;
        this.updateStimulasLockoutState();
      }
    },

    /**
     * Place a particle at a random location inside the axon membrane.
     */
    positionParticleInsideMembrane: function( particle ) {
      // Choose any angle.
      var angle = RAND.nextDouble() * Math.PI * 2;

      // Choose a distance from the cell center that is within the membrane.
      // The multiplier value is created with the intention of weighting the
      // positions toward the outside in order to get an even distribution
      // per unit area.
      var multiplier = Math.max( RAND.nextDouble(), RAND.nextDouble() );
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

      return this.axonMembrane.getTravelingActionPotential() !== null ||
             Math.abs( this.hodgkinHuxleyModel.get_k_current() ) > POTASSIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL ||
             Math.abs( this.hodgkinHuxleyModel.get_na_current() ) > SODIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL ||
             Math.abs( this.hodgkinHuxleyModel.get_l_current() ) > LEAKAGE_CURRENT_THRESH_FOR_ACTION_POTENTIAL;
    },

    /**
     * Place a particle at a random location outside the axon membrane.
     */
    positionParticleOutsideMembrane: function( particle ) {
      // Choose any angle.
      var angle = RAND.nextDouble() * Math.PI * 2;

      // Choose a distance from the cell center that is outside of the
      // membrane. The multiplier value is created with the intention of
      // weighting the positions toward the outside in order to get an even
      // distribution per unit area.
      var multiplier = RAND.nextDouble();
      var distance = this.crossSectionOuterRadius + particle.getRadius() * 4 +
                     multiplier * this.crossSectionOuterRadius * 2.2;

      particle.setPosition( distance * Math.cos( angle ), distance * Math.sin( angle ) );
    },

    /**
     * Scan the supplied capture zone for particles of the specified type.
     *
     * @param {CaptureZone} zone
     * @param {ParticleType} particleType
     * @return
     */
    scanCaptureZoneForFreeParticles: function( zone, particleType ) {
      var thisModel = this;
      var closestFreeParticle = null;
      var distanceOfClosestParticle = Number.POSITIVE_INFINITY;
      var totalNumberOfParticles = 0;
      var captureZoneOrigin = zone.getOriginPoint();

      thisModel.transientParticles.forEach( function( particle ) {

        if ( (particle.getType() === particleType) && (particle.isAvailableForCapture()) && (zone.isPointInZone( particle.getPositionReference() )) ) {
          totalNumberOfParticles++;
          if ( closestFreeParticle === null ) {
            closestFreeParticle = particle;
            distanceOfClosestParticle = captureZoneOrigin.distance( closestFreeParticle.getPositionReference() );
          }
          else if ( captureZoneOrigin.distance( closestFreeParticle.getPosition() ) < distanceOfClosestParticle ) {
            closestFreeParticle = particle;
            distanceOfClosestParticle = captureZoneOrigin.distance( closestFreeParticle.getPositionReference() );
          }
        }
      } );


      return new CaptureZoneScanResult( closestFreeParticle, totalNumberOfParticles );
    },

    updateStimulasLockoutState: function() {
      if ( this.stimulasLockout ) {
        // Currently locked out, see if that should change.
        if ( !this.isPlayback() && !this.isActionPotentialInProgress() ) {
          this.setStimulasLockout( false );
        }
      }
      else {
        // Currently NOT locked out, see if that should change.
        if ( this.isActionPotentialInProgress() || (this.isPlayback() && this.getTime() < this.getMaxRecordedTime()) ) {
          this.setStimulasLockout( true );
        }
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
      this.backgroundParticles.push( newParticle );

      newParticle.continueExistingProperty.link( function( newValue ) {
        if ( newValue === false ) {
          this.backgroundParticles.remove( newParticle );
        }
      } );

      return newParticle;
    },

    removeAllParticles: function() {

      // Remove all particles.  This is done by telling each particle to
      // send out notifications of its removal from the model.  All
      // listeners, including this class, should remove their references in
      // response.
      var thisModel = this;
      var transientParticlesCopy = this.transientParticles.getArray().slice();
      transientParticlesCopy.forEach( function( transientParticle ) {
        thisModel.transientParticles.remove( transientParticle );
      } );

      var backgroundParticlesCopy = this.backgroundParticles.getArray().slice();
      backgroundParticlesCopy.forEach( function( transientParticle ) {
        thisModel.backgroundParticles.remove( transientParticle );
      } );
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
      if ( !membraneChannel ) {//TODO not all membrane channels are implemented
        return;
      }

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
      return this.stimulasLockout;
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
    setStimulasLockout: function( lockout ) {
      this.stimulasLockoutProperty.set( lockout );
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
        thisModel.playbackParticles[playbackParticleIndex].restoreFromMemento( memento );
        playbackParticleIndex++;
      } );

      // Save the new playback state and send out notifications for any changes.
      var oldState = this.neuronModelPlaybackState;
      this.neuronModelPlaybackState = state;
      if ( oldState === null || oldState.getMembranePotential() !== state.getMembranePotential() ) {
        this.membranePotentialChanged = !this.membranePotentialChanged; // toggle the value to trigger change event
      }
      // For the sake of simplicity, always send out notifications for the
      // concentration changes.
      this.concentrationChanged = !this.concentrationChanged;

    }

  } );
} )
;

// Copyright 2002-2011, University of Colorado

//package edu.colorado.phet.neuron.model;
//
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//import java.util.ArrayList;
//import java.util.EventListener;
//import java.util.HashMap;
//import java.util.Random;
//
//import javax.swing.event.EventListenerList;
//
//import edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockEvent;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock.ConstantDtClockEvent;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock.ConstantDtClockListener;
//import edu.colorado.phet.common.phetcommon.util.SimpleObserver;
//import edu.colorado.phet.neuron.model.AxonMembrane.AxonMembraneState;
//import edu.colorado.phet.neuron.model.MembraneChannel.MembraneChannelState;
//import edu.colorado.phet.neuron.module.NeuronDefaults;
//import edu.colorado.phet.neuron.view.MembranePotentialChart;
//import edu.colorado.phet.recordandplayback.model.RecordAndPlaybackModel;
//
///**
// * This class represents the main class for modeling the axon.  It acts as the
// * central location where the interaction between the membrane, the particles
// * (i.e. ions), and the gates is all governed.
// *
// * @author John Blanco
// */
//public class NeuronModel extends RecordAndPlaybackModel<NeuronModel.NeuronModelState> implements IParticleCapture {


//

//private final ConstantDtClock clock;

//private EventListenerList listeners = new EventListenerList();
//private IHodgkinHuxleyModel hodgkinHuxleyModel = new ModifiedHodgkinHuxleyModel();


//private NeuronModelState neuronModelPlaybackState = null;
//
//  //----------------------------------------------------------------------------
//  // Constructors
//  //----------------------------------------------------------------------------
//
//  public NeuronModel( NeuronClock clock ) {
//    // The max recording points based on the time span of the chart and
//    // the minimum clock speed.
//    super((int)Math.ceil( MembranePotentialChart.TIME_SPAN * 1000 / NeuronDefaults.MIN_ACTION_POTENTIAL_CLOCK_DT ));
//
//    this.clock = clock;
//

//
//    /**
//     * Listen to the clock for ticks, starts, pauses, etc, that can affect
//     * the state of the model.
//     */
//    clock.addClockListener(new ClockAdapter(){
//
//      @Override
//      public void clockTicked(ClockEvent clockEvent) {
//        stepInTime( clockEvent.getSimulationTimeChange() );
//      }
//
//      @Override
//      public void clockStarted(ClockEvent clockEvent) {
//        super.clockStarted(clockEvent);
//      }
//    });
//
//    // Add a listener for a slightly different aspect of the clock's nature.
//    clock.addConstantDtClockListener( new ConstantDtClockListener() {
//
//      public void dtChanged( ConstantDtClockEvent event ) {
//        // Set the playback speed based on the new clock DT value.
//        // This is done so that the slider on the clock control can
//        // control the speed during playback, as it does automatically
//        // in the Record or Live modes.
//        setPlaybackSpeed( calculatePlaybackSpeed() );
//      }
//
//      public void delayChanged( ConstantDtClockEvent event ) {
//        // This is not expected to occur.  If it does, code will need
//        // to be hadded to handle it.
//        assert false;
//        System.err.println( getClass().getName() + " - Error: delayChanged called, which was unexpected." );
//        // Ignored.
//      }
//    });
//
//    // Listen to the record-and-playback model for events that affect the
//    // state of the sim model.
//    addObserver(new SimpleObserver() {
//      public void update() {
//        updateStimulasLockoutState();
//        updateSimAndPlaybackParticleVisibility();
//      }
//    });
//
//    // Listen to the membrane for events that indicate that a traveling
//    // action potential has arrived at the location of the transverse
//    // cross section.
//    axonMembrane.addListener(new AxonMembrane.Adapter() {
//      public void travelingActionPotentialReachedCrossSection() {
//        // The action potential has arrived, so stimulate the model
//        // the simulates the action potential voltages and current
//        // flows.
//        hodgkinHuxleyModel.stimulate();
//      }
//    });
//
//    addInitialChannels();
//
//    // Note: It is expected that the model will be reset once it has been
//    // created, and this will set the initial state, including adding the
//    // particles to the model.
//  }
//
//  //----------------------------------------------------------------------------
//  // Accessors
//  //----------------------------------------------------------------------------
//
//  public ConstantDtClock getClock() {
//    return clock;
//  }
//


//
//  public double getSodiumInteriorConcentration() {
//    if (isPlayback()){
//      return neuronModelPlaybackState.getSodiumInteriorConcentration();
//    }
//    else{
//      return sodiumInteriorConcentration;
//    }
//  }
//
//  public double getSodiumExteriorConcentration() {
//    if (isPlayback()){
//      return neuronModelPlaybackState.getSodiumExteriorConcentration();
//    }
//    else{
//      return sodiumExteriorConcentration;
//    }
//  }
//
//  public double getPotassiumInteriorConcentration() {
//    if (isPlayback()){
//      return neuronModelPlaybackState.getPotassiumInteriorConcentration();
//    }
//    else{
//      return potassiumInteriorConcentration;
//    }
//  }
//
//  public double getPotassiumExteriorConcentration() {
//    if (isPlayback()){
//      return neuronModelPlaybackState.getPotassiumExteriorConcentration();
//    }
//    else{
//      return potassiumExteriorConcentration;
//    }
//  }
//


//
//  private void updateStimulasLockoutState(){
//    if (stimulasLockout){
//      // Currently locked out, see if that should change.
//      if (!isPlayback() && !isActionPotentialInProgress()) {
//        setStimulasLockout(false);
//      }
//    }
//    else{
//      // Currently NOT locked out, see if that should change.
//      if (isActionPotentialInProgress() || (isPlayback() && getTime() < getMaxRecordedTime())){
//        setStimulasLockout(true);
//      }
//    }
//  }
//
//  private void setStimulasLockout(boolean lockout){
//    if (lockout != stimulasLockout){
//      stimulasLockout = lockout;
//      notifyStimulusLockoutStateChanged();
//    }
//  }
//
//  /**
//   * There are two sets of particles in this simulation, one that is used
//   * when actually simulating, and one that is used when playing back.  This
//   * routine updates which set is visible based on state information.
//   */
//  private void updateSimAndPlaybackParticleVisibility(){
//    if (isRecord() || isLive()){
//      // In either of these modes, the simulation particles (as opposed
//      // to the playback particles) should be visible.  Make sure that
//      // this is the case.
//      if (playbackParticlesVisible){
//        // Hide the playback particles.  This is done by removing them
//        // from the model.
//        ArrayList<PlaybackParticle> playbackParticlesCopy = new ArrayList<PlaybackParticle>(playbackParticles);
//        for (PlaybackParticle playbackParticle: playbackParticlesCopy){
//          playbackParticle.removeFromModel();
//        }
//        // Show the simulation particles.
//        transientParticles.addAll( transientParticlesBackup );
//        transientParticlesBackup.clear();
//        for (Particle simParticle : transientParticles){
//          notifyParticleAdded( simParticle );
//        }
//        // Update the state variable.
//        playbackParticlesVisible = false;
//      }
//    }
//    else if (isPlayback()){
//      // The playback particles should be showing and the simulation
//      // particles should be hidden.  Make sure that this is the case.
//      if (!playbackParticlesVisible){
//        // Hide the simulation particles.  This is done by making a
//        // backup copy of them (so that they can be added back later)
//        // and then removing them from the model.
//        transientParticlesBackup.addAll( transientParticles );
//        for (IViewableParticle particle : transientParticlesBackup){
//          particle.removeFromModel();
//        }
//
//        // Note that we don't explicitly add the playback particles
//        // here.  That is taken care of when the playback state is
//        // set.  Here we only set the flag.
//        playbackParticlesVisible = true;
//      }
//    }
//    else{
//      // Should never happen, debug if it does.
//      System.out.println(getClass().getName() + " - Error: Unrecognized record-and-playback mode.");
//      assert false;
//    }
//  }
//
//  /**
//   * Get a boolean value that indicates whether the initiation of a new
//   * stimulus (i.e. action potential) is currently locked out.  This is done
//   * to prevent the situation where multiple action potentials are moving
//   * down the membrane at the same time.
//   *
//   * @return
//   */
//  public boolean isStimulusInitiationLockedOut(){
//    return stimulasLockout;
//  }
//

//

//
//  /**
//   * Create a particle of the specified type and add it to the model.
//   *
//   * @param particleType
//   * @return
//   */
//  private Particle createBackgroundParticle(ParticleType particleType){
//
//    final Particle newParticle = Particle.createParticle(particleType);
//    backgroundParticles.add(newParticle);
//
//    // Listen to the particle for notification of its removal.
//    newParticle.addListener(new ParticleListenerAdapter(){
//      public void removedFromModel() {
//        backgroundParticles.remove(newParticle);
//      }
//    });
//
//    // Send notification that this particle has come into existence.
//    notifyParticleAdded(newParticle);
//
//    return newParticle;
//  }
//

//
//  /**
//   * Get the state of this model.  This is generally used in support of the
//   * record-and-playback feature, and the return value contains just enough
//   * state information to support this feature.
//   */
//  private NeuronModelState getState(){
//    return new NeuronModelState(this);
//  }
//

//
//  /**
//   * The record-and-playback model has a notion of playback speed, which is
//   * independent of the current clock speed by design.  In our case, we want
//   * the playback speed to vary with the clock speed setting.  This method
//   * defines the relationship between the two values.
//   */
//  private double calculatePlaybackSpeed(){
//    double playbackSpeed = getClock().getDt() / NeuronDefaults.DEFAULT_ACTION_POTENTIAL_CLOCK_DT;
//    return playbackSpeed;
//  }
//
//  public void addListener(Listener listener){
//    listeners.add(Listener.class, listener);
//  }
//
//  public void removeListener(Listener listener){
//    listeners.remove(Listener.class, listener);
//  }
//
//  private void notifyChannelAdded(MembraneChannel channel){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.channelAdded(channel);
//    }
//  }
//
//  private void notifyParticleAdded(IViewableParticle particle){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.particleAdded(particle);
//    }
//  }
//
//  private void notifyStimulusPulseInitiated(){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.stimulusPulseInitiated();
//    }
//  }
//
//  private void notifyMembranePotentialChanged(){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.membranePotentialChanged();
//    }
//  }
//
//  private void notifyConcentrationReadoutVisibilityChanged(){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.concentrationReadoutVisibilityChanged();
//    }
//  }
//
//  private void notifyPotentialChartVisibilityChanged(){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.potentialChartVisibilityChanged();
//    }
//  }
//
//  private void notifyChargesShownChanged(){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.chargesShownChanged();
//    }
//  }
//
//  private void notifyAllIonsSimulatedChanged(){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.allIonsSimulatedChanged();
//    }
//  }
//
//  private void notifyStimulusLockoutStateChanged(){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.stimulationLockoutStateChanged();
//    }
//  }
//
//  private void notifyConcentrationChanged(){
//    for (Listener listener : listeners.getListeners(Listener.class)){
//      listener.concentrationChanged();
//    }
//  }
//

//


//
//  /**
//   * Remove all particles (i.e. ions) from the simulation.
//   */
//  private void removeAllParticles(){

//  }
//
//  //----------------------------------------------------------------------------
//  // Inner Classes and Interfaces
//  //----------------------------------------------------------------------------


//
//  public interface Listener extends EventListener {
//    /**
//     * Notification that a channel was added.
//     *
//     * @param channel - Channel that was added.
//     */
//    public void channelAdded(MembraneChannel channel);
//
//    /**
//     * Notification that a particle was added.
//     *
//     * @param particle - Particle that was added.
//     */
//    public void particleAdded(IViewableParticle particle);
//
//    /**
//     * Notification that a stimulus pulse has been initiated.
//     */
//    public void stimulusPulseInitiated();
//
//    /**
//     * Notification that the membrane potential has changed.
//     */
//    public void membranePotentialChanged();
//
//    /**
//     * Notification that the setting for the visibility of the membrane
//     * potential chart has changed.
//     */
//    public void potentialChartVisibilityChanged();
//
//    /**
//     * Notification that the setting for the visibility of the
//     * concentration information has changed.
//     */
//    public void concentrationReadoutVisibilityChanged();
//
//    /**
//     * Notification that the setting for whether or not the charges are
//     * shown has changed.
//     */
//    public void chargesShownChanged();
//
//    /**
//     * Notification that the setting for whether or not all ions are
//     * included in the simulation has changed.
//     */
//    public void allIonsSimulatedChanged();
//
//    /**
//     * Notification that the state of stimulation lockout, which prevents
//     * stimuli from being initiated too close together, has changed.
//     */
//    public void stimulationLockoutStateChanged();
//
//    /**
//     * Notification that the concentration of one or more of the ions
//     * has changed.
//     */
//    public void concentrationChanged();
//  }
//
//  public static class Adapter implements Listener{
//    public void channelAdded(MembraneChannel channel) {}
//    public void particleAdded(IViewableParticle particle) {}
//    public void stimulusPulseInitiated() {}
//    public void potentialChartVisibilityChanged() {}
//    public void stimulationLockoutStateChanged() {}
//    public void allIonsSimulatedChanged() {}
//    public void chargesShownChanged() {}
//    public void membranePotentialChanged() {}
//    public void concentrationChanged() {}
//    public void concentrationReadoutVisibilityChanged() {}
//  }
//
//  /**
//   * This class contains state information about the model for a given point
//   * in time.  It contains enough information for the playback feature, but
//   * not necessarily enough to fully restore the simulation to an arbitrary
//   * point in time.
//   */
//  public static class NeuronModelState {
//
//    private final AxonMembraneState axonMembraneState;
//    private final HashMap< MembraneChannel, MembraneChannel.MembraneChannelState > membraneChannelStateMap =
//                                            new HashMap<MembraneChannel, MembraneChannelState>();
//    private final ArrayList<ParticlePlaybackMemento> particlePlaybackMementos =
//                  new ArrayList<ParticlePlaybackMemento>();
//    private final double membranePotential;
//    private final double sodiumInteriorConcentration;
//    private final double sodiumExteriorConcentration;
//    private final double potassiumInteriorConcentration;
//    private final double potassiumExteriorConcentration;
//
//    /**
//     * Constructor, which extracts the needed state information from the
//     * model.
//     *
//     * @param neuronModel
//     */
//    public NeuronModelState(NeuronModel neuronModel){
//

//    }
//
//    protected AxonMembraneState getAxonMembraneState() {
//      return axonMembraneState;
//    }
//
//    protected HashMap<MembraneChannel, MembraneChannel.MembraneChannelState> getMembraneChannelStateMap() {
//      return membraneChannelStateMap;
//    }
//
//    protected ArrayList<ParticlePlaybackMemento> getPlaybackParticleMementos() {
//      return particlePlaybackMementos;
//    }
//
//    protected double getMembranePotential() {
//      return membranePotential;
//    }
//
//    protected double getSodiumInteriorConcentration() {
//      return sodiumInteriorConcentration;
//    }
//
//    protected double getSodiumExteriorConcentration() {
//      return sodiumExteriorConcentration;
//    }
//
//    protected double getPotassiumInteriorConcentration() {
//      return potassiumInteriorConcentration;
//    }
//
//    protected double getPotassiumExteriorConcentration() {
//      return potassiumExteriorConcentration;
//    }
//  }
//

//
//  @Override
//  public void stepInTime(double simulationTimeChange) {
//    if (simulationTimeChange < 0 && getPlaybackSpeed() > 0){
//      // This is a step backwards in time but the record-and-playback
//      // model is not set up for backstepping, so set it up for
//      // backwards stepping.
//      setPlayback(-1);  // The -1 indicates playing in reverse.
//      if (getTime() > getMaxRecordedTime()){
//        setTime(getMaxRecordedTime());
//      }
//    }
//    else if (getPlaybackSpeed() < 0 && simulationTimeChange > 0 && isPlayback()){
//      // This is a step forward in time but the record-and-playback
//      // model is set up for backwards stepping, so straighten it out.
//      setPlayback(1);
//    }
//
//    super.stepInTime(simulationTimeChange);
//
//    // If we are currently in playback mode and we have reached the end of
//    // the recorded data, we should automatically switch to record mode.
//    if (isPlayback() && getTime() >= getMaxRecordedTime()){
//      setModeRecord();
//      setPaused(false);
//    }
//  }
//
//  @Override
//  public NeuronModelState step(double dt) {
//    // Step the membrane in time.  This is done prior to stepping the
//    // HH model because the traveling action potential is part of the
//    // membrane, so if it reaches the cross section in this time step the
//    // membrane potential will be modified.
//    axonMembrane.stepInTime( dt );
//
//    // This is a step forward in time.  Update the value of the
//    // membrane potential by stepping the Hodgkins-Huxley model.
//    hodgkinHuxleyModel.stepInTime( dt );
//
//    // There is a bit of a threshold on sending out notifications of
//    // membrane voltage changes, since otherwise the natural "noise" in
//    // the model causes notifications to be sent out continuously.
//    if (Math.abs(previousMembranePotential - hodgkinHuxleyModel.getMembraneVoltage()) > MEMBRANE_POTENTIAL_CHANGE_THRESHOLD){
//      previousMembranePotential = hodgkinHuxleyModel.getMembraneVoltage();
//      notifyMembranePotentialChanged();
//    }
//
//    // Update the stimulus lockout state.
//    updateStimulasLockoutState();
//
//    // Step the channels.
//    for (MembraneChannel channel : membraneChannels){
//      channel.stepInTime( dt );
//    }
//
//    // Step the transient particles.  Since these particles may remove
//    // themselves as a result of being stepped, we need to copy the list
//    // in order to avoid concurrent modification exceptions.
//    ArrayList<Particle> particlesCopy = new ArrayList<Particle>(transientParticles);
//    for (Particle particle : particlesCopy){
//      particle.stepInTime( dt );
//    }
//
//    // Step the background particles, which causes them to exhibit a
//    // little Brownian motion.
//    for (Particle backgroundParticle : backgroundParticles){
//      backgroundParticle.stepInTime( dt );
//    }
//
//    // Adjust the overall potassium and sodium concentration levels based
//    // parameters of the HH model.  This is done solely to provide values
//    // that can be displayed to the user, and are not used for anything
//    // else in the model.
//    boolean concentrationChanged = false;
//    double potassiumConductance = hodgkinHuxleyModel.get_delayed_n4(CONCENTRATION_READOUT_DELAY);
//    if (potassiumConductance != 0){
//      // Potassium is moving out of the cell as part of the process of
//      // an action potential, so adjust the interior and exterior
//      // concentration values.
//      potassiumExteriorConcentration += potassiumConductance * dt * EXTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM;
//      potassiumInteriorConcentration -= potassiumConductance * dt * INTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM;
//      concentrationChanged = true;
//    }
//    else{
//      if (potassiumExteriorConcentration != NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION){
//        double difference = Math.abs(potassiumExteriorConcentration - NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION);
//        if (difference < CONCENTRATION_DIFF_THRESHOLD){
//          // Close enough to consider it fully restored.
//          potassiumExteriorConcentration = NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;
//        }
//        else{
//          // Move closer to the nominal value.
//          potassiumExteriorConcentration -= difference * CONCENTRATION_RESTORATION_FACTOR * dt;
//        }
//        concentrationChanged = true;
//      }
//      if (potassiumInteriorConcentration != NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION){
//        double difference = Math.abs(potassiumInteriorConcentration - NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION);
//        if (difference < CONCENTRATION_DIFF_THRESHOLD){
//          // Close enough to consider it fully restored.
//          potassiumInteriorConcentration = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION;
//        }
//        else{
//          // Move closer to the nominal value.
//          potassiumInteriorConcentration += difference * CONCENTRATION_RESTORATION_FACTOR * dt;
//        }
//        concentrationChanged = true;
//      }
//    }
//    double sodiumConductance = hodgkinHuxleyModel.get_delayed_m3h(CONCENTRATION_READOUT_DELAY);
//    if (hodgkinHuxleyModel.get_m3h() != 0){
//      // Sodium is moving in to the cell as part of the process of an
//      // action potential, so adjust the interior and exterior
//      // concentration values.
//      sodiumExteriorConcentration -= sodiumConductance * dt * EXTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM;
//      sodiumInteriorConcentration += sodiumConductance * dt * INTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM;
//      concentrationChanged = true;
//    }
//    else{
//      if (sodiumExteriorConcentration != NOMINAL_SODIUM_EXTERIOR_CONCENTRATION){
//        double difference = Math.abs(sodiumExteriorConcentration - NOMINAL_SODIUM_EXTERIOR_CONCENTRATION);
//        if (difference < CONCENTRATION_DIFF_THRESHOLD){
//          // Close enough to consider it fully restored.
//          sodiumExteriorConcentration = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION;
//        }
//        else{
//          // Move closer to the nominal value.
//          sodiumExteriorConcentration += difference * CONCENTRATION_RESTORATION_FACTOR * dt;
//        }
//        concentrationChanged = true;
//      }
//      if (sodiumInteriorConcentration != NOMINAL_SODIUM_INTERIOR_CONCENTRATION){
//        double difference = Math.abs(sodiumInteriorConcentration - NOMINAL_SODIUM_INTERIOR_CONCENTRATION);
//        if (difference < CONCENTRATION_DIFF_THRESHOLD){
//          // Close enough to consider it fully restored.
//          sodiumInteriorConcentration = NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
//        }
//        else{
//          // Move closer to the nominal value.
//          sodiumInteriorConcentration -= difference * CONCENTRATION_RESTORATION_FACTOR * dt;
//        }
//        concentrationChanged = true;
//      }
//    }
//    if (concentrationChanged){
//      notifyConcentrationChanged();
//    }
//
//    // Return model state after each time step.
//    return getState();
//  }
//}
