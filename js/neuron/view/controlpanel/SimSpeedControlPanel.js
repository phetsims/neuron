// Copyright 2014-2020, University of Colorado Boulder

/**
 * Control panel for choosing the sim speed
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import inherit from '../../../../../phet-core/js/inherit.js';
import merge from '../../../../../phet-core/js/merge.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../../sun/js/Panel.js';
import VerticalAquaRadioButtonGroup from '../../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import neuronStrings from '../../../neuron-strings.js';
import neuron from '../../../neuron.js';
import NeuronConstants from '../../common/NeuronConstants.js';

// strings - labels for speed radio buttons
const fastForwardString = neuronStrings.fastForward;
const normalString = neuronStrings.normal;
const slowMotionString = neuronStrings.slowMotion;

/**
 * @param {Property.<number>} speedProperty
 * @param {Object} [options]
 * @constructor
 */
function SimSpeedControlPanel( speedProperty, options ) {

  options = merge( {
    fill: NeuronConstants.CONTROL_PANEL_BACKGROUND,
    stroke: NeuronConstants.CONTROL_PANEL_STROKE,
    xMargin: 8,
    yMargin: 6
  }, options );

  const radioButtonFont = NeuronConstants.CONTROL_PANEL_CONTROL_FONT;
  const speedRadioButtonGroup = new VerticalAquaRadioButtonGroup( speedProperty, [
    { node: new Text( fastForwardString, { font: radioButtonFont } ), value: 2 },
    { node: new Text( normalString, { font: radioButtonFont } ), value: 1 },
    { node: new Text( slowMotionString, { font: radioButtonFont } ), value: 0.5 }
  ], {
    radioButtonOptions: { radius: 8 },
    spacing: 8,
    touchAreaXDilation: 5
  } );

  Panel.call( this, speedRadioButtonGroup, options );
}

neuron.register( 'SimSpeedControlPanel', SimSpeedControlPanel );

inherit( Panel, SimSpeedControlPanel );
export default SimSpeedControlPanel;