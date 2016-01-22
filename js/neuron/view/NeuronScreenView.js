// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the 'Neuron' screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
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
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Shape = require( 'KITE/Shape' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Property = require( 'AXON/Property' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
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
  var ZoomControl = require( 'NEURON/neuron/view/ZoomControl' );
  var MembranePotentialChart = require( 'NEURON/neuron/view/chart/MembranePotentialChart' );
  var IonsAndChannelsLegendPanel = require( 'NEURON/neuron/view/controlpanel/IonsAndChannelsLegendPanel' );
  var AxonCrossSectionControlPanel = require( 'NEURON/neuron/view/controlpanel/AxonCrossSectionControlPanel' );
  var SimSpeedControlPanel = require( 'NEURON/neuron/view/controlpanel/SimSpeedControlPanel' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var Util = require( 'SCENERY/util/Util' );
  var ParticlesCanvasNode = require( 'NEURON/neuron/view/ParticlesCanvasNode' );

  // strings
  var stimulateNeuronString = require( 'string!NEURON/stimulateNeuron' );

  // constants
  var BUTTON_FONT = new PhetFont( 18 );
  var SHOW_PARTICLE_CANVAS_BOUNDS = false; // for debugging
  var MIN_ZOOM = 0.7;
  var MAX_ZOOM = 6;
  var DEFAULT_ZOOM = 1.0;
  var CHART_HEIGHT = 100; // in screen coordinates, empirically determined

  /**
   * @param {NeuronClockModelAdapter} neuronClockModelAdapter - holds the NeuronModel which uses specialized real time
   * constant clock. The clock adapter calculates the appropriate real time dt and dispatches it to the actual model.
   * @constructor
   */
  function NeuronView( neuronClockModelAdapter ) {

    var thisView = this;
    thisView.neuronModel = neuronClockModelAdapter.model; // model is neuron model
    ScreenView.call( thisView, { layoutBounds: new Bounds2( 0, 0, 834, 504 ) } );
    var viewPortPosition = new Vector2( thisView.layoutBounds.width * 0.40, thisView.layoutBounds.height - 255 );

    // Set up the model-canvas transform.
    thisView.mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO, viewPortPosition,
      2.45 ); // Scale factor - smaller numbers "zoom out", bigger ones "zoom in".

    // Define the area where the axon and particles will be depicted.
    var worldNodeClipArea = Shape.rect( 70, 10, this.layoutBounds.maxX - 280, this.layoutBounds.maxY - 110 );

    // The zoomable area needs to have a root that isn't zoomed so that it can be effectively clipped.
    var zoomableAreaRootNode = new Node( { clipArea: worldNodeClipArea } );
    this.addChild( zoomableAreaRootNode );

    // Define the root for the part that can be zoomed.
    var zoomableNode = new Node();
    zoomableAreaRootNode.addChild( zoomableNode );

    // Add a subtle outline to the zoomable area.
    var clipAreaBounds = worldNodeClipArea.bounds;
    thisView.addChild( new Rectangle(
      clipAreaBounds.x,
      clipAreaBounds.y,
      clipAreaBounds.width,
      clipAreaBounds.height,
      0,
      0,
      { stroke: '#cccccc', lineWidth: 0.5 }
    ) );

    // Create and add the layers in the desired order.
    var axonBodyLayer = new Node();
    var axonCrossSectionLayer = new Node();
    var channelLayer = new Node();
    var chargeSymbolLayer = new ChargeSymbolsLayerNode( thisView.neuronModel, thisView.mvt );

    zoomableNode.addChild( axonBodyLayer );
    zoomableNode.addChild( axonCrossSectionLayer );
    zoomableNode.addChild( channelLayer );
    zoomableNode.addChild( chargeSymbolLayer );

    var dilationFactor = DEFAULT_ZOOM - MIN_ZOOM;
    var axonBodyNode = new AxonBodyNode(
      thisView.neuronModel.axonMembrane,
      worldNodeClipArea.bounds.dilatedXY(
        worldNodeClipArea.bounds.width * dilationFactor,
        worldNodeClipArea.bounds.height * dilationFactor ),
      thisView.mvt
    );
    axonBodyLayer.addChild( axonBodyNode );
    var axonCrossSectionNode = new AxonCrossSectionNode( thisView.neuronModel.axonMembrane, thisView.mvt );
    axonCrossSectionLayer.addChild( axonCrossSectionNode );

    // Create the node that will render the membrane channels and gates.  This is done on a canvas node for better
    // performance.
    var channelGateBounds = new Bounds2( 100, 50, 600, 500 ); // empirically determined
    var membraneChannelGateCanvasNode = new MembraneChannelGateCanvasNode( thisView.neuronModel, thisView.mvt, channelGateBounds );
    channelLayer.addChild( membraneChannelGateCanvasNode );

    // Create that property that will control the zoom amount.
    var zoomProperty = new Property( DEFAULT_ZOOM );

    // Create a property that will contain the current zoom transformation matrix.
    var zoomMatrixProperty = new Property();

    // Watch the zoom property and zoom in and out correspondingly.
    zoomProperty.link( function( zoomFactor ) {

      // Zoom toward the top so that when zoomed in the membrane is in a reasonable place and there is room for the
      // chart below it.
      var zoomTowardTopThreshold = 0.6;
      var scaleMatrix;
      var scaleAroundX = Math.round( viewPortPosition.x );
      var scaleAroundY;
      if ( zoomFactor > zoomTowardTopThreshold ) {
        scaleAroundY = (zoomFactor - zoomTowardTopThreshold) * thisView.neuronModel.getAxonMembrane().getCrossSectionDiameter() * 0.075;
        scaleMatrix = Matrix3.translation( scaleAroundX, scaleAroundY ).timesMatrix( Matrix3.scaling( zoomFactor, zoomFactor ) ).timesMatrix( Matrix3.translation( -scaleAroundX, -scaleAroundY ) );
      }
      else {
        scaleAroundY = 0;
        scaleMatrix = Matrix3.translation( scaleAroundX, scaleAroundY ).timesMatrix( Matrix3.scaling( zoomFactor, zoomFactor ) ).timesMatrix( Matrix3.translation( -scaleAroundX, -scaleAroundY ) );
      }

      zoomableNode.matrix = scaleMatrix;
      zoomMatrixProperty.value = scaleMatrix;
    } );

    // Check to see if WebGL was prevented by a query parameter
    var allowWebGL = phet.chipper.getQueryParameter( 'webgl' ) !== 'false';
    var webGLSupported = Util.isWebGLSupported && allowWebGL;

    if ( webGLSupported ) {

      var estimatedMaxParticleWidth = 30; // empirically determined, used to support clipping-like behavior

      var particlesWebGLNode = new ParticlesWebGLNode(
        thisView.neuronModel,
        thisView.mvt,
        zoomMatrixProperty,
        worldNodeClipArea.bounds.dilated( estimatedMaxParticleWidth / 2 )
      );

      // The WebGL particles node does its own clipping and zooming since these operations don't work very well when
      // using the stock WebGLNode support, so it isn't added to the zoomable node hierarchy in the scene graph.
      thisView.addChild( particlesWebGLNode );

      // WebGLNode doesn't support clipping, so we add a shape around the viewport that matches the background color
      // and makes it look like particles are being clipped. For more detail, see
      // https://github.com/phetsims/neuron/issues/7.
      var maskingShape = Shape.rect(
        clipAreaBounds.x - ( estimatedMaxParticleWidth / 2 ),
        clipAreaBounds.y - ( estimatedMaxParticleWidth / 2 ),
        clipAreaBounds.width + estimatedMaxParticleWidth,
        clipAreaBounds.height + estimatedMaxParticleWidth
      );
      var maskNode = new Path( maskingShape, { stroke: NeuronConstants.SCREEN_BACKGROUND, lineWidth: estimatedMaxParticleWidth } );
      thisView.addChild( maskNode );

      if ( SHOW_PARTICLE_CANVAS_BOUNDS ) {
        this.addChild( Rectangle.bounds( particlesWebGLNode.bounds, {
          stroke: 'purple',
          lineWidth: 2,
          fill: 'pink'
        } ) );
      }
    }
    else {
      var particlesCanvasNode = new ParticlesCanvasNode( thisView.neuronModel, thisView.mvt, worldNodeClipArea );

      // The WebGL node uses its own scaling whereas ParticlesCanvasNode uses the parent node's transform matrix for
      // scaling, so add it to the root node of the zoomable content (zoomableNode).
      if ( SHOW_PARTICLE_CANVAS_BOUNDS ) {
        this.addChild( Rectangle.bounds( particlesCanvasNode.bounds, { stroke: 'green' } ) );
      }
      zoomableNode.addChild( particlesCanvasNode );
    }

    var recordPlayButtons = [];
    var playingProperty = neuronClockModelAdapter.playingProperty; // convenience variable
    var playPauseButton = new PlayPauseButton( playingProperty, { radius: 25 } );

    // Allow step back only if the mode is not playing and if recorded state data exists in the data buffer.  Data
    // recording is only initiated after the neuron has been stimulated, so if the sim is paused before the neuron was
    // ever stimulated, backwards stepping will not be possible.
    var stepBackEnabledProperty = new DerivedProperty( [
        playingProperty,
        thisView.neuronModel.timeProperty
      ],
      function( playing, time ) {
        return !playing && time > thisView.neuronModel.getMinRecordedTime() && thisView.neuronModel.getRecordedTimeRange() > 0;
      }
    );

    var stepBackwardButton = new StepBackButton(
      function() {
        neuronClockModelAdapter.stepClockBackWhilePaused();
      },
      stepBackEnabledProperty
    );

    // step forward is enabled whenever paused.
    var stepForwardButton = new StepButton(
      function() { neuronClockModelAdapter.stepClockWhilePaused(); },
      playingProperty
    );

    recordPlayButtons.push( stepBackwardButton );
    recordPlayButtons.push( playPauseButton );
    recordPlayButtons.push( stepForwardButton );

    // figure out the center Y location for all lower controls
    var centerYForLowerControls = ( clipAreaBounds.maxY + thisView.layoutBounds.height ) / 2;

    var recordPlayButtonBox = new HBox( {
      children: recordPlayButtons,
      spacing: 5,
      right: thisView.layoutBounds.maxX / 2,
      centerY: centerYForLowerControls
    } );

    this.addChild( recordPlayButtonBox );

    // space between layout edge and controls like reset, zoom control, legend, speed panel, etc.
    var leftPadding = 20;

    var stimulateNeuronButton = new RectangularPushButton( {
      content: new MultiLineText( stimulateNeuronString, { font: BUTTON_FONT } ),
      listener: function() { thisView.neuronModel.initiateStimulusPulse(); },
      baseColor: 'rgb( 242, 233, 22 )',
      right: worldNodeClipArea.bounds.maxX,
      centerY: centerYForLowerControls,
      minWidth: 50,
      maxWidth: 200, // empirically determined
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
    ionsAndChannelsLegendPanel.top = clipAreaBounds.y;

    var axonCrossSectionControlPanel = new AxonCrossSectionControlPanel( thisView.neuronModel, {
      minWidth: ionsAndChannelsLegendPanel.width,
      maxWidth: ionsAndChannelsLegendPanel.width
    } );
    this.addChild( axonCrossSectionControlPanel );
    axonCrossSectionControlPanel.centerX = ionsAndChannelsLegendPanel.centerX;
    axonCrossSectionControlPanel.top = ionsAndChannelsLegendPanel.bottom + 20;

    // Create and add the Reset All Button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        zoomProperty.reset();
        neuronClockModelAdapter.reset();
      },
      right: ionsAndChannelsLegendPanel.right,
      centerY: centerYForLowerControls
    } );
    this.addChild( resetAllButton );

    var concentrationReadoutLayerNode = new ConcentrationReadoutLayerNode( thisView.neuronModel, zoomProperty,
      zoomableNode, worldNodeClipArea.bounds, axonCrossSectionNode );
    this.addChild( concentrationReadoutLayerNode );

    thisView.neuronModel.concentrationReadoutVisibleProperty.link( function( concentrationVisible ) {
      concentrationReadoutLayerNode.visible = concentrationVisible;
    } );

    var simSpeedControlPanel = new SimSpeedControlPanel( neuronClockModelAdapter.speedProperty, {
      left: thisView.layoutBounds.minX + leftPadding,
      centerY: centerYForLowerControls,
      maxWidth: 250 // empirically determined
    } );
    thisView.addChild( simSpeedControlPanel );

    var zoomControl = new ZoomControl( zoomProperty, MIN_ZOOM, MAX_ZOOM );
    this.addChild( zoomControl );
    zoomControl.top = clipAreaBounds.y;
    zoomControl.left = this.layoutBounds.minX + leftPadding;

    var membranePotentialChartNode = new MembranePotentialChart( new Dimension2( worldNodeClipArea.bounds.width - 60, CHART_HEIGHT ), neuronClockModelAdapter );
    membranePotentialChartNode.layerSplit = true; // optimization
    membranePotentialChartNode.left = worldNodeClipArea.bounds.left;
    membranePotentialChartNode.bottom = clipAreaBounds.maxY;
    thisView.addChild( membranePotentialChartNode );
  }

  return inherit( ScreenView, NeuronView );
} );