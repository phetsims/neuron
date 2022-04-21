// Copyright 2014-2022, University of Colorado Boulder
/**
 * Model for the 'Neuron' screen. This class represents the main class for modeling the axon.  It acts as the central
 * place where the interaction between the membrane, the particles (i.e. ions), and the gates is all governed.
 *
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import neuron from '../../neuron.js';
import MathUtils from '../common/MathUtils.js';
import NeuronConstants from '../common/NeuronConstants.js';
import RecordAndPlaybackModel from '../recordandplayback/RecordAndPlaybackModel.js';
import AxonMembrane from './AxonMembrane.js';
import MembraneChannelFactory from './MembraneChannelFactory.js';
import MembraneChannelTypes from './MembraneChannelTypes.js';
import MembraneCrossingDirection from './MembraneCrossingDirection.js';
import ModifiedHodgkinHuxleyModel from './ModifiedHodgkinHuxleyModel.js';
import NeuronModelState from './NeuronModelState.js';
import ParticleFactory from './ParticleFactory.js';
import ParticlePosition from './ParticlePosition.js';
import ParticleType from './ParticleType.js';
import PlaybackParticle from './PlaybackParticle.js';
import SlowBrownianMotionStrategy from './SlowBrownianMotionStrategy.js';
import SodiumDualGatedChannel from './SodiumDualGatedChannel.js';
import TimedFadeInStrategy from './TimedFadeInStrategy.js';

// default configuration values
const DEFAULT_FOR_SHOW_ALL_IONS = true;
const DEFAULT_FOR_MEMBRANE_CHART_VISIBILITY = false;
const DEFAULT_FOR_CHARGES_SHOWN = false;
const DEFAULT_FOR_CONCENTRATION_READOUT_SHOWN = false;

// numbers of the various types of channels that are present on the membrane
const NUM_GATED_SODIUM_CHANNELS = 20;
const NUM_GATED_POTASSIUM_CHANNELS = 20;
const NUM_SODIUM_LEAK_CHANNELS = 3;
const NUM_POTASSIUM_LEAK_CHANNELS = 7;

// nominal concentration values
const NOMINAL_SODIUM_EXTERIOR_CONCENTRATION = 145;     // In millimolar (mM)
const NOMINAL_SODIUM_INTERIOR_CONCENTRATION = 10;      // In millimolar (mM)
const NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION = 4;    // In millimolar (mM)
const NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION = 140;  // In millimolar (mM)

// numbers of "bulk" ions in and out of the cell when visible
const NUM_SODIUM_IONS_OUTSIDE_CELL = 450;
const NUM_SODIUM_IONS_INSIDE_CELL = 6;
const NUM_POTASSIUM_IONS_OUTSIDE_CELL = 45;
const NUM_POTASSIUM_IONS_INSIDE_CELL = 150;

// Define the amount of delay between the values changing in the HH model until the concentration readouts are
// updated.  This is needed to make sure that the concentration readouts don't change before visible potassium or
// sodium ions have crossed the membrane.
const CONCENTRATION_READOUT_DELAY = 0.0005;  // in seconds of sim time

// Define the thresholds for determining whether an action potential should be considered to be in progress.  These
// values relate to the rate of flow through the gated sodium, gated potassium, and combination of the sodium and
// potassium leakage. If the values from the HH model exceed any of these, and action potential is considered to be in
// progress. The values were determined empirically, and different HH models may require different values here.
const POTASSIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL = 0.001;
const SODIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL = 0.001;
const LEAKAGE_CURRENT_THRESH_FOR_ACTION_POTENTIAL = 0.444;

// Define the rates at which concentration changes during action potential.  These values combined with the
// conductance at each time step are used to calculate the concentration changes.
const INTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM = 0.4;
const EXTERIOR_CONCENTRATION_CHANGE_RATE_SODIUM = 7;
const INTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM = 2.0;
const EXTERIOR_CONCENTRATION_CHANGE_RATE_POTASSIUM = 0.05;

// threshold of significant difference for concentration values
const CONCENTRATION_DIFF_THRESHOLD = 0.000001;

// Define the rate at which concentration is restored to nominal value.  Higher value means quicker restoration.
const CONCENTRATION_RESTORATION_FACTOR = 1000;

// value that controls how much of a change of the membrane potential must occur before a notification is sent out
const MEMBRANE_POTENTIAL_CHANGE_THRESHOLD = 0.005;

// default values of opacity for newly created particles
const FOREGROUND_PARTICLE_DEFAULT_OPACITY = 0.25;
const BACKGROUND_PARTICLE_DEFAULT_OPACITY = 0.10; // default alpha in Java was 0.05, which isn't visible in the canvas so slightly increasing to 0.10

class NeuronModel extends RecordAndPlaybackModel {

  constructor() {

    const maxRecordPoints = Math.ceil( NeuronConstants.TIME_SPAN * 1000 / NeuronConstants.MIN_ACTION_POTENTIAL_CLOCK_DT );
    super( maxRecordPoints );

    this.axonMembrane = new AxonMembrane();

    // @public - events emitted by this model
    this.channelRepresentationChanged = new Emitter();
    this.particlesMoved = new Emitter();

    // @public, read-only - list of the particles that come and go when the simulation is working in real time
    this.transientParticles = createObservableArray();

    // @private - backup of the transient particles, used to restore them when returning to live mode after doing playback
    this.transientParticlesBackup = createObservableArray();

    // @public, read-only - particles that are "in the background", meaning that they are always present and they don't
    // cross the membrane
    this.backgroundParticles = createObservableArray();

    // @public, read-only - list of particles that are shown during playback
    this.playbackParticles = createObservableArray();

    this.membraneChannels = createObservableArray(); // @public, read-only
    this.hodgkinHuxleyModel = new ModifiedHodgkinHuxleyModel(); // @public

    // @public, read-only - various model values
    this.crossSectionInnerRadius = ( this.axonMembrane.getCrossSectionDiameter() - this.axonMembrane.getMembraneThickness() ) / 2;
    this.crossSectionOuterRadius = ( this.axonMembrane.getCrossSectionDiameter() + this.axonMembrane.getMembraneThickness() ) / 2;
    this.sodiumInteriorConcentration = NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
    this.sodiumExteriorConcentration = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION;
    this.potassiumInteriorConcentration = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION;
    this.potassiumExteriorConcentration = NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;

    // @public
    this.potentialChartVisibleProperty = new Property( DEFAULT_FOR_MEMBRANE_CHART_VISIBILITY ); // @public
    this.chargesShownProperty = new Property( DEFAULT_FOR_CHARGES_SHOWN ); // @public
    this.concentrationReadoutVisibleProperty = new Property( DEFAULT_FOR_CONCENTRATION_READOUT_SHOWN );
    this.membranePotentialProperty = new Property( 0 );
    this.stimulusLockoutProperty = new Property( false );
    this.allIonsSimulatedProperty = new Property( DEFAULT_FOR_SHOW_ALL_IONS ); // controls whether all ions, or just those near membrane, are simulated
    this.playbackParticlesVisibleProperty = new Property( false );
    this.concentrationChangedProperty = new Property( false );
    this.stimulusPulseInitiatedProperty = new Property( false );
    this.neuronModelPlaybackStateProperty = new Property( null );

    // @public, part of a workaround for an issue with refreshing canvases when nothing is drawn, see
    // https://github.com/phetsims/neuron/issues/100 and https://github.com/phetsims/scenery/issues/503
    this.atLeastOneParticlePresentProperty = new Property( false );

    // add a listener that will stimulate the HH model then the traveling action potential reaches the cross section
    this.axonMembrane.travelingActionPotentialReachedCrossSection.addListener( () => {

      // The action potential has arrived at the cross section, so stimulate the model the simulates the action
      // potential voltages and current flows.
      this.hodgkinHuxleyModel.stimulate();

      if ( window.phet.neuron.profiler && window.phet.neuron.profiler.setting === 1 ) {
        // If enabled, start collecting profiling data, which will automatically be spat out to the console (or as
        // an alert dialog on iOS) when completed.  The duration value is empirically determined to be the time for
        // the particles to appear, cross the membrane, and fade out.
        window.phet.neuron.profiler.startDataAnalysis( 6000 );
      }
    } );

    // add a listener that will add and remove the background or 'bulk' particles based on simulation settings
    this.allIonsSimulatedProperty.lazyLink( allIonsSimulated => {

      // This should never change while stimulus is locked out, and we depend on the UI to enforce this rule.
      // Otherwise, background particles could come and go during and action potential or during playback, which would
      // be hard to handle.
      assert && assert( !this.isStimulusInitiationLockedOut(), 'all ions setting changed when stimulus was locked out' );

      if ( allIonsSimulated ) {

        // add the background particles
        this.addInitialBulkParticles();
      }
      else {
        // remove the background particles
        this.backgroundParticles.clear();
      }

      // update the property that indicates whether there is at least one particle present
      this.atLeastOneParticlePresentProperty.set( ( this.backgroundParticles.length +
                                                    this.transientParticles.length +
                                                    this.playbackParticles.length ) > 0 );
    } );

    // Use an immediately invoked function expression (IIFE) a function to add the initial channels.  The pattern is
    // intended to be such that the potassium and sodium gated channels are right next to each other, with occasional
    // leak channels interspersed.  There should be one or more of each type of channel on the top of the membrane so
    // when the user zooms in, they can see all types.
    ( () => {
      let angle = Math.PI * 0.45;
      const totalNumChannels = NUM_GATED_SODIUM_CHANNELS + NUM_GATED_POTASSIUM_CHANNELS + NUM_SODIUM_LEAK_CHANNELS +
                               NUM_POTASSIUM_LEAK_CHANNELS;
      const angleIncrement = Math.PI * 2 / totalNumChannels;
      let gatedSodiumChannelsAdded = 0;
      let gatedPotassiumChannelsAdded = 0;
      let sodiumLeakChannelsAdded = 0;
      let potassiumLeakChannelsAdded = 0;

      // Add some of each type so that they are visible at the top portion of the membrane.
      if ( NUM_SODIUM_LEAK_CHANNELS > 0 ) {
        this.addChannel( MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL, angle );
        sodiumLeakChannelsAdded++;
        angle += angleIncrement;
      }
      if ( NUM_GATED_POTASSIUM_CHANNELS > 0 ) {
        this.addChannel( MembraneChannelTypes.POTASSIUM_GATED_CHANNEL, angle );
        gatedPotassiumChannelsAdded++;
        angle += angleIncrement;
      }
      if ( NUM_GATED_SODIUM_CHANNELS > 0 ) {
        this.addChannel( MembraneChannelTypes.SODIUM_GATED_CHANNEL, angle );
        gatedSodiumChannelsAdded++;
        angle += angleIncrement;
      }
      if ( NUM_POTASSIUM_LEAK_CHANNELS > 0 ) {
        this.addChannel( MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL, angle );
        potassiumLeakChannelsAdded++;
        angle += angleIncrement;
      }

      // Now loop through the rest of the membrane's circumference adding the various types of gates.
      for ( let i = 0; i < totalNumChannels - 4; i++ ) {
        // Calculate the "urgency" for each type of gate.
        const gatedSodiumUrgency = NUM_GATED_SODIUM_CHANNELS / gatedSodiumChannelsAdded;
        const gatedPotassiumUrgency = NUM_GATED_POTASSIUM_CHANNELS / gatedPotassiumChannelsAdded;
        const potassiumLeakUrgency = NUM_POTASSIUM_LEAK_CHANNELS / potassiumLeakChannelsAdded;
        const sodiumLeakUrgency = NUM_SODIUM_LEAK_CHANNELS / sodiumLeakChannelsAdded;
        let channelTypeToAdd = null;
        if ( gatedSodiumUrgency >= gatedPotassiumUrgency && gatedSodiumUrgency >= potassiumLeakUrgency &&
             gatedSodiumUrgency >= sodiumLeakUrgency ) {
          // Add a gated sodium channel.
          channelTypeToAdd = MembraneChannelTypes.SODIUM_GATED_CHANNEL;
          gatedSodiumChannelsAdded++;
        }
        else if ( gatedPotassiumUrgency > gatedSodiumUrgency && gatedPotassiumUrgency >= potassiumLeakUrgency &&
                  gatedPotassiumUrgency >= sodiumLeakUrgency ) {
          // Add a gated potassium channel.
          channelTypeToAdd = MembraneChannelTypes.POTASSIUM_GATED_CHANNEL;
          gatedPotassiumChannelsAdded++;
        }
        else if ( potassiumLeakUrgency > gatedSodiumUrgency && potassiumLeakUrgency > gatedPotassiumUrgency && potassiumLeakUrgency >= sodiumLeakUrgency ) {
          // Add a potassium leak channel.
          channelTypeToAdd = MembraneChannelTypes.POTASSIUM_LEAKAGE_CHANNEL;
          potassiumLeakChannelsAdded++;
        }
        else if ( sodiumLeakUrgency > gatedSodiumUrgency && sodiumLeakUrgency > gatedPotassiumUrgency && sodiumLeakUrgency > potassiumLeakUrgency ) {
          // Add a sodium leak channel.
          channelTypeToAdd = MembraneChannelTypes.SODIUM_LEAKAGE_CHANNEL;
          sodiumLeakChannelsAdded++;
        }
        else {
          assert && assert( false ); // Should never get here, so debug if it does.
        }

        this.addChannel( channelTypeToAdd, angle );
        angle += angleIncrement;
      }
    } )();

    // Note: It is expected that the model will be reset once it has been created, and this will set the initial state,
    // including adding the particles to the model.
    this.timeProperty.link( this.updateRecordPlayBack.bind( this ) );
    this.modeProperty.link( this.updateRecordPlayBack.bind( this ) );

    this.reset(); // This does initialization
  }

  /**
   * dispatched from NeuronClockModelAdapter's step function
   * @param {number} dt - delta time, in seconds
   * @public
   */
  step( dt ) {

    if ( dt < 0 ) {

      // this is a backwards time step, so make sure that we are in the playback mode
      this.setPlayback();

      // If the current simulation time is past the end of the max recorded time, set the time to the max recorded
      // value so that the cursor will appear on the chart (if visible), thus allowing the user to interact with it.
      if ( this.getTime() > this.getMaxRecordedTime() ) {
        this.setTime( this.getMaxRecordedTime() );
      }
    }

    super.step( dt );

    // If we are currently in playback mode and we have reached the end of the recorded data, we should automatically
    // switch to record mode.
    if ( this.isPlayback() && this.getTime() >= this.getMaxRecordedTime() ) {
      this.setModeRecord();
      this.setPlaying( true );
    }
  }

  /**
   * Step the actual mode, which is done by stepping each of the constituent elements of the model.  This is called
   * by the active RecordAndPlayback Model mode, see the RecordAndPlayBackModel step function.
   * @param {number} dt
   * @returns {NeuronModelState}
   * @public
   */
  stepInTime( dt ) {

    // Step the membrane in time.  This is done prior to stepping the HH model because the traveling action potential
    // is part of the membrane, so if it reaches the cross section in this time step the membrane potential will be
    // modified.
    this.axonMembrane.stepInTime( dt );

    // This is a step forward in time.  Update the value of the membrane potential by stepping the Hodgkins-Huxley
    // model.
    this.hodgkinHuxleyModel.stepInTime( dt );

    // There is a bit of a threshold on sending out notifications of membrane voltage changes, since otherwise the
    // natural "noise" in the model causes notifications to be sent out continuously.
    if ( Math.abs( this.membranePotentialProperty.get() - this.hodgkinHuxleyModel.getMembraneVoltage() ) > MEMBRANE_POTENTIAL_CHANGE_THRESHOLD ) {
      this.membranePotentialProperty.set( this.hodgkinHuxleyModel.getMembraneVoltage() );
    }

    // Update the stimulus lockout state.
    this.updateStimulusLockoutState();

    // OPTIMIZATION NOTE: For better performance, and because the contents of the observable arrays are not being
    // modified, the following loops reach into the observable arrays and loop on the regular array contained within.

    // Step the channels.
    this.membraneChannels.forEach( channel => {
      channel.stepInTime( dt );
    } );

    this.transientParticles.forEach( particle => {
      particle.stepInTime( dt );
    } );

    // Step the background particles, which causes them to exhibit a
    // little Brownian motion
    this.backgroundParticles.forEach( particle => {
      particle.stepInTime( dt );
    } );

    // Adjust the overall potassium and sodium concentration levels based parameters of the HH model.  This is done
    // solely to provide values that can be displayed to the user, and are not used for anything else in the model.
    let concentrationChanged = this.concentrationChangedProperty.set( false );
    let difference;
    const potassiumConductance = this.hodgkinHuxleyModel.get_delayed_n4( CONCENTRATION_READOUT_DELAY );
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
        difference = this.potassiumExteriorConcentration - NOMINAL_POTASSIUM_EXTERIOR_CONCENTRATION;
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
        difference = NOMINAL_POTASSIUM_INTERIOR_CONCENTRATION - this.potassiumInteriorConcentration;
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
    const sodiumConductance = this.hodgkinHuxleyModel.get_delayed_m3h( CONCENTRATION_READOUT_DELAY );
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
        difference = NOMINAL_SODIUM_EXTERIOR_CONCENTRATION - this.sodiumExteriorConcentration;
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
        difference = this.sodiumInteriorConcentration - NOMINAL_SODIUM_INTERIOR_CONCENTRATION;
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
      this.concentrationChangedProperty.set( true );
    }

    // Update the flag that indicates whether these is at least one particle present in the model.
    this.atLeastOneParticlePresentProperty.set( ( this.backgroundParticles.length +
                                                  this.transientParticles.length +
                                                  this.playbackParticles.length ) > 0 );

    // Emit the event that lets the view know that the particles should be redrawn.
    this.particlesMoved.emit();

    // If any one channel's state is changed, trigger a channel representation changed event
    const channelStateChanged = membraneChannel => membraneChannel.channelStateChangedProperty.get();
    if ( _.some( this.membraneChannels, channelStateChanged ) ) {
      this.channelRepresentationChanged.emit();
    }

    // Return model state after each time step.
    return this.getState();
  }

  /**
   * update some properties that can change as playback progresses
   * @protected
   */
  updateRecordPlayBack() {
    this.updateStimulusLockoutState();
    this.updateSimAndPlaybackParticleVisibility();
  }

  /**
   * Reset the neuron model.  This should restore everything to the initial state.
   * @public
   */
  reset() {

    // Reset the superclass, which contains the recording state & data.
    super.resetAll();

    // Reset the axon membrane.
    this.axonMembrane.reset();

    // Remove all existing particles.
    this.removeAllParticles();

    // Reset the HH model.
    this.hodgkinHuxleyModel.reset();

    // Reset all membrane channels.
    this.membraneChannels.forEach( membraneChannel => {
      membraneChannel.reset();
    } );

    // Send notification of membrane channel change to make sure that channels are re-rendered.
    this.channelRepresentationChanged.emit();

    // Reset the concentration readout values.
    let concentrationChanged = this.concentrationChangedProperty.set( false );
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

    // Set the state of 'all ions simulated'.  If the default is on, cycle it off first to force a change so that
    // background particles are added.
    if ( DEFAULT_FOR_SHOW_ALL_IONS === true ) {
      this.setAllIonsSimulated( false );
    }
    this.setAllIonsSimulated( DEFAULT_FOR_SHOW_ALL_IONS );

    // Set the state of the record-and-playback model to be "live" (neither recording nor playing) and unpaused.
    this.clearHistory();
    this.setModeLive();
    this.setPlaying( true );
  }

  /**
   * Clear the recorded data.
   * @public
   * @override
   */
  clearHistory() {
    this.transientParticlesBackup.clear();
    super.clearHistory();
  }

  /**
   * Starts a particle of the specified type moving through the specified channel.  If one or more particles of the
   * needed type exist within the capture zone for this channel, one will be chosen and set to move through, and
   * another will be created to essentially take its place (though the newly created one will probably be in a
   * slightly different place for better visual effect).  If none of the needed particles exist, two will be created,
   * and one will move through the channel and the other will just hang out in the zone.
   *
   * Note that it is not guaranteed that the particle will make it through the channel, since it is possible that the
   * channel could close before the particle goes through it.
   *
   * @param {ParticleType.string} particleType
   * @param {MembraneChannel}channel
   * @param {number} maxVelocity
   * @param {MembraneCrossingDirection.string} direction
   * @public
   */
  requestParticleThroughChannel( particleType, channel, maxVelocity, direction ) {
    let captureZone;
    if ( direction === MembraneCrossingDirection.IN_TO_OUT ) {
      captureZone = channel.getInteriorCaptureZone();
    }
    else {
      captureZone = channel.getExteriorCaptureZone();
    }

    const particleToCapture = this.createTransientParticle( particleType, captureZone );

    // Make the particle fade in.
    particleToCapture.setFadeStrategy( new TimedFadeInStrategy( 0.0005 ) );

    // Set a motion strategy that will cause this particle to move across the membrane.
    channel.moveParticleThroughNeuronMembrane( particleToCapture, maxVelocity );
  }

  /**
   * Return a value indicating whether simulation of all ions is currently turned on in the simulation.  And yes, it
   * would be more grammatically correct to set "areAllIonsSimulated", but we are sticking with the convention for
   * boolean variables.  So get over it.
   * @public
   */
  isAllIonsSimulated() {
    return this.allIonsSimulatedProperty.get();
  }

  /**
   * Set the boolean value that indicates whether all ions are shown in the simulation, or just those that are moving
   * across the membrane.
   * @param {boolean} allIonsSimulated
   * @public
   */
  setAllIonsSimulated( allIonsSimulated ) {
    this.allIonsSimulatedProperty.set( allIonsSimulated );
  }

  /**
   * Add the "bulk particles", which are particles that are inside and outside of the membrane and, except in cases
   * where they happen to end up positioned close to the membrane, they generally stay where initially positioned.
   * @private
   */
  addInitialBulkParticles() {
    // Make a list of pre-existing particles.
    const preExistingParticles = _.clone( this.transientParticles );

    // Add the initial particles.
    this.addBackgroundParticles( ParticleType.SODIUM_ION, ParticlePosition.INSIDE_MEMBRANE, NUM_SODIUM_IONS_INSIDE_CELL );
    this.addBackgroundParticles( ParticleType.SODIUM_ION, ParticlePosition.OUTSIDE_MEMBRANE, NUM_SODIUM_IONS_OUTSIDE_CELL );
    this.addBackgroundParticles( ParticleType.POTASSIUM_ION, ParticlePosition.INSIDE_MEMBRANE, NUM_POTASSIUM_IONS_INSIDE_CELL );
    this.addBackgroundParticles( ParticleType.POTASSIUM_ION, ParticlePosition.OUTSIDE_MEMBRANE, NUM_POTASSIUM_IONS_OUTSIDE_CELL );

    // Look at each sodium gate and, if there are no ions in its capture zone, add some.
    this.membraneChannels.forEach( membraneChannel => {
      if ( membraneChannel instanceof SodiumDualGatedChannel ) {
        const captureZone = membraneChannel.getExteriorCaptureZone();
        const numParticlesInZone = this.scanCaptureZoneForFreeParticles( captureZone, ParticleType.SODIUM_ION );
        if ( numParticlesInZone === 0 ) {
          this.addBackgroundParticlesToZone( ParticleType.SODIUM_ION, captureZone, Math.floor( dotRandom.nextDouble() * 2 ) + 1 );
        }
      }
    } );

    // Set all new particles to exhibit simple Brownian motion.
    this.backgroundParticles.forEach( backgroundParticle => {
      if ( preExistingParticles.indexOf( backgroundParticle ) === -1 ) {
        backgroundParticle.setMotionStrategy( new SlowBrownianMotionStrategy( backgroundParticle.getPositionX(), backgroundParticle.getPositionY() ) );
      }
    } );
  }

  /**
   * Create a particle of the specified type in the specified capture zone. In general, this method will be used when
   * a particle is or may soon be needed to travel through a membrane channel.
   * @param {ParticleType.string} particleType
   * @param {CaptureZone} captureZone
   * @returns {Particle}
   * @private
   */
  createTransientParticle( particleType, captureZone ) {
    const newParticle = ParticleFactory.createParticle( particleType );
    this.transientParticles.add( newParticle );
    if ( captureZone ) {

      // to avoid creation of new Vector2 instances the capture zone updates the particles position
      captureZone.assignNewParticlePosition( newParticle );
    }
    newParticle.continueExistingProperty.lazyLink( newValue => {
      if ( !newValue ) {
        this.transientParticles.remove( newParticle );
      }
    } );
    return newParticle;
  }

  /**
   * Add the specified particles to the model.
   * @param {ParticleType.string} particleType
   * @param {ParticlePosition} position
   * @param {number} numberToAdd
   * @private
   */
  addBackgroundParticles( particleType, position, numberToAdd ) {
    let newParticle = null;
    _.times( numberToAdd, value => {
      newParticle = this.createBackgroundParticle( particleType );
      if ( position === ParticlePosition.INSIDE_MEMBRANE ) {
        this.positionParticleInsideMembrane( newParticle );
      }
      else {
        this.positionParticleOutsideMembrane( newParticle );
      }
      // Set the opacity.
      if ( dotRandom.nextDouble() >= 0.5 ) { // replaced for nextBoolean
        newParticle.setOpacity( FOREGROUND_PARTICLE_DEFAULT_OPACITY );
      }
      else {
        newParticle.setOpacity( BACKGROUND_PARTICLE_DEFAULT_OPACITY );
      }
    } );
  }

  /**
   * Add the specified particles to the given capture zone.
   * @param {ParticleType.string} particleType
   * @param {CaptureZone} captureZone
   * @param {number} numberToAdd
   * @private
   */
  addBackgroundParticlesToZone( particleType, captureZone, numberToAdd ) {
    let newParticle = null;
    for ( let i = 0; i < numberToAdd; i++ ) {
      newParticle = this.createBackgroundParticle( particleType );
      newParticle.setOpacity( FOREGROUND_PARTICLE_DEFAULT_OPACITY );
      captureZone.assignNewParticlePosition( newParticle );
    }
  }

  // @public
  initiateStimulusPulse() {
    if ( !this.isStimulusInitiationLockedOut() ) {
      this.stimulusPulseInitiatedProperty.set( true );
      this.axonMembrane.initiateTravelingActionPotential();
      this.updateStimulusLockoutState();
      if ( window.phet.neuron.profiler && window.phet.neuron.profiler.setting === 2 ) {
        // If enabled, start collecting profiling data, which will automatically be spat out to the console (or as
        // an alert dialog on iOS) when completed.  The duration value is empirically determined to be the time for
        // the traveling action potential to make it to the cross section.
        window.phet.neuron.profiler.startDataAnalysis( 3000 );
      }
      else if ( window.phet.neuron.profiler && window.phet.neuron.profiler.setting === 3 ) {
        // If enabled, start collecting profiling data, which will automatically be spat out to the console (or as
        // an alert dialog on iOS) when completed.  The duration value is empirically determined to be the time for
        // the traveling action potential to make it to the cross section, the particles to appear, cross the
        // membrane, and then fade out.
        window.phet.neuron.profiler.startDataAnalysis( 9500 );
      }
    }
  }

  /**
   * Place a particle at a random position inside the axon membrane.
   * @param {Particle} particle
   * @private
   */
  positionParticleInsideMembrane( particle ) {
    // Choose any angle.
    const angle = dotRandom.nextDouble() * Math.PI * 2;

    // Choose a distance from the cell center that is within the membrane. The multiplier value is created with the
    // intention of weighting the positions toward the outside in order to get an even distribution per unit area.
    const multiplier = Math.max( dotRandom.nextDouble(), dotRandom.nextDouble() );
    const distance = ( this.crossSectionInnerRadius - particle.getRadius() * 2 ) * multiplier;
    particle.setPosition( distance * Math.cos( angle ), distance * Math.sin( angle ) );
  }

  /**
   * Returns a boolean values indicating whether or not an action potential is in progress.  For the purposes of this
   * sim, this means whether there is an AP traveling down the membrane or if the flow of ions through the channels at
   * the transverse cross section is enough to be considered part of an AP.
   * @returns {boolean}
   * @public
   */
  isActionPotentialInProgress() {
    return this.axonMembrane.getTravelingActionPotential() ||
           Math.abs( this.hodgkinHuxleyModel.get_k_current() ) > POTASSIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL ||
           Math.abs( this.hodgkinHuxleyModel.get_na_current() ) > SODIUM_CURRENT_THRESH_FOR_ACTION_POTENTIAL ||
           Math.abs( this.hodgkinHuxleyModel.get_l_current() ) > LEAKAGE_CURRENT_THRESH_FOR_ACTION_POTENTIAL;
  }

  /**
   * Place a particle at a random position outside the axon membrane.
   * @param {Particle} particle
   * @private
   */
  positionParticleOutsideMembrane( particle ) {

    // Choose any angle.
    const angle = dotRandom.nextDouble() * Math.PI * 2;

    // Choose a distance from the cell center that is outside of the
    // membrane. The multiplier value is created with the intention of
    // weighting the positions toward the outside in order to get an even
    // distribution per unit area.
    const multiplier = dotRandom.nextDouble();
    const distance = this.crossSectionOuterRadius + particle.getRadius() * 4 +
                     multiplier * this.crossSectionOuterRadius * 2.2;

    particle.setPosition( distance * Math.cos( angle ), distance * Math.sin( angle ) );
  }

  /**
   * Scan the supplied capture zone for particles of the specified type.
   * @param {CaptureZone} zone
   * @param {ParticleType.string} particleType
   * @returns {number}
   * @private
   */
  scanCaptureZoneForFreeParticles( zone, particleType ) {
    let closestFreeParticle = null;
    let distanceOfClosestParticle = Number.POSITIVE_INFINITY;
    let totalNumberOfParticles = 0;
    const captureZoneOrigin = zone.getOriginPoint();

    // loop over the contained array - this is faster, but the array can't be modified
    this.transientParticles.forEach( particle => {

      // This method is refactored to use position x,y components instead of vector2 instances
      if ( ( particle.getType() === particleType ) && ( particle.isAvailableForCapture() ) && ( zone.isPointInZone( particle.getPositionX(), particle.getPositionY() ) ) ) {
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
  }

  // @private
  updateStimulusLockoutState() {
    if ( this.stimulusLockoutProperty.get() ) {
      // Currently locked out, see if that should change.
      if ( !this.isPlayback() && !this.isActionPotentialInProgress() ) {
        this.setStimulusLockout( false );
      }
    }
    else {
      // Currently locked out, see if that should change.
      // Currently NOT locked out, see if that should change.
      const backwards = this.getTime() - this.getMaxRecordedTime() <= 0;
      if ( this.isActionPotentialInProgress() || ( this.isPlayback() && backwards ) ) {
        this.setStimulusLockout( true );
      }
    }
  }

  /**
   * There are two sets of particles in this simulation, one set that is used when actually simulating, and one that
   * is used when playing back.  This routine updates which set is visible based on state information.
   * @private
   */
  updateSimAndPlaybackParticleVisibility() {

    if ( this.isRecord() || this.isLive() ) {

      // In either of these modes, the simulation particles (as opposed to the playback particles) should be visible.
      // Make sure that this is the case.
      if ( this.playbackParticlesVisibleProperty.get() ) {

        // Hide the playback particles.  This is done by removing them from the model.
        this.playbackParticles.clear();

        // Show the simulation particles.
        this.transientParticles.addAll( this.transientParticlesBackup.slice() );
        this.transientParticlesBackup.clear();

        // Update the state variable.
        this.playbackParticlesVisibleProperty.set( false );
      }
    }
    else if ( this.isPlayback() ) {

      // The playback particles should be showing and the simulation particles should be hidden.  Make sure that this
      // is the case.
      if ( !this.playbackParticlesVisibleProperty.get() ) {

        // Hide the simulation particles.  This is done by making a backup copy of them (so that they can be added
        // back later) and then removing them from the model.
        this.transientParticlesBackup.addAll( this.transientParticles );
        this.transientParticles.clear();

        // Note that we don't explicitly add the playback particles
        // here.  That is taken care of when the playback state is
        // set.  Here we only set the flag.
        this.playbackParticlesVisibleProperty.set( true );
      }

      // Trigger the event that lets the view know that the particles should be redrawn.
      this.particlesMoved.emit();
    }

    // else ignore the state, which is null during init and reset
  }

  /**
   * Get the state of this model.  This is generally used in support of the record-and-playback feature, and the
   * return value contains just enough state information to support this feature.
   * @returns {NeuronModelState}
   * @public
   */
  getState() {
    return new NeuronModelState( this );
  }

  /**
   * @returns {AxonMembrane}
   * @public
   */
  getAxonMembrane() {
    return this.axonMembrane;
  }

  /**
   * @returns {number}
   * @public
   */
  getSodiumInteriorConcentration() {
    if ( this.isPlayback() ) {
      return this.neuronModelPlaybackStateProperty.get().getSodiumInteriorConcentration();
    }
    else {
      return this.sodiumInteriorConcentration;
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getSodiumExteriorConcentration() {
    if ( this.isPlayback() ) {
      return this.neuronModelPlaybackStateProperty.get().getSodiumExteriorConcentration();
    }
    else {
      return this.sodiumExteriorConcentration;
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getPotassiumInteriorConcentration() {
    if ( this.isPlayback() ) {
      return this.neuronModelPlaybackStateProperty.get().getPotassiumInteriorConcentration();
    }
    else {
      return this.potassiumInteriorConcentration;
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getPotassiumExteriorConcentration() {
    if ( this.isPlayback() ) {
      return this.neuronModelPlaybackStateProperty.get().getPotassiumExteriorConcentration();
    }
    else {
      return this.potassiumExteriorConcentration;
    }
  }

  /**
   * Create a particle of the specified type and add it to the model.
   * @param {ParticleType.string} particleType
   * @returns {Particle}
   * @private
   */
  createBackgroundParticle( particleType ) {
    const newParticle = ParticleFactory.createParticle( particleType );
    this.backgroundParticles.add( newParticle );
    newParticle.continueExistingProperty.lazyLink( newValue => {
      if ( newValue === false ) {
        this.backgroundParticles.remove( newParticle );
      }
    } );
    return newParticle;
  }

  // @private
  removeAllParticles() {
    this.transientParticles.clear();
    this.backgroundParticles.clear();
  }

  /**
   * Add the provided channel at the specified rotational position. Positions are specified in terms of where on the
   * circle of the membrane they are, with a value of 0 being on the far right, PI/2 on the top, PI on the far left,
   * etc.
   * @param {MembraneChannelTypes} membraneChannelType
   * @param {number} angle
   * @private
   */
  addChannel( membraneChannelType, angle ) {
    const membraneChannel = MembraneChannelFactory.createMembraneChannel( membraneChannelType, this, this.hodgkinHuxleyModel );
    const radius = this.axonMembrane.getCrossSectionDiameter() / 2;
    const newPosition = new Vector2( radius * Math.cos( angle ), radius * Math.sin( angle ) );

    // Position the channel on the membrane.
    membraneChannel.setRotationalAngle( angle );
    membraneChannel.setCenterPosition( newPosition );

    // Add the channel and let everyone know it exists.
    this.membraneChannels.push( membraneChannel );
  }

  /**
   * Get a boolean value that indicates whether the initiation of a new stimulus (i.e. action potential) is currently
   * locked out.  This is done to prevent the situation where multiple action potentials are moving down the membrane
   * at the same time.
   * @returns {boolean}
   * @public
   */
  isStimulusInitiationLockedOut() {
    return this.stimulusLockoutProperty.get();
  }

  /**
   * @param {boolean} isVisible
   * @public
   */
  setPotentialChartVisible( isVisible ) {
    this.potentialChartVisibleProperty.set( isVisible );
  }

  /**
   * @returns {boolean}
   * @public
   */
  isConcentrationReadoutVisible() {
    return this.concentrationReadoutVisibleProperty.get();
  }

  /**
   * @param {boolean} isVisible
   * @public
   */
  setConcentrationReadoutVisible( isVisible ) {
    this.concentrationReadoutVisibleProperty.set( isVisible );
  }

  /**
   * @returns {boolean}
   * @public
   */
  isChargesShown() {
    return this.chargesShownProperty.get();
  }

  /**
   * @param {boolean} chargesShown
   * @public
   */
  setChargesShown( chargesShown ) {
    this.chargesShownProperty.set( chargesShown );
  }

  /**
   * @returns {boolean}
   * @public
   */
  isPotentialChartVisible() {
    return this.potentialChartVisibleProperty.get();
  }

  /**
   * @param {boolean} lockout
   * @private
   */
  setStimulusLockout( lockout ) {
    this.stimulusLockoutProperty.set( lockout );
    if ( !lockout ) {
      this.stimulusPulseInitiatedProperty.set( false );
    }
  }

  /**
   * @returns {number}
   * @public
   */
  getMembranePotential() {
    if ( this.isPlayback() ) {
      return this.neuronModelPlaybackStateProperty.get().getMembranePotential();
    }
    else {
      return this.hodgkinHuxleyModel.getMembraneVoltage();
    }
  }

  /**
   * Set the playback state, which is the state that is presented to the user during playback.  The provided state
   * variable defines the state of the simulation that is being set.
   * @param {NeuronModelState} state
   * @public
   */
  setPlaybackState( state ) {
    this.concentrationChangedProperty.set( false );

    // Set the membrane channel state.
    this.axonMembrane.setState( state.getAxonMembraneState() );

    // Set the state of the Hodgkin-Huxley model.
    this.hodgkinHuxleyModel.setState( state.getHodgkinHuxleyModelState() );

    // Set the states of the membrane channels.
    this.membraneChannels.forEach( membraneChannel => {
      const mcs = state.getMembraneChannelStateMap().get( membraneChannel );
      // Error handling.
      if ( mcs === null ) {
        assert && assert( false, ' NeuronModel  Error: No state found for membrane channel.' );
        return;
      }
      // Restore the state.
      membraneChannel.setState( mcs );
    } );

    // Set the state of the playback particles.  This maps the particle mementos in to the playback particles so that
    // we don't have to delete and add back a bunch of particles at each step.
    const additionalPlaybackParticlesNeeded = state.getPlaybackParticleMementos().length - this.playbackParticles.length;
    if ( additionalPlaybackParticlesNeeded > 0 ) {
      _.times( additionalPlaybackParticlesNeeded, () => {
        const newPlaybackParticle = new PlaybackParticle();
        this.playbackParticles.push( newPlaybackParticle );
      } );
    }
    else if ( additionalPlaybackParticlesNeeded < 0 ) {
      _.times( Math.abs( additionalPlaybackParticlesNeeded ), () => {
        this.playbackParticles.pop();// remove the last item
      } );
    }

    // Set playback particle states from the mementos.
    let playbackParticleIndex = 0;
    const mementos = state.getPlaybackParticleMementos();
    mementos.forEach( memento => {
      this.playbackParticles.get( playbackParticleIndex ).restoreFromMemento( memento );
      playbackParticleIndex++;
    } );

    this.neuronModelPlaybackStateProperty.set( state );
    this.membranePotentialProperty.set( state.getMembranePotential() );

    // For the sake of simplicity, always send out notifications for the concentration changes.
    this.concentrationChangedProperty.set( true );

    // If any one channel's state is changed, emit a channel representation changed event
    const channelStateChanged = membraneChannel => membraneChannel.channelStateChangedProperty.get();
    if ( _.some( this.membraneChannels, channelStateChanged ) ) {
      this.channelRepresentationChanged.emit();
    }
  }
}

neuron.register( 'NeuronModel', NeuronModel );

export default NeuronModel;
