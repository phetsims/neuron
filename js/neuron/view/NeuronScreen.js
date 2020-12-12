// Copyright 2014-2020, University of Colorado Boulder

/**
 * The main screen class for the 'Neuron' simulation.  This is where the main model and view instances are created and
 * inserted into the framework.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Screen from '../../../../joist/js/Screen.js';
import neuron from '../../neuron.js';
import NeuronClockModelAdapter from '../model/NeuronClockModelAdapter.js';
import NeuronModel from '../model/NeuronModel.js';
import NeuronScreenView from './NeuronScreenView.js';

class NeuronScreen extends Screen {

  constructor() {
    super(
      () => new NeuronClockModelAdapter( new NeuronModel() ), // clock model adapter provides constant ticks to model
      model => new NeuronScreenView( model ),
      { backgroundColorProperty: new Property( '#ccfefa' ) }
    );
  }
}

neuron.register( 'NeuronScreen', NeuronScreen );
export default NeuronScreen;