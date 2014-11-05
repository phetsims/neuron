// Copyright 2002-2014, University of Colorado Boulder

/**
 * This class displays a legend, a.k.a. a key, for a set of ions and membrane
 * channels.  It simply displays information and doesn't control anything, so
 * it does not include much in the way of interactive behavior.
 *
 * @author John Blanco
 *@author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MembraneChannelNode = require( 'NEURON/neuron/view/MembraneChannelNode' );
  var ParticleNode = require( 'NEURON/neuron/view/ParticleNode' );
  var PotassiumGatedChannel = require( 'NEURON/neuron/model/PotassiumGatedChannel' );
  var SodiumLeakageChannel = require( 'NEURON/neuron/model/SodiumLeakageChannel' );
  var PotassiumLeakageChannel = require( 'NEURON/neuron/model/PotassiumLeakageChannel' );
  var SodiumDualGatedChannel = require( 'NEURON/neuron/model/SodiumDualGatedChannel' );
  var PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  var SodiumIon = require( 'NEURON/neuron/model/SodiumIon' );

  // strings
  var legendString = require( 'string!NEURON/legend' );
  var sodiumIonString = require( 'string!NEURON/sodiumIon' );
  var potassiumIonString = require( 'string!NEURON/potassiumIon' );
  var sodiumGatedChannelString = require( 'string!NEURON/sodiumGatedChannel' );
  var potassiumGatedChannelString = require( 'string!NEURON/potassiumGatedChannel' );
  var sodiumLeakChannelString = require( 'string!NEURON/sodiumLeakChannel' );
  var potassiumLeakChannelString = require( 'string!NEURON/potassiumLeakChannel' );

  /**
   *
   * @constructor
   */
  function IonsAndChannelsLegendPanel() {

    // The model-view transforms below are used to make nodes that usually
    // reside on the canvas be of an appropriate size for inclusion on the
    // control panel.
    var PARTICLE_MVT = ModelViewTransform2.createRectangleMapping(
      new Bounds2( -3.0, -3.0, 2.0, 2.0 ), new Bounds2( -8, -8, 16, 16 ) );

    var CHANNEL_MVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO, Vector2.ZERO, 4 );


    // Add the images and labels for the ions.
    var legendTextOptions = {font: new PhetFont( { size: 12 } )};
    var imageAndLabelChildren = [];
    imageAndLabelChildren.push( new Text( legendString, {
      font: new PhetFont( { size: 16, weight: 'bold' } )} ) );

    var imageNode = new ParticleNode( new SodiumIon(), PARTICLE_MVT );
    var nodeLabelBox = new HBox( { spacing: 8, children: [ imageNode, new Text( sodiumIonString, legendTextOptions ) ] } );
    imageAndLabelChildren.push( nodeLabelBox );

    imageNode = new ParticleNode( new PotassiumIon(), PARTICLE_MVT );
    nodeLabelBox = new HBox( { spacing: 8, children: [  imageNode, new Text( potassiumIonString, legendTextOptions ) ] } );
    imageAndLabelChildren.push( nodeLabelBox );

    imageNode = new MembraneChannelNode( new SodiumDualGatedChannel(), CHANNEL_MVT );
    imageNode.rotate( -Math.PI / 2 );
    nodeLabelBox = new HBox( { spacing: 8, children: [  imageNode, new Text( sodiumGatedChannelString, legendTextOptions )] } );
    imageAndLabelChildren.push( nodeLabelBox );

    imageNode = new MembraneChannelNode( new PotassiumGatedChannel(), CHANNEL_MVT );
    imageNode.rotate( -Math.PI / 2 );
    nodeLabelBox = new HBox( { spacing: 8, children: [  imageNode, new Text( potassiumGatedChannelString, legendTextOptions ) ] } );
    imageAndLabelChildren.push( nodeLabelBox );

    imageNode = new MembraneChannelNode( new SodiumLeakageChannel(), CHANNEL_MVT );
    imageNode.rotate( -Math.PI / 2 );
    nodeLabelBox = new HBox( { spacing: 8, children: [  imageNode, new Text( sodiumLeakChannelString, legendTextOptions ) ] } );
    imageAndLabelChildren.push( nodeLabelBox );


    imageNode = new MembraneChannelNode( new PotassiumLeakageChannel(), CHANNEL_MVT );
    imageNode.rotate( -Math.PI / 2 );
    nodeLabelBox = new HBox( { spacing: 8, children: [ imageNode, new Text( potassiumLeakChannelString, legendTextOptions ) ] } );
    imageAndLabelChildren.push( nodeLabelBox );

    // vertical panel
    Panel.call( this, new VBox( {
      children: imageAndLabelChildren,
      align: 'left',
      spacing: 5
    } ), {
      // panel options
      fill: 'rgb(238,238,238)',
      xMargin: 4,
      yMargin: 6,
      lineWidth: 0
    } );
  }

  return inherit( Panel, IonsAndChannelsLegendPanel );

} );


