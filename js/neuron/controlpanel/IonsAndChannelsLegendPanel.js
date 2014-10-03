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
      yMargin: 6
    } );
  }

  return inherit( Panel, IonsAndChannelsLegendPanel );

} );


//// Copyright 2002-2011, University of Colorado
//
//package edu.colorado.phet.neuron.controlpanel;
//
//import java.awt.Color;
//import java.awt.GridBagConstraints;
//import java.awt.GridBagLayout;
//import java.awt.Image;
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//
//import javax.swing.BorderFactory;
//import javax.swing.ImageIcon;
//import javax.swing.JLabel;
//import javax.swing.JPanel;
//import javax.swing.border.BevelBorder;
//import javax.swing.border.TitledBorder;
//
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform2D;
//import edu.colorado.phet.neuron.NeuronConstants;
//import edu.colorado.phet.neuron.NeuronStrings;
//import edu.colorado.phet.neuron.model.PotassiumGatedChannel;
//import edu.colorado.phet.neuron.model.PotassiumIon;
//import edu.colorado.phet.neuron.model.PotassiumLeakageChannel;
//import edu.colorado.phet.neuron.model.SodiumDualGatedChannel;
//import edu.colorado.phet.neuron.model.SodiumIon;
//import edu.colorado.phet.neuron.model.SodiumLeakageChannel;
//import edu.colorado.phet.neuron.view.MembraneChannelNode;
//import edu.colorado.phet.neuron.view.ParticleNode;
//import edu.umd.cs.piccolo.PNode;
//

//public class IonsAndChannelsLegendPanel extends JPanel {
//
//  //------------------------------------------------------------------------
//  // Class Data
//  //------------------------------------------------------------------------
//
//  // The model-view transforms below are used to make nodes that usually
//  // reside on the canvas be of an appropriate size for inclusion on the
//  // control panel.
//  private static final ModelViewTransform2D PARTICLE_MVT = new ModelViewTransform2D(
//    new Rectangle2D.Double(-1.0, -1.0, 2.0, 2.0), new Rectangle2D.Double(-8, -8, 16, 16));
//
//  private static final ModelViewTransform2D CHANNEL_MVT = new ModelViewTransform2D(new Point2D.Double(),
//    new Point2D.Double(), 7, false);
//
//  //------------------------------------------------------------------------
//  // Constructor
//  //------------------------------------------------------------------------
//
//  public IonsAndChannelsLegendPanel() {
//
//    // Add the border around the legend.
//    BevelBorder baseBorder = (BevelBorder)BorderFactory.createRaisedBevelBorder();
//    TitledBorder titledBorder = BorderFactory.createTitledBorder( baseBorder,
//      NeuronStrings.LEGEND_TITLE,
//      TitledBorder.LEFT,
//      TitledBorder.TOP,
//      NeuronConstants.CONTROL_PANEL_TITLE_FONT,
//      Color.GRAY );
//
//    setBorder( titledBorder );
//
//    // Set the layout.
//    setLayout( new GridBagLayout() );
//
//    // Add the images and labels for the ions.
//    int row = 0;
//    PNode imageNode = new ParticleNode(new SodiumIon(), PARTICLE_MVT);
//    addLegendItem( imageNode.toImage(), NeuronStrings.LEGEND_SODIUM_ION, row++ );
//
//    imageNode = new ParticleNode(new PotassiumIon(), PARTICLE_MVT);
//    addLegendItem( imageNode.toImage(), NeuronStrings.LEGEND_POTASSIUM_ION, row++ );
//
//    imageNode = new MembraneChannelNode(new SodiumDualGatedChannel(), CHANNEL_MVT);
//    imageNode.rotate(-Math.PI / 2);
//    addLegendItem( imageNode.toImage(), NeuronStrings.LEGEND_SODIUM_GATED_CHANNEL, row++ );
//
//    imageNode = new MembraneChannelNode(new PotassiumGatedChannel(), CHANNEL_MVT);
//    imageNode.rotate(-Math.PI / 2);
//    addLegendItem( imageNode.toImage(), NeuronStrings.LEGEND_POTASSIUM_GATED_CHANNEL, row++ );
//
//    imageNode = new MembraneChannelNode(new SodiumLeakageChannel(), CHANNEL_MVT);
//    imageNode.rotate(-Math.PI / 2);
//    addLegendItem( imageNode.toImage(), NeuronStrings.LEGEND_SODIUM_LEAK_CHANNEL, row++ );
//
//    imageNode = new MembraneChannelNode(new PotassiumLeakageChannel(), CHANNEL_MVT);
//    imageNode.rotate(-Math.PI / 2);
//    addLegendItem( imageNode.toImage(), NeuronStrings.LEGEND_POTASSIUM_LEAK_CHANNEL, row++ );
//  }
//
//  /**
//   * This method adds simple legend items, i.e. those that only include an
//   * image and a label, to the legend.
//   */
//  private void addLegendItem( Image im, String label, int row ) {
//    ImageIcon icon = new ImageIcon(im);
//    GridBagConstraints constraints = new GridBagConstraints();
//    constraints.anchor = GridBagConstraints.CENTER;
//    constraints.gridx = 0;
//    constraints.gridy = row;
//    constraints.ipadx = 25;
//    constraints.ipady = 10;
//    add(new JLabel(icon), constraints);
//    constraints.ipadx = 0;
//    constraints.gridx = 1;
//    JLabel textualLabel = new JLabel( label );
//    textualLabel.setFont(NeuronConstants.CONTROL_PANEL_CONTROL_FONT);
//    add(textualLabel, constraints);
//  }
//}
