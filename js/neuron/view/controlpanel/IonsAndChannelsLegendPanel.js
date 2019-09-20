// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class displays a legend, a.k.a. a key, for a set of ions and membrane
 * channels.  It simply displays information and doesn't control anything, so
 * it does not include much in the way of interactive behavior.
 *
 * @author John Blanco
 *@author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MembraneChannelNode = require( 'NEURON/neuron/view/MembraneChannelNode' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const neuron = require( 'NEURON/neuron' );
  const NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  const Panel = require( 'SUN/Panel' );
  const ParticleNode = require( 'NEURON/neuron/view/ParticleNode' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PotassiumGatedChannel = require( 'NEURON/neuron/model/PotassiumGatedChannel' );
  const PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  const PotassiumLeakageChannel = require( 'NEURON/neuron/model/PotassiumLeakageChannel' );
  const SodiumDualGatedChannel = require( 'NEURON/neuron/model/SodiumDualGatedChannel' );
  const SodiumIon = require( 'NEURON/neuron/model/SodiumIon' );
  const SodiumLeakageChannel = require( 'NEURON/neuron/model/SodiumLeakageChannel' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const legendString = require( 'string!NEURON/legend' );
  const potassiumGatedChannelString = require( 'string!NEURON/potassiumGatedChannel' );
  const potassiumIonString = require( 'string!NEURON/potassiumIon' );
  const potassiumLeakChannelString = require( 'string!NEURON/potassiumLeakChannel' );
  const sodiumGatedChannelString = require( 'string!NEURON/sodiumGatedChannel' );
  const sodiumIonString = require( 'string!NEURON/sodiumIon' );
  const sodiumLeakChannelString = require( 'string!NEURON/sodiumLeakChannel' );

  // constants
  const LEGEND_TEXT_OPTIONS = { font: new PhetFont( { size: 12 } ) };
  const MAX_TEXT_WIDTH = 140; // empirically determined

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

  /**
   *
   * @constructor
   */
  function IonsAndChannelsLegendPanel() {

    // The model-view transforms below are used to make nodes that usually
    // reside on the canvas be of an appropriate size for inclusion on the
    // control panel.
    const PARTICLE_MVT = ModelViewTransform2.createRectangleMapping(
      new Bounds2( -3.0, -3.0, 2.0, 2.0 ), new Bounds2( -8, -8, 16, 16 ) );

    const CHANNEL_MVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, Vector2.ZERO, 4 );

    // Add the title to the list of children.
    const imageAndLabelChildren = [];
    imageAndLabelChildren.push( scaleAndFitTextItem( new Text( legendString, { font: new PhetFont( { size: 16, weight: 'bold' } ) } ) ) );

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
    iconList.forEach( function( icon ) {
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
    Panel.call( this, new VBox( {
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

  neuron.register( 'IonsAndChannelsLegendPanel', IonsAndChannelsLegendPanel );

  return inherit( Panel, IonsAndChannelsLegendPanel );
} );