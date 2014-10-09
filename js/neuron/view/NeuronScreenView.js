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
  var ToggleProperty = require( 'AXON/ToggleProperty' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var AxonBodyNode = require( 'NEURON/neuron/view/AxonBodyNode' );
  var TransientParticlesNode = require( 'NEURON/neuron/view/TransientParticlesNode' );
  var BackgroundParticlesNode = require( 'NEURON/neuron/view/BackgroundParticlesNode' );
  var AxonCrossSectionNode = require( 'NEURON/neuron/view/AxonCrossSectionNode' );
  var MembraneChannelNode = require( 'NEURON/neuron/view/MembraneChannelNode' );
  var ConcentrationReadoutLayerNode = require( 'NEURON/neuron/view/ConcentrationReadoutLayerNode' );
  var ChargeSymbolNode = require( 'NEURON/neuron/view/ChargeSymbolNode' );
  var ZoomableNode = require( 'NEURON/neuron/view/ZoomableNode' );
  var ZoomControl = require( 'NEURON/neuron/view/ZoomControl' );
  var MembranePotentialChart = require( 'NEURON/neuron/chart/view/MembranePotentialChart' );
  var IonsAndChannelsLegendPanel = require( 'NEURON/neuron/controlpanel/IonsAndChannelsLegendPanel' );
  var AxonCrossSectionControlPanel = require( 'NEURON/neuron/controlpanel/AxonCrossSectionControlPanel' );


  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );


  // images
  var mockupImage = require( 'image!NEURON/neuron-mockup.png' );
  // constants

  //strings
  var stimulateNeuronString = require( 'string!NEURON/stimulateNeuron' );

  var BUTTON_FONT = new PhetFont( 18 );
  // Max size of the charge symbols, tweak as needed.
  var MAX_CHARGE_SYMBOL_SIZE = 5;// was 8

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
    var backgroundParticleLayer = new Node();
    var transientParticlesLayer = new Node();
    var channelLayer = new Node();
    var channelEdgeLayer = new Node();
    var chargeSymbolLayer = new Node();

    zoomableRootNode.addChild( axonBodyLayer );
    zoomableRootNode.addChild( axonCrossSectionLayer );
    zoomableRootNode.addChild( channelLayer );
    zoomableRootNode.addChild( backgroundParticleLayer );
    zoomableRootNode.addChild( transientParticlesLayer );
    zoomableRootNode.addChild( channelEdgeLayer );
    zoomableRootNode.addChild( chargeSymbolLayer );


    var axonBodyNode = new AxonBodyNode( thisView.neuronModel.axonMembrane, thisView.mvt );
    axonBodyLayer.addChild( axonBodyNode );
    var axonCrossSectionNode = new AxonCrossSectionNode( thisView.neuronModel.axonMembrane, thisView.mvt );
    axonCrossSectionLayer.addChild( axonCrossSectionNode );


    function handleChannelAdded( addedChannel ) {

      // Create the view representation for this channel.
      var channelNode = new MembraneChannelNode( addedChannel, thisView.mvt );
      channelNode.addToCanvas( channelLayer, channelEdgeLayer );// it internally adds to layers, done this way for better layering

      // Add the removal listener for if and when this channel is removed from the model.
      thisView.neuronModel.membraneChannels.addItemRemovedListener( function removalListener( removedChannel ) {
        if ( removedChannel === addedChannel ) {
          channelNode.removeFromCanvas( channelLayer, channelEdgeLayer );
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
    var forwardStepButton = new StepButton( function() { neuronClockModelAdapter.stepClockWhilePaused(); }, playToggleProperty ).mutate( {scale: 1} );
    thisView.neuronModel.pausedProperty.linkAttribute( forwardStepButton, 'enabled' );
    var backwardStepButton = new StepButton( function() { neuronClockModelAdapter.stepClockBackWhilePaused(); }, playToggleProperty ).mutate( {scale: 1, rotation: Math.PI} );
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
    //TODO: Wire up the reset all button to the model's reset function
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


    /**
     * Add the change symbols to the canvas.  These are added by going through
     * the list of channels and placing two symbols - one intended to be out
     * of the membrane one one inside of it - between each pair of gates.
     */
    function addChargeSymbols() {
      // Create a sorted list of the membrane channels in the model.
      var sortedMembraneChannels = thisView.neuronModel.membraneChannels.getArray().slice();
      sortMembraneChannelList( sortedMembraneChannels );

      // Go through the list and put charge symbols between each pair of channels.
      for ( var i = 0; i < sortedMembraneChannels.length; i++ ) {
        addChargeSymbolPair( sortedMembraneChannels[ i ], sortedMembraneChannels[ (i + 1) % sortedMembraneChannels.length ] );
      }
    }

    function addChargeSymbolPair( channel1, channel2 ) {

      var outerChargeSymbol;
      var innerChargeSymbol;
      var innerSymbolLocation = new Vector2();
      var outerSymbolLocation = new Vector2();
      var neuronCenterPoint = new Vector2( 0, 0 );  // Assumes center of neuron at (0, 0).

      calcChargeSymbolLocations( channel1.getCenterLocation(), channel2.getCenterLocation(), neuronCenterPoint, outerSymbolLocation, innerSymbolLocation );
      outerChargeSymbol = new ChargeSymbolNode( thisView.neuronModel, MAX_CHARGE_SYMBOL_SIZE, 0.1, false );
      outerChargeSymbol.setTranslation( thisView.mvt.modelToViewPosition( innerSymbolLocation ) );
      chargeSymbolLayer.addChild( outerChargeSymbol );
      innerChargeSymbol = new ChargeSymbolNode( thisView.neuronModel, MAX_CHARGE_SYMBOL_SIZE, 0.1, true );
      innerChargeSymbol.setTranslation( thisView.mvt.modelToViewPosition( outerSymbolLocation ) );
      chargeSymbolLayer.addChild( innerChargeSymbol );
    }

    /**
     * Calculate the locations of the charge symbols and set the two provided
     * points accordingly.
     *
     * @param p1
     * @param p2
     * @param center
     * @param outerPoint
     * @param innerPoint
     */
    function calcChargeSymbolLocations( p1, p2, neuronCenter, outerPoint, innerPoint ) {
      // Find the center point between the given points.
      var center = new Vector2( (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 );

      // Convert to polar coordinates.
      var radius = Math.sqrt( Math.pow( center.x - neuronCenter.x, 2 ) + Math.pow( center.y - neuronCenter.y, 2 ) );
      var angle = Math.atan2( center.y - neuronCenter.y, center.x - neuronCenter.x );

      // Add some distance to the radius to make the charge outside the cell.
      var outsideRadius = radius + 5; // Tweak as needed to position outer charge symbol. (was 4)

      // Subtract some distance from the radius to make the charge inside the cell.
      var insideRadius = radius - 4; // Tweak as needed to position outer charge symbol.(was 3 in java)

      // Convert to cartesian coordinates
      outerPoint.setXY( outsideRadius * Math.cos( angle ), outsideRadius * Math.sin( angle ) );
      innerPoint.setXY( insideRadius * Math.cos( angle ), insideRadius * Math.sin( angle ) );
    }


    /**
     * Sort the provided list of membrane channels such that they proceed in
     * clockwise order around the membrane.
     *
     * @param membraneChannels
     */
    function sortMembraneChannelList( membraneChannels ) {
      var orderChanged = true;
      while ( orderChanged ) {
        orderChanged = false;
        for ( var i = 0; i < membraneChannels.length - 1; i++ ) {
          var p1 = membraneChannels[ i ].getCenterLocation();
          var p2 = membraneChannels[ i + 1 ].getCenterLocation();
          var a1 = Math.atan2( p1.y, p1.x );
          var a2 = Math.atan2( p2.y, p2.x );
          if ( a1 > a2 ) {
            // These two need to be swapped.
            var tempChannel = membraneChannels[i ];
            membraneChannels[ i] = membraneChannels[ i + 1 ];
            membraneChannels[ i + 1] = tempChannel;
            orderChanged = true;
          }
        }
      }
    }


    addChargeSymbols();

    var transientParticleBounds = new Bounds2( 200, 20, 500, 300 ); // Can be smaller than the background particle bounds //TODO Ashraf verify with John
    var transientParticlesNode = new TransientParticlesNode( thisView.neuronModel, thisView.mvt, transientParticleBounds );
    transientParticlesLayer.addChild( transientParticlesNode );

    //create multiple background particle node each rendering a subset at a time see class BackgroundParticles
    function createBackgroundParticleCanvas() {

      //TODO Ashraf need to precisely define particles bounds,smaller the better
      var backgroundParticleBounds = new Bounds2( 160, 10, 540, 300 );
      var activeCanvasIndexProperty = [];

      var backgroundParticleCanvasCount = 0;
      var totalCount = thisView.neuronModel.backgroundParticles.getArray().length;
      var bucketSize = 100;
      backgroundParticleCanvasCount = (totalCount / bucketSize) | 0;// make it int
      if ( totalCount % bucketSize !== 0 ) {
        backgroundParticleCanvasCount++;
      }
      backgroundParticleLayer.removeAllChildren();
      totalCount = totalCount - 1; // zero based index
      _.times( backgroundParticleCanvasCount, function( canvasIndex ) {

        activeCanvasIndexProperty[canvasIndex] = new Property( "true" );
        var fromIndex = canvasIndex * bucketSize;
        var upToIndex = fromIndex + bucketSize;
        var toIndex = upToIndex > totalCount ? totalCount : upToIndex;
        var particleSlice = thisView.neuronModel.backgroundParticles.getArray().slice( fromIndex, toIndex );
        var backgroundParticlesNode = new BackgroundParticlesNode( particleSlice, thisView.mvt, backgroundParticleBounds, activeCanvasIndexProperty[canvasIndex] );
        backgroundParticleLayer.addChild( backgroundParticlesNode );

      } );

      var currentActiveBackgroundCanvasIndex = 0;
      thisView.neuronModel.particlesStateChangedProperty.link( function( newValue ) {
        _.times( backgroundParticleCanvasCount, function( canvasIndex ) {
          activeCanvasIndexProperty[canvasIndex].value = false;
        } );
        //make the background canvas rendering active on a round robin fashion
        activeCanvasIndexProperty[currentActiveBackgroundCanvasIndex].value = true;
        currentActiveBackgroundCanvasIndex++;

        if ( currentActiveBackgroundCanvasIndex > backgroundParticleCanvasCount - 1 ) {
          currentActiveBackgroundCanvasIndex = 0;
        }

      } );

    }


    var concentrationReadoutLayerNode = new ConcentrationReadoutLayerNode( thisView.neuronModel, zoomProperty, zoomableRootNode, axonCrossSectionNode );
    this.addChild( concentrationReadoutLayerNode );

    thisView.neuronModel.concentrationReadoutVisibleProperty.link( function( concentrationVisible ) {
      concentrationReadoutLayerNode.visible = concentrationVisible;
    } );

    thisView.neuronModel.backgroundParticlesRedefinedProperty.lazyLink( function( backgroundParticlesRedefined ) {
      if ( backgroundParticlesRedefined ) {

        createBackgroundParticleCanvas();

      }
    } );

    createBackgroundParticleCanvas();

  }

  return inherit( ScreenView, NeuronView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.

    }
  } );
} );