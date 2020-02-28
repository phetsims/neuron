// Copyright 2014-2020, University of Colorado Boulder

/**
 * The main screen class for the 'Neuron' simulation.  This is where the main model and view instances are created and
 * inserted into the framework.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Screen from '../../../../joist/js/Screen.js';
import inherit from '../../../../phet-core/js/inherit.js';
import neuron from '../../neuron.js';
import NeuronClockModelAdapter from '../model/NeuronClockModelAdapter.js';
import NeuronModel from '../model/NeuronModel.js';
import NeuronScreenView from './NeuronScreenView.js';

/**
 * Creates the model and view for the NeuronScreen
 * @constructor
 */
function NeuronScreen() {

  Screen.call( this,
    function() { return new NeuronClockModelAdapter( new NeuronModel() ); }, // clock model adapter provides constant ticks to model
    function( model ) { return new NeuronScreenView( model ); },
    { backgroundColorProperty: new Property( '#ccfefa' ) }
  );
}

neuron.register( 'NeuronScreen', NeuronScreen );

inherit( Screen, NeuronScreen );
export default NeuronScreen;