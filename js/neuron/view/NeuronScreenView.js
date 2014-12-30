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
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var Shape = require( 'KITE/Shape' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Property = require( 'AXON/Property' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var ToggleProperty = require( 'AXON/ToggleProperty' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var AxonBodyNode = require( 'NEURON/neuron/view/AxonBodyNode' );
  var ParticlesWebGLNode = require( 'NEURON/neuron/view/ParticlesWebGLNode' );
  var AxonCrossSectionNode = require( 'NEURON/neuron/view/AxonCrossSectionNode' );
  var ConcentrationReadoutLayerNode = require( 'NEURON/neuron/view/ConcentrationReadoutLayerNode' );
  var MembraneChannelGateCanvasNode = require( 'NEURON/neuron/view/MembraneChannelGateCanvasNode' );
  var ChargeSymbolsLayerNode = require( 'NEURON/neuron/view/ChargeSymbolsLayerNode' );
  var StepBackButton = require( 'SCENERY_PHET/buttons/StepBackButton' );
  var ZoomableNode = require( 'NEURON/neuron/view/ZoomableNode' );
  var ZoomControl = require( 'NEURON/neuron/view/ZoomControl' );
  var MembranePotentialChart = require( 'NEURON/neuron/chart/view/MembranePotentialChart' );
  var IonsAndChannelsLegendPanel = require( 'NEURON/neuron/controlpanel/IonsAndChannelsLegendPanel' );
  var AxonCrossSectionControlPanel = require( 'NEURON/neuron/controlpanel/AxonCrossSectionControlPanel' );
  var SimSpeedControlPanel = require( 'NEURON/neuron/controlpanel/SimSpeedControlPanel' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var Util = require( 'SCENERY/util/Util' );
  var ParticlesNode = require( 'NEURON/neuron/view/ParticlesNode' );

  // strings
  var stimulateNeuronString = require( 'string!NEURON/stimulateNeuron' );

  // constants
  var BUTTON_FONT = new PhetFont( 18 );

  /**
   * Constructor for the NeuronView
   * @param {NeuronClockModelAdapter} neuronClockModelAdapter - holds the NeuronModel which uses specialized real time constant clock
   * The clock adapter calculates the appropriate real time dt and dispatches it to the actual model
   * @constructor
   */
  function NeuronView( neuronClockModelAdapter ) {

    var thisView = this;
    thisView.neuronModel = neuronClockModelAdapter.model; // model is neuronmodel
    ScreenView.call( thisView, {renderer: 'svg', layoutBounds: new Bounds2( 0, 0, 834, 504 )} );
    var viewPortPosition = new Vector2( thisView.layoutBounds.width * 0.40, thisView.layoutBounds.height - 255 );
    // Set up the model-canvas transform.
    thisView.mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO, viewPortPosition,
      2.45 ); // 3.9 Scale factor - smaller numbers "zoom out", bigger ones "zoom in".

    var worldNodeClipArea = Shape.rect( 70, 0, this.layoutBounds.maxX - 280, this.layoutBounds.maxY - 110 );
    var zoomableRootNode = new Node();
    var minZoom = 0.7;
    var maxZoom = 6;
    var defaultZoom = 0.7;

    //Zommable Node zooms in and out the zoomableRootNode contents
    var zoomProperty = new Property( defaultZoom );
    var zoomableWorldNode = new ZoomableNode( thisView.neuronModel, zoomableRootNode, zoomProperty, worldNodeClipArea, viewPortPosition );
    thisView.addChild( zoomableWorldNode );
    var particlesWebGLParentNode = new Node();
    thisView.addChild( particlesWebGLParentNode );

    // Particles WebGL layer doesn't support bounds clipping, so a border like shape is applied and added as a top node
    // with the same color as the screen background. Now particles appear to be properly clipped.
    // ref https://github.com/phetsims/neuron/issues/7
    var clipAreaBounds = worldNodeClipArea.bounds;
    var maskingShape = new Shape();
    var maskLineWidth = 14;
    maskingShape.moveTo( clipAreaBounds.x - (maskLineWidth / 2) - 1, -maskLineWidth / 2 );
    maskingShape.lineTo( clipAreaBounds.x - (maskLineWidth / 2) - 1, clipAreaBounds.maxY + 4 );
    maskingShape.lineTo( clipAreaBounds.maxX + (maskLineWidth / 2) + 1, clipAreaBounds.maxY + 4 );
    maskingShape.lineTo( clipAreaBounds.maxX + (maskLineWidth / 2 ) + 1, -maskLineWidth / 2 );
    var maskNode = new Path( maskingShape, {stroke: NeuronConstants.SCREEN_BACKGROUND, lineWidth: maskLineWidth} );
    thisView.addChild( maskNode );


    // Create and add the layers in the desired order.
    var axonBodyLayer = new Node();
    var axonCrossSectionLayer = new Node();
    var channelLayer = new Node();
    var chargeSymbolLayer = new ChargeSymbolsLayerNode( thisView.neuronModel, thisView.mvt );

    zoomableRootNode.addChild( axonBodyLayer );
    zoomableRootNode.addChild( axonCrossSectionLayer );
    zoomableRootNode.addChild( channelLayer );
    zoomableRootNode.addChild( chargeSymbolLayer );

    var axonBodyNode = new AxonBodyNode( thisView.neuronModel.axonMembrane, thisView.mvt );
    axonBodyLayer.addChild( axonBodyNode );
    var axonCrossSectionNode = new AxonCrossSectionNode( thisView.neuronModel.axonMembrane, thisView.mvt );
    axonCrossSectionLayer.addChild( axonCrossSectionNode );

    //Channel Gate node renders both channels and edges on the same canvas
    var channelGateBounds = new Bounds2( 220, 50, 450, 250 );
    var membraneChannelGateCanvasNode = new MembraneChannelGateCanvasNode( thisView.neuronModel, thisView.mvt, channelGateBounds );
    channelLayer.addChild( membraneChannelGateCanvasNode );

    var recordPlayButtons = [];
    var playToggleProperty = new ToggleProperty( true, false, neuronClockModelAdapter.pausedProperty );
    var playPauseButton = new PlayPauseButton( playToggleProperty, { radius: 25 } );

    // Allow Step Back only if the user has initiated a StimulusPulse atleast once. Stepping back
    // without initiating a stimulus results in the accumulation of negative delta time
    // values in DelayBuffer which causes undesired behaviour.
    // If the User pauses while Stimulus in progress, Step back and StepForward action still goes back
    // and forth ONLY  between stored snapshot states (see PlayBack mode class)
    // The behaviour could reoccur after the User resets the Sim Status, so the allowStepNavigation is also reset to false

    var stepToggleProperty = DerivedProperty.multilink( [playToggleProperty, thisView.neuronModel.allowStepNavigationProperty],
      function( playToggle, allowStepNavigation ) {
        // Step and StepBack buttons are tied to PlayProperty and both enable themselves
        // when their observing property (It is assumed to be PlayProperty) is false.In this case we also have to
        // check allowStepBack
        return playToggle || !allowStepNavigation;
      } );

    var backwardStepButton = new StepBackButton(
      function() {
        neuronClockModelAdapter.stepClockBackWhilePaused();
      }, stepToggleProperty
    );

    //for consistency sake, enable the StepForward only when StepBack is enabled
    var forwardStepButton = new StepButton(
      function() { neuronClockModelAdapter.stepClockWhilePaused(); },
      stepToggleProperty );

    recordPlayButtons.push( backwardStepButton );
    recordPlayButtons.push( playPauseButton );
    recordPlayButtons.push( forwardStepButton );

    var recordPlayButtonBox = new HBox( {
      children: recordPlayButtons,
      spacing: 5,
      right: thisView.layoutBounds.maxX / 2,
      bottom: thisView.layoutBounds.maxY - 30
    } );

    this.addChild( recordPlayButtonBox );

    //space between layout edge and controls like reset,zoom control,legend,speed panel etc
    var leftPadding = 20;

    var stimulateNeuronButton = new RectangularPushButton( {
      content: new MultiLineText( stimulateNeuronString, { font: BUTTON_FONT } ),
      listener: function() { thisView.neuronModel.initiateStimulusPulse(); },
      baseColor: '#CEA269',
      right: worldNodeClipArea.bounds.maxX,
      top: recordPlayButtonBox.top - 10,
      minWidth: 50,
      minHeight: 65
    } );

    this.addChild( stimulateNeuronButton );

    thisView.neuronModel.stimulusLockoutProperty.link( function( stimulusLockout ) {
      stimulateNeuronButton.enabled = !stimulusLockout;
    } );

    // NeuronModel uses specialized real time constant clock simulation
    // The clock adapter calculates the appropriate dt and dispatches it to the interested model
    neuronClockModelAdapter.registerStepCallback( thisView.neuronModel.step.bind( thisView.neuronModel ) );

    var panelLeftPos = this.layoutBounds.maxX - leftPadding;
    var ionsAndChannelsLegendPanel = new IonsAndChannelsLegendPanel();
    this.addChild( ionsAndChannelsLegendPanel );
    ionsAndChannelsLegendPanel.right = panelLeftPos;
    ionsAndChannelsLegendPanel.top = 30;

    var axonCrossSectionControlPanel = new AxonCrossSectionControlPanel( thisView.neuronModel );
    this.addChild( axonCrossSectionControlPanel );
    axonCrossSectionControlPanel.centerX = ionsAndChannelsLegendPanel.centerX;
    axonCrossSectionControlPanel.top = ionsAndChannelsLegendPanel.bottom + 20;

    // Create and add the Reset All Button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        zoomProperty.value = defaultZoom;
        neuronClockModelAdapter.reset();
      },
      centerX: ionsAndChannelsLegendPanel.centerX,
      centerY: stimulateNeuronButton.centerY
    } );
    this.addChild( resetAllButton );

    var concentrationReadoutLayerNode = new ConcentrationReadoutLayerNode( thisView.neuronModel, zoomProperty, zoomableRootNode, axonCrossSectionNode );
    this.addChild( concentrationReadoutLayerNode );

    thisView.neuronModel.concentrationReadoutVisibleProperty.link( function( concentrationVisible ) {
      concentrationReadoutLayerNode.visible = concentrationVisible;
    } );

    var chartHeight = 100;
    var membranePotentialChartNode = new MembranePotentialChart( new Dimension2( worldNodeClipArea.bounds.width - 60, chartHeight ), neuronClockModelAdapter );
    membranePotentialChartNode.left = worldNodeClipArea.bounds.left;
    membranePotentialChartNode.bottom = thisView.layoutBounds.maxY - 105;
    thisView.addChild( membranePotentialChartNode );

    // Check to see if WebGL was prevented by a query parameter
    var allowWebGL = window.phetcommon.getQueryParameter( 'webgl' ) !== 'false';
    var webGLSupported = Util.isWebGLSupported && allowWebGL;

    if ( webGLSupported ) {
      var particlesWebGLNode = new ParticlesWebGLNode( thisView.neuronModel, thisView.mvt, zoomProperty, zoomableRootNode, worldNodeClipArea );
      particlesWebGLParentNode.addChild( particlesWebGLNode );
    }
    else {
      var particlesCanvasNode = new ParticlesNode( thisView.neuronModel, thisView.mvt, new Bounds2( 0, 10, 700, 600 ) );
      //WebGL node uses its own scaling whereas Matrix canvas based Particles implementation uses Node's
      //transform matrix for scaling so add it to the zoomableRootNode
      zoomableRootNode.addChild( particlesCanvasNode );
    }

    var simSpeedControlPanel = new SimSpeedControlPanel( neuronClockModelAdapter.speedProperty );
    simSpeedControlPanel.left = thisView.layoutBounds.minX + leftPadding;
    simSpeedControlPanel.bottom = thisView.layoutBounds.maxY - 10;
    thisView.addChild( simSpeedControlPanel );

    var zoomControl = new ZoomControl( zoomProperty, minZoom, maxZoom );
    this.addChild( zoomControl );
    zoomControl.top = this.layoutBounds.minY + 70;
    zoomControl.left = this.layoutBounds.minX + leftPadding;
  }

  return inherit( ScreenView, NeuronView );
} );