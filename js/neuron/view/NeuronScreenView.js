//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'Neuron' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var Image = require( 'SCENERY/nodes/Image' );
  var HSlider = require( 'SUN/HSlider' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var AxonBodyNode = require( 'NEURON/neuron/view/AxonBodyNode' );
  var ParticlesNode = require( 'NEURON/neuron/view/ParticlesNode' );
  var AxonCrossSectionNode = require( 'NEURON/neuron/view/AxonCrossSectionNode' );
  var MembraneChannelNode = require( 'NEURON/neuron/view/MembraneChannelNode' );


  // images
  var mockupImage = require( 'image!NEURON/neuron-mockup.png' );

  /**
   * Constructor for the NeuronView
   * @param {NeuronModel} neuronModel the model for the entire screen
   * @constructor
   */
  function NeuronView( neuronModel ) {

    var thisView = this;
    thisView.model = neuronModel;
    ScreenView.call( thisView, {layoutBounds: ScreenView.UPDATED_LAYOUT_BOUNDS} );

    // Set up the model-canvas transform.
    thisView.mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( thisView.layoutBounds.width * 0.45, thisView.layoutBounds.height * 0.45 ),
      1.8 ); // 3.9 Scale factor - smaller numbers "zoom out", bigger ones "zoom in".


    // Create and add the Reset All Button in the bottom right
    //TODO: Wire up the reset all button to the model's reset function
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        neuronModel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );


    var rootNode = new Node();
    thisView.addChild( rootNode );

    // Create the layers in the desired order.
    var axonBodyLayer = new Node();
    var axonCrossSectionLayer = new Node();
    var particleLayer = new Node();
    var channelLayer = new Node();
    var channelEdgeLayer = new Node();
    var chargeSymbolLayer = new Node();

    rootNode.addChild( axonBodyLayer );
    rootNode.addChild( axonCrossSectionLayer );
    rootNode.addChild( channelLayer );
    rootNode.addChild( particleLayer );
    rootNode.addChild( channelEdgeLayer );
    rootNode.addChild( chargeSymbolLayer );

    var axonBodyNode = new AxonBodyNode( this.model.axonMembrane, thisView.mvt );
    axonBodyLayer.addChild( axonBodyNode );
    var axonCrossSectionNode = new AxonCrossSectionNode( this.model.axonMembrane, thisView.mvt );
    axonCrossSectionLayer.addChild( axonCrossSectionNode );


    function handleChannelAdded( addedChannel ) {
      // Create the view representation for this channel.
      var channelNode = new MembraneChannelNode( addedChannel, thisView.mvt );
      channelNode.addToCanvas( channelLayer, channelEdgeLayer );// it internally adds to layers, done this way for better layering

      // Add the removal listener for if and when this channel is removed from the model.
      thisView.model.membraneChannels.addItemRemovedListener( function removalListener( removedChannel ) {
        if ( removedChannel === addedChannel ) {
          channelNode.removeFromCanvas( channelLayer, channelEdgeLayer );
          thisView.model.membraneChannels.removeItemRemovedListener( removalListener );
        }
      } );
    }

    // Add initial channel nodes.
    thisView.model.membraneChannels.forEach( handleChannelAdded );
    // Add a node on every new Channel Model
    thisView.model.membraneChannels.addItemAddedListener( handleChannelAdded );

    var particlesNode = new ParticlesNode( thisView.model, thisView.mvt );
    particleLayer.addChild( particlesNode );


    //Show the mock-up and a slider to change its transparency
    var mockupOpacityProperty = new Property( 0.8 );
    var image = new Image( mockupImage, {pickable: false} );
    mockupOpacityProperty.linkAttribute( image, 'opacity' );
    this.addChild( image );
    this.addChild( new HSlider( mockupOpacityProperty, {min: 0, max: 1}, {top: 10, left: 10} ) );
  }

  return inherit( ScreenView, NeuronView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.
    }
  } );
} );