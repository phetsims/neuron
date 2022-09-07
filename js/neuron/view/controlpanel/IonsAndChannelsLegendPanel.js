// Copyright 2014-2022, University of Colorado Boulder

/**
 * This class displays a legend, a.k.a. a key, for a set of ions and membrane
 * channels.  It simply displays information and doesn't control anything, so
 * it does not include much in the way of interactive behavior.
 *
 * @author John Blanco
 *@author Sharfudeen Ashraf (for Ghent University)
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Text, VBox } from '../../../../../scenery/js/imports.js';
import Panel from '../../../../../sun/js/Panel.js';
import neuron from '../../../neuron.js';
import NeuronStrings from '../../../NeuronStrings.js';
import NeuronConstants from '../../common/NeuronConstants.js';
import PotassiumGatedChannel from '../../model/PotassiumGatedChannel.js';
import PotassiumIon from '../../model/PotassiumIon.js';
import PotassiumLeakageChannel from '../../model/PotassiumLeakageChannel.js';
import SodiumDualGatedChannel from '../../model/SodiumDualGatedChannel.js';
import SodiumIon from '../../model/SodiumIon.js';
import SodiumLeakageChannel from '../../model/SodiumLeakageChannel.js';
import MembraneChannelNode from '../MembraneChannelNode.js';
import ParticleNode from '../ParticleNode.js';

const legendString = NeuronStrings.legend;
const potassiumGatedChannelString = NeuronStrings.potassiumGatedChannel;
const potassiumIonString = NeuronStrings.potassiumIon;
const potassiumLeakChannelString = NeuronStrings.potassiumLeakChannel;
const sodiumGatedChannelString = NeuronStrings.sodiumGatedChannel;
const sodiumIonString = NeuronStrings.sodiumIon;
const sodiumLeakChannelString = NeuronStrings.sodiumLeakChannel;

// constants
const LEGEND_TEXT_OPTIONS = { font: new PhetFont( { size: 12 } ) };
const MAX_TEXT_WIDTH = 140; // empirically determined

class IonsAndChannelsLegendPanel extends Panel {

  constructor() {

    // The model-view transforms below are used to make nodes that usually
    // reside on the canvas be of an appropriate size for inclusion on the
    // control panel.
    const PARTICLE_MVT = ModelViewTransform2.createRectangleMapping(
      new Bounds2( -3.0, -3.0, 2.0, 2.0 ), new Bounds2( -8, -8, 16, 16 ) );

    const CHANNEL_MVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, Vector2.ZERO, 4 );

    // Add the title to the list of children.
    const imageAndLabelChildren = [];
    imageAndLabelChildren.push( scaleAndFitTextItem( new Text( legendString, {
      font: new PhetFont( {
        size: 16,
        weight: 'bold'
      } )
    } ) ) );

    // Create all of the image icons, since we need to do some layout calculations before adding them to the panel.
    const iconList = [];
    const sodiumIonImageNode = new ParticleNode( new SodiumIon(), PARTICLE_MVT );
    iconList.push( sodiumIonImageNode );
    const potassiumIonImageNode = new ParticleNode( new PotassiumIon(), PARTICLE_MVT );
    iconList.push( potassiumIonImageNode );
    const sodiumDualGatedChannelNode = new MembraneChannelNode( new SodiumDualGatedChannel(), CHANNEL_MVT );
    sodiumDualGatedChannelNode.rotate( -Math.PI / 2 );
    iconList.push( sodiumDualGatedChannelNode );
    const potassiumGatedChannelNode = new MembraneChannelNode( new PotassiumGatedChannel(), CHANNEL_MVT );
    potassiumGatedChannelNode.rotate( -Math.PI / 2 );
    iconList.push( potassiumGatedChannelNode );
    const sodiumLeakageChannelNode = new MembraneChannelNode( new SodiumLeakageChannel(), CHANNEL_MVT );
    sodiumLeakageChannelNode.rotate( -Math.PI / 2 );
    iconList.push( sodiumLeakageChannelNode );
    const potassiumLeakageChannelNode = new MembraneChannelNode( new PotassiumLeakageChannel(), CHANNEL_MVT );
    potassiumLeakageChannelNode.rotate( -Math.PI / 2 );
    iconList.push( potassiumLeakageChannelNode );

    // Figure out the maximum icon width.
    let maxIconWidth = 0;
    iconList.forEach( icon => {
      maxIconWidth = icon.width > maxIconWidth ? icon.width : maxIconWidth;
    } );

    // Add the icon+caption nodes.
    imageAndLabelChildren.push( createIconAndCaptionNode( sodiumIonImageNode, maxIconWidth, sodiumIonString ) );
    imageAndLabelChildren.push( createIconAndCaptionNode( potassiumIonImageNode, maxIconWidth, potassiumIonString ) );
    imageAndLabelChildren.push( createIconAndCaptionNode( sodiumDualGatedChannelNode, maxIconWidth, sodiumGatedChannelString ) );
    imageAndLabelChildren.push( createIconAndCaptionNode( potassiumGatedChannelNode, maxIconWidth, potassiumGatedChannelString ) );
    imageAndLabelChildren.push( createIconAndCaptionNode( sodiumLeakageChannelNode, maxIconWidth, sodiumLeakChannelString ) );
    imageAndLabelChildren.push( createIconAndCaptionNode( potassiumLeakageChannelNode, maxIconWidth, potassiumLeakChannelString ) );

    // add the children to a VBox and put that on the panel
    super( new VBox( {
      children: imageAndLabelChildren,
      align: 'left',
      spacing: 5
    } ), {
      // panel options
      fill: NeuronConstants.CONTROL_PANEL_BACKGROUND,
      stroke: NeuronConstants.CONTROL_PANEL_STROKE,
      xMargin: 8,
      yMargin: 10
    } );
  }
}

// Utility function to scale and fit the text nodes within the panel's bounds
function scaleAndFitTextItem( textItemNode ) {
  const textNodeScaleFactor = Math.min( 1, MAX_TEXT_WIDTH / textItemNode.width );
  textItemNode.scale( textNodeScaleFactor );
  return textItemNode;
}

// Utility function to create an icon/caption node for inclusion in the legend.
function createIconAndCaptionNode( icon, maxIconWidth, captionText ) {
  assert && assert( icon.width <= maxIconWidth, 'maxIconWidth cannot be larger than ' );
  const centeringSpacerWidth = ( maxIconWidth - icon.width ) / 2 + 0.1; // Spacing can't be zero, hence the adder at the end.
  return new HBox( {
    spacing: 0,
    children: [
      new HStrut( centeringSpacerWidth ),
      icon,
      new HStrut( centeringSpacerWidth + 8 ), // adder empirically determined
      scaleAndFitTextItem( new Text( captionText, LEGEND_TEXT_OPTIONS ) )
    ]
  } );
}

neuron.register( 'IonsAndChannelsLegendPanel', IonsAndChannelsLegendPanel );
export default IonsAndChannelsLegendPanel;