//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'Neuron' screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var Image = require( 'SCENERY/nodes/Image' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSlider = require( 'SUN/HSlider' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Shape = require( 'KITE/Shape' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Property = require( 'AXON/Property' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var ToggleProperty = require( 'AXON/ToggleProperty' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var AxonBodyNode = require( 'NEURON/neuron/view/AxonBodyNode' );
  var ParticlesCanvasLayerNode = require( 'NEURON/neuron/view/ParticlesCanvasLayerNode' );
  var AxonCrossSectionNode = require( 'NEURON/neuron/view/AxonCrossSectionNode' );
  var MembraneChannelNode = require( 'NEURON/neuron/view/MembraneChannelNode' );
  var ConcentrationReadoutLayerNode = require( 'NEURON/neuron/view/ConcentrationReadoutLayerNode' );
  var MembraneChannelGateCanvasNode = require( 'NEURON/neuron/view/MembraneChannelGateCanvasNode' );
  var ChargeSymbolsLayerNode = require( 'NEURON/neuron/view/ChargeSymbolsLayerNode' );
  var ZoomableNode = require( 'NEURON/neuron/view/ZoomableNode' );
  var ZoomControl = require( 'NEURON/neuron/view/ZoomControl' );
  var MembranePotentialChart = require( 'NEURON/neuron/chart/view/MembranePotentialChart' );
  var IonsAndChannelsLegendPanel = require( 'NEURON/neuron/controlpanel/IonsAndChannelsLegendPanel' );
  var AxonCrossSectionControlPanel = require( 'NEURON/neuron/controlpanel/AxonCrossSectionControlPanel' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );

  // images
  var mockupImage = require( 'image!NEURON/neuron-mockup.png' );
  //strings
  var stimulateNeuronString = require( 'string!NEURON/stimulateNeuron' );

  var BUTTON_FONT = new PhetFont( 18 );


  /**
   * Constructor for the NeuronView
   * @param {NeuronClockModelAdapter} neuronClockModelAdapter which contains the neuron
   * NeuronModel uses specialized real time constant clock simulation
   * The clock adapter calculates the appropriate real time dt and dispatches it to the actual model
   * model for the entire screen
   * @constructor
   */
  function NeuronView( neuronClockModelAdapter ) {
    var thisView = this;
    thisView.neuronModel = neuronClockModelAdapter.model; // model is neuronmodel
    ScreenView.call( thisView, {renderer: 'svg', layoutBounds: new Bounds2( 0, 0, 834, 504 )} );

    var viewPortPosition = new Vector2( thisView.layoutBounds.width * 0.42, thisView.layoutBounds.height * 0.30 );
    // Set up the model-canvas transform.
    thisView.mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO, viewPortPosition,
      1.3 ); // 3.9 Scale factor - smaller numbers "zoom out", bigger ones "zoom in".


    //Show the mock-up and a slider to change its transparency
    var mockupOpacityProperty = new Property( 0 );
    var image = new Image( mockupImage, {pickable: false} );
    mockupOpacityProperty.linkAttribute( image, 'opacity' );
    this.addChild( image );
    this.addChild( new HSlider( mockupOpacityProperty, {min: 0, max: 1}, {top: 10, left: 10} ) );

    var worldNodeClipArea = Shape.rect( 70, 0, this.layoutBounds.maxX - 280, this.layoutBounds.maxY - 110 );
    var zoomableRootNode = new Node();

    //Zommable Node zooms in and out the zoomableRootNode contents
    var zoomProperty = new Property( 1.3 );
    var zoomableWorldNode = new ZoomableNode( zoomableRootNode, zoomProperty, thisView.neuronModel, worldNodeClipArea, viewPortPosition );
    thisView.addChild( zoomableWorldNode );

    var zoomControl = new ZoomControl( thisView.neuronModel, zoomProperty, zoomProperty.value, 5 );
    this.addChild( zoomControl );
    zoomControl.top = this.layoutBounds.minY + 70;
    zoomControl.left = this.layoutBounds.minX + 25;

    // Create the layers in the desired order.
    var axonBodyLayer = new Node();
    var axonCrossSectionLayer = new Node();
    var particlesLayerNode = new Node();
    var channelLayer = new Node();
    var channelEdgeLayer = new Node();
    var chargeSymbolLayer = new ChargeSymbolsLayerNode( thisView.neuronModel, thisView.mvt );

    zoomableRootNode.addChild( axonBodyLayer );
    zoomableRootNode.addChild( axonCrossSectionLayer );
    zoomableRootNode.addChild( channelLayer );
    zoomableRootNode.addChild( particlesLayerNode );
    zoomableRootNode.addChild( channelEdgeLayer );
    zoomableRootNode.addChild( chargeSymbolLayer );


    var axonBodyNode = new AxonBodyNode( thisView.neuronModel.axonMembrane, thisView.mvt );
    axonBodyLayer.addChild( axonBodyNode );
    var axonCrossSectionNode = new AxonCrossSectionNode( thisView.neuronModel.axonMembrane, thisView.mvt );
    axonCrossSectionLayer.addChild( axonCrossSectionNode );

    //For improved performance, the channel gates are rendered directly on canvas
    //The gate drawing  depends on the visible bounds of edge nodes which is available in membranechannelnodes
    var membraneChannelNodes = new ObservableArray();

    function handleChannelAdded( addedChannel ) {

      // Create the view representation for this channel.
      var channelNode = new MembraneChannelNode( addedChannel, thisView.mvt );
      channelNode.addToCanvas( channelEdgeLayer );// it internally adds to layers, done this way for better layering
      membraneChannelNodes.add( channelNode );

      // Add the removal listener for if and when this channel is removed from the model.
      thisView.neuronModel.membraneChannels.addItemRemovedListener( function removalListener( removedChannel ) {
        if ( removedChannel === addedChannel ) {
          channelNode.removeFromCanvas( channelEdgeLayer );
          membraneChannelNodes.remove( channelNode );
          thisView.neuronModel.membraneChannels.removeItemRemovedListener( removalListener );
        }
      } );
    }

    // Add initial channel nodes.
    thisView.neuronModel.membraneChannels.forEach( handleChannelAdded );
    // Add a node on every new Channel Model
    thisView.neuronModel.membraneChannels.addItemAddedListener( handleChannelAdded );


    var recordPlayButtons = [];
    var playToggleProperty = new ToggleProperty( true, false, neuronClockModelAdapter.pausedProperty );
    var playPauseButton = new PlayPauseButton( playToggleProperty, { radius: 25 } );
    var forwardStepButton = new StepButton( function() { neuronClockModelAdapter.stepClockWhilePaused(); }, playToggleProperty );
    thisView.neuronModel.pausedProperty.linkAttribute( forwardStepButton, 'enabled' );
    var backwardStepButton = new StepButton( function() { neuronClockModelAdapter.stepClockBackWhilePaused(); }, playToggleProperty ).mutate( {rotation: Math.PI} );
    thisView.neuronModel.pausedProperty.linkAttribute( backwardStepButton, 'enabled' );

    recordPlayButtons.push( backwardStepButton );
    recordPlayButtons.push( playPauseButton );
    recordPlayButtons.push( forwardStepButton );

    var recordPlayButtonBox = new HBox( {
      children: recordPlayButtons,
      align: 'left',
      spacing: 5,
      right: thisView.layoutBounds.maxX / 2,
      bottom: thisView.layoutBounds.maxY - 30
    } );

    this.addChild( recordPlayButtonBox );


    var stimulateNeuronButton = new RectangularPushButton( {
      content: new MultiLineText( stimulateNeuronString, { font: BUTTON_FONT } ),
      listener: function() { thisView.neuronModel.initiateStimulusPulse(); },
      baseColor: '#c28a43',
      right: recordPlayButtonBox.right + 200,
      top: recordPlayButtonBox.top - 25,
      minWidth: 50,
      minHeight: 65
    } );

    this.addChild( stimulateNeuronButton );

    // Create and add the Reset All Button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        thisView.neuronModel.reset();
      },
      right: recordPlayButtonBox.right + 300,
      top: recordPlayButtonBox.top - 20
    } );
    this.addChild( resetAllButton );

    thisView.neuronModel.stimulasLockoutProperty.link( function( stimulasLockout ) {
      stimulateNeuronButton.enabled = !stimulasLockout;
      thisView.neuronModel.stimulusPulseInitiated = stimulasLockout;
    } );


    // NeuronModel uses specialized real time constant clock simulation
    // The clock adapter calculates the appropriate dt and dispatches it to the interested model
    neuronClockModelAdapter.registerStepCallback( thisView.neuronModel.step.bind( thisView.neuronModel ) );


    var panelLeftPos = this.layoutBounds.maxX - 30;

    var iosAndChannelsLegendPanel = new IonsAndChannelsLegendPanel();
    this.addChild( iosAndChannelsLegendPanel );
    iosAndChannelsLegendPanel.right = panelLeftPos;
    iosAndChannelsLegendPanel.top = 40;

    var axonCrossSectionControlPanel = new AxonCrossSectionControlPanel( thisView.neuronModel );
    this.addChild( axonCrossSectionControlPanel );
    axonCrossSectionControlPanel.right = panelLeftPos;
    axonCrossSectionControlPanel.top = iosAndChannelsLegendPanel.bottom + 20;


    var chartHeight = 120;
    var membranePotentialChartNode = new MembranePotentialChart( new Dimension2( worldNodeClipArea.bounds.width - 60, chartHeight ), neuronClockModelAdapter );
    thisView.addChild( membranePotentialChartNode );
    membranePotentialChartNode.left = worldNodeClipArea.bounds.left;
    membranePotentialChartNode.bottom = thisView.layoutBounds.maxY - 100;


    var concentrationReadoutLayerNode = new ConcentrationReadoutLayerNode( thisView.neuronModel, zoomProperty, zoomableRootNode, axonCrossSectionNode );
    this.addChild( concentrationReadoutLayerNode );

    thisView.neuronModel.concentrationReadoutVisibleProperty.link( function( concentrationVisible ) {
      concentrationReadoutLayerNode.visible = concentrationVisible;
    } );


    var channelGateBounds = new Bounds2( 250, 50, 450, 250 );
    var membraneChannelGateCanvasNode = new MembraneChannelGateCanvasNode( thisView.neuronModel, thisView.mvt, channelGateBounds );
    channelLayer.addChild( membraneChannelGateCanvasNode );

    var particlesLayerCanvasNode = new ParticlesCanvasLayerNode( thisView.neuronModel, thisView.mvt );
    particlesLayerNode.addChild( particlesLayerCanvasNode );

  }

  return inherit( ScreenView, NeuronView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.

    }
  } );
} );