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

  // images
  var mockupImage = require( 'image!NEURON/neuron-mockup.png' );

  /**
   * Constructor for the NeuronView
   * @param {NeuronModel} neuronModel the model for the entire screen
   * @constructor
   */
  function NeuronView( neuronModel ) {

    var thisView = this;
    this.model = neuronModel;
    ScreenView.call( thisView, {layoutBounds: ScreenView.UPDATED_LAYOUT_BOUNDS} );

    // Set up the model-canvas transform.
    // TODO:  INTERMEDIATE_RENDERING_SIZE validate
    thisView.mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( thisView.layoutBounds.width * 0.5, thisView.layoutBounds.width * 0.5 ),
      2);  // 3.9 Scale factor - smaller numbers "zoom out", bigger ones "zoom in".


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

    //Show the mock-up and a slider to change its transparency
    var mockupOpacityProperty = new Property( 0.8 );
    var image = new Image( mockupImage, {pickable: false} );
    mockupOpacityProperty.linkAttribute( image, 'opacity' );
    this.addChild( image );
    this.addChild( new HSlider( mockupOpacityProperty, {min: 0, max: 1}, {top: 10, left: 10} ) );


    // Create the layers in the desired order.
    var axonBodyNode = new AxonBodyNode( this.model.axonMembrane, thisView.mvt );
    this.addChild( axonBodyNode );


  }

  return inherit( ScreenView, NeuronView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.
    }
  } );
} );