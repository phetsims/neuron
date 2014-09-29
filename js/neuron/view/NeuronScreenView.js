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
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var Image = require( 'SCENERY/nodes/Image' );
  var HSlider = require( 'SUN/HSlider' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var Transform3 = require( 'DOT/Transform3' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Property = require( 'AXON/Property' );
  var ToggleProperty = require( 'AXON/ToggleProperty' );
  var Text = require( 'SCENERY/nodes/Text' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var AxonBodyNode = require( 'NEURON/neuron/view/AxonBodyNode' );
  var ParticlesNode = require( 'NEURON/neuron/view/ParticlesNode' );
  var AxonCrossSectionNode = require( 'NEURON/neuron/view/AxonCrossSectionNode' );
  var MembraneChannelNode = require( 'NEURON/neuron/view/MembraneChannelNode' );
  var MembranePotentialChart = require( 'NEURON/neuron/view/MembranePotentialChart' );
  var IonsAndChannelsLegendPanel = require( 'NEURON/neuron/controlpanel/IonsAndChannelsLegendPanel' );

  var PlayPauseButton = require( 'SCENERY_PHET/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/StepButton' );


  // images
  var mockupImage = require( 'image!NEURON/neuron-mockup.png' );
  // constants


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
    thisView.model = neuronClockModelAdapter.model; // model is neuronmodel
    ScreenView.call( thisView, {renderer: 'svg', layoutBounds: ScreenView.UPDATED_LAYOUT_BOUNDS} );

    var viewPortPosition = new Vector2( thisView.layoutBounds.width * 0.40, thisView.layoutBounds.height * 0.35 );
    // Set up the model-canvas transform.
    thisView.mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO, viewPortPosition,
      1.8 ); // 3.9 Scale factor - smaller numbers "zoom out", bigger ones "zoom in".


    // Create and add the Reset All Button in the bottom right
    //TODO: Wire up the reset all button to the model's reset function
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        thisView.model.reset();
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


    var zoomableWorldNode = new Node( {
      clipArea: Shape.rect( 0, 0, this.layoutBounds.maxX - 140, this.layoutBounds.maxY - 110 )
    } );
    thisView.addChild( zoomableWorldNode );
    var rootNode = new Node();
    zoomableWorldNode.addChild( rootNode );

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

    var particlesNode = new ParticlesNode( thisView.model, thisView.mvt, thisView.layoutBounds );
    particleLayer.addChild( particlesNode );


    // Add play/pause button
    var playToggleProperty = new ToggleProperty( true, false, neuronClockModelAdapter.pausedProperty );
    var playPauseButton = new PlayPauseButton( playToggleProperty,
      {
        bottom: thisView.layoutBounds.bottom - 25,
        centerX: thisView.layoutBounds.centerX - 18,
        radius: 25
      } );

    this.addChild( playPauseButton );

    var forwardStepButton = new StepButton( function() { neuronClockModelAdapter.stepClockWhilePaused(); }, playToggleProperty ).mutate( {scale: 1} );
    thisView.model.pausedProperty.linkAttribute( forwardStepButton, 'enabled' );
    this.addChild( forwardStepButton.mutate( {left: playPauseButton.right + 10, centerY: playPauseButton.centerY} ) );

    var backwardStepButton = new StepButton( function() { neuronClockModelAdapter.stepClockBackWhilePaused(); }, playToggleProperty ).mutate( {scale: 1} );
    thisView.model.pausedProperty.linkAttribute( backwardStepButton, 'enabled' );
    this.addChild( backwardStepButton.mutate( {left: playPauseButton.left - 50, centerY: playPauseButton.centerY} ) );

    var stimulateNeuronButton = new RectangularPushButton( {
      content: new Text( 'Stimulate Neuron', { font: BUTTON_FONT } ),
      listener: function() { thisView.model.initiateStimulusPulse(); },
      baseColor: '#c28a43',
      right: thisView.layoutBounds.maxX - 115,
      bottom: thisView.layoutBounds.maxY - 60,
      minWidth: 50,
      minHeight: 35
    } );

    this.addChild( stimulateNeuronButton );

    thisView.model.stimulasLockoutProperty.link( function( stimulasLockout ) {
      stimulateNeuronButton.enabled = !stimulasLockout;
    } );

    //TODO constructor params
    var membranePotentialChartNode = new MembranePotentialChart( null, null, thisView.model );

    // NeuronModel uses specialized real time constant clock simulation
    // The clock adapter calculates the appropriate dt and dispatches it to the interested model
    neuronClockModelAdapter.registerStepCallback( thisView.model.step.bind( thisView.model ) );
    neuronClockModelAdapter.registerStepCallback( membranePotentialChartNode.step.bind( membranePotentialChartNode ) );

    neuronClockModelAdapter.simulationTimeResetProperty.link( function( simulationTimeReset ) {
      if ( simulationTimeReset ) {
        membranePotentialChartNode.updateOnSimulationReset();
      }
    } );

    neuronClockModelAdapter.pausedProperty.link( function( paused ) {
      if ( paused ) {
        membranePotentialChartNode.updateOnClockPaused();
      }
    } );

    //Test for thermometer node
    var zoomProperty = new Property( 1.2 );
    var zoomSliderOptions = {
      thumbSize: new Dimension2( 15, 22 ),
      top: 150, left: 45,
      trackSize: new Dimension2( 90, 1 )
    };
    var zoomSlider = new HSlider( zoomProperty, { min: 1.2, max: 4 }, zoomSliderOptions );
    zoomSlider.rotation = -Math.PI / 2;
    this.addChild( zoomSlider );


    zoomProperty.link( function( zoomFactor ) {
      // Skew the zoom a little so that when zoomed in the membrane
      // is in a reasonable place and there is room for the chart below
      // it.
      var skewThreshold = 1.5;
      var scaleMatrix;
      var scaleAroundX;
      var scaleAroundY;
      if ( zoomFactor > skewThreshold ) {
        scaleAroundX = Math.round( viewPortPosition.x );
        scaleAroundY = (zoomFactor - skewThreshold) * thisView.model.getAxonMembrane().getCrossSectionDiameter() * 0.11;
        scaleMatrix = Matrix3.translation( scaleAroundX, scaleAroundY ).timesMatrix( Matrix3.scaling( zoomFactor, zoomFactor ) ).timesMatrix( Matrix3.translation( -scaleAroundX, -scaleAroundY ) );
      }
      else {
        scaleAroundX = (Math.round( viewPortPosition.x ));
        scaleAroundY = 0;
        scaleMatrix = Matrix3.translation( scaleAroundX, scaleAroundY ).timesMatrix( Matrix3.scaling( zoomFactor, zoomFactor ) ).timesMatrix( Matrix3.translation( -scaleAroundX, -scaleAroundY ) );

      }

      var scaleTransform = new Transform3( scaleMatrix );
      rootNode.setTransform( scaleTransform );

    } );

    var iosAndChannelsLegendPanel = new IonsAndChannelsLegendPanel();
    this.addChild( iosAndChannelsLegendPanel );
    iosAndChannelsLegendPanel.right = this.layoutBounds.maxX + 40;
    iosAndChannelsLegendPanel.top = 40;

  }

  return inherit( ScreenView, NeuronView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.

    }
  } );
} );