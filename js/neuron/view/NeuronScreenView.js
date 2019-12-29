// Copyright 2014-2019, University of Colorado Boulder

/**
 * View for the 'Neuron' screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( require => {
  'use strict';

  // modules
  const AxonBodyNode = require( 'NEURON/neuron/view/AxonBodyNode' );
  const AxonCrossSectionControlPanel = require( 'NEURON/neuron/view/controlpanel/AxonCrossSectionControlPanel' );
  const AxonCrossSectionNode = require( 'NEURON/neuron/view/AxonCrossSectionNode' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const ChargeSymbolsLayerNode = require( 'NEURON/neuron/view/ChargeSymbolsLayerNode' );
  const ConcentrationReadoutLayerNode = require( 'NEURON/neuron/view/ConcentrationReadoutLayerNode' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const inherit = require( 'PHET_CORE/inherit' );
  const IonsAndChannelsLegendPanel = require( 'NEURON/neuron/view/controlpanel/IonsAndChannelsLegendPanel' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const MembraneChannelGateCanvasNode = require( 'NEURON/neuron/view/MembraneChannelGateCanvasNode' );
  const MembranePotentialChart = require( 'NEURON/neuron/view/chart/MembranePotentialChart' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  const neuron = require( 'NEURON/neuron' );
  const NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  const Node = require( 'SCENERY/nodes/Node' );
  const ParticlesCanvasNode = require( 'NEURON/neuron/view/ParticlesCanvasNode' );
  const ParticlesWebGLNode = require( 'NEURON/neuron/view/ParticlesWebGLNode' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const SceneryUtil = require( 'SCENERY/util/Util' ); // eslint-disable-line require-statement-match
  const ScreenView = require( 'JOIST/ScreenView' );
  const Shape = require( 'KITE/Shape' );
  const SimSpeedControlPanel = require( 'NEURON/neuron/view/controlpanel/SimSpeedControlPanel' );
  const TimeControlNode = require( 'SCENERY_PHET/TimeControlNode' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );
  const ZoomControl = require( 'NEURON/neuron/view/ZoomControl' );

  // strings
  const stimulateNeuronString = require( 'string!NEURON/stimulateNeuron' );

  // constants
  const BUTTON_FONT = new PhetFont( 18 );
  const SHOW_PARTICLE_CANVAS_BOUNDS = false; // for debugging
  const MIN_ZOOM = 0.7;
  const MAX_ZOOM = 6;
  const DEFAULT_ZOOM = 1.0;
  const CHART_HEIGHT = 100; // in screen coordinates, empirically determined

  /**
   * @param {NeuronClockModelAdapter} neuronClockModelAdapter - holds the NeuronModel which uses specialized real time
   * constant clock. The clock adapter calculates the appropriate real time dt and dispatches it to the actual model.
   * @constructor
   */
  function NeuronScreenView( neuronClockModelAdapter ) {

    const self = this;
    this.neuronModel = neuronClockModelAdapter.model; // model is neuron model
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 834, 504 ) } );
    const viewPortPosition = new Vector2( this.layoutBounds.width * 0.40, this.layoutBounds.height - 255 );

    // Set up the model-canvas transform.
    this.mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO, viewPortPosition,
      2.45 ); // Scale factor - smaller numbers "zoom out", bigger ones "zoom in".

    // Define the area where the axon and particles will be depicted.
    const worldNodeClipArea = Shape.rect( 70, 10, this.layoutBounds.maxX - 280, this.layoutBounds.maxY - 110 );

    // The zoomable area needs to have a root that isn't zoomed so that it can be effectively clipped.
    const zoomableAreaRootNode = new Node( { clipArea: worldNodeClipArea } );
    this.addChild( zoomableAreaRootNode );

    // Define the root for the part that can be zoomed.
    const zoomableNode = new Node();
    zoomableAreaRootNode.addChild( zoomableNode );

    // Add a subtle outline to the zoomable area.
    const clipAreaBounds = worldNodeClipArea.bounds;
    this.addChild( new Rectangle(
      clipAreaBounds.x,
      clipAreaBounds.y,
      clipAreaBounds.width,
      clipAreaBounds.height,
      0,
      0,
      { stroke: '#cccccc', lineWidth: 0.5 }
    ) );

    // Create and add the layers in the desired order.
    const axonBodyLayer = new Node();
    const axonCrossSectionLayer = new Node();
    const channelLayer = new Node();
    const chargeSymbolLayer = new ChargeSymbolsLayerNode( this.neuronModel, this.mvt );

    zoomableNode.addChild( axonBodyLayer );
    zoomableNode.addChild( axonCrossSectionLayer );
    zoomableNode.addChild( channelLayer );
    zoomableNode.addChild( chargeSymbolLayer );

    const dilationFactor = DEFAULT_ZOOM - MIN_ZOOM;
    const axonBodyNode = new AxonBodyNode(
      this.neuronModel.axonMembrane,
      worldNodeClipArea.bounds.dilatedXY(
        worldNodeClipArea.bounds.width * dilationFactor,
        worldNodeClipArea.bounds.height * dilationFactor ),
      this.mvt
    );
    axonBodyLayer.addChild( axonBodyNode );
    const axonCrossSectionNode = new AxonCrossSectionNode( this.neuronModel.axonMembrane, this.mvt );
    axonCrossSectionLayer.addChild( axonCrossSectionNode );

    // Create the node that will render the membrane channels and gates.  This is done on a canvas node for better
    // performance.
    const channelGateBounds = new Bounds2( 100, 50, 600, 500 ); // empirically determined
    const membraneChannelGateCanvasNode = new MembraneChannelGateCanvasNode( this.neuronModel, this.mvt, channelGateBounds );
    channelLayer.addChild( membraneChannelGateCanvasNode );

    // Create that property that will control the zoom amount.
    const zoomProperty = new Property( DEFAULT_ZOOM );

    // Create a property that will contain the current zoom transformation matrix.
    const zoomMatrixProperty = new Property();

    // Watch the zoom property and zoom in and out correspondingly.
    zoomProperty.link( function( zoomFactor ) {

      // Zoom toward the top so that when zoomed in the membrane is in a reasonable place and there is room for the
      // chart below it.
      const zoomTowardTopThreshold = 0.6;
      let scaleMatrix;
      const scaleAroundX = Util.roundSymmetric( viewPortPosition.x );
      let scaleAroundY;
      if ( zoomFactor > zoomTowardTopThreshold ) {
        scaleAroundY = (zoomFactor - zoomTowardTopThreshold) * self.neuronModel.getAxonMembrane().getCrossSectionDiameter() * 0.075;
        scaleMatrix = Matrix3.translation( scaleAroundX, scaleAroundY ).timesMatrix( Matrix3.scaling( zoomFactor, zoomFactor ) ).timesMatrix( Matrix3.translation( -scaleAroundX, -scaleAroundY ) );
      }
      else {
        scaleAroundY = 0;
        scaleMatrix = Matrix3.translation( scaleAroundX, scaleAroundY ).timesMatrix( Matrix3.scaling( zoomFactor, zoomFactor ) ).timesMatrix( Matrix3.translation( -scaleAroundX, -scaleAroundY ) );
      }

      zoomableNode.matrix = scaleMatrix;
      zoomMatrixProperty.value = scaleMatrix;
    } );

    // Check to see if WebGL can be used
    const webGLSupported = SceneryUtil.isWebGLSupported && phet.chipper.queryParameters.webgl;

    if ( webGLSupported ) {

      const estimatedMaxParticleWidth = 30; // empirically determined, used to support clipping-like behavior

      const particlesWebGLNode = new ParticlesWebGLNode(
        this.neuronModel,
        this.mvt,
        zoomMatrixProperty,
        worldNodeClipArea.bounds.dilated( estimatedMaxParticleWidth / 2 )
      );

      // The WebGL particles node does its own clipping and zooming since these operations don't work very well when
      // using the stock WebGLNode support, so it isn't added to the zoomable node hierarchy in the scene graph.
      this.addChild( particlesWebGLNode );

      // WebGLNode doesn't support clipping, so we add a shape around the viewport that matches the background color
      // and makes it look like particles are being clipped. For more detail, see
      // https://github.com/phetsims/neuron/issues/7.
      const maskingShape = Shape.rect(
        clipAreaBounds.x - ( estimatedMaxParticleWidth / 2 ),
        clipAreaBounds.y - ( estimatedMaxParticleWidth / 2 ),
        clipAreaBounds.width + estimatedMaxParticleWidth,
        clipAreaBounds.height + estimatedMaxParticleWidth
      );
      const maskNode = new Path( maskingShape, {
        stroke: NeuronConstants.SCREEN_BACKGROUND,
        lineWidth: estimatedMaxParticleWidth
      } );
      this.addChild( maskNode );

      if ( SHOW_PARTICLE_CANVAS_BOUNDS ) {
        this.addChild( Rectangle.bounds( particlesWebGLNode.bounds, {
          stroke: 'purple',
          lineWidth: 2,
          fill: 'pink'
        } ) );
      }
    }
    else {
      const particlesCanvasNode = new ParticlesCanvasNode( this.neuronModel, this.mvt, worldNodeClipArea );

      // The WebGL node uses its own scaling whereas ParticlesCanvasNode uses the parent node's transform matrix for
      // scaling, so add it to the root node of the zoomable content (zoomableNode).
      if ( SHOW_PARTICLE_CANVAS_BOUNDS ) {
        this.addChild( Rectangle.bounds( particlesCanvasNode.bounds, { stroke: 'green' } ) );
      }
      zoomableNode.addChild( particlesCanvasNode );
    }

    // figure out the center Y location for all lower controls
    const centerYForLowerControls = ( clipAreaBounds.maxY + this.layoutBounds.height ) / 2;

    const playingProperty = neuronClockModelAdapter.playingProperty; // convenience variable

    // property that determines whether the StepBackwardButton should be disabled
    // is passed in as an isPlayingProperty because isPlayingProperty is used by StepButtons to figure out whether
    //  they should be enabled or not
    // the StepBackwardButton doesn't use the normal playingProperty for reasons stated below
    const stepBackDisabledProperty = new DerivedProperty( [
        playingProperty,
        this.neuronModel.timeProperty
      ],
      function( playing, time ) {
        // Allow step back only if the mode is not playing and if recorded state data exists in the data buffer.  Data
        // recording is only initiated after the neuron has been stimulated, so if the sim is paused before the neuron
        // was ever stimulated, backwards stepping will not be possible.
        return playing || time <= self.neuronModel.getMinRecordedTime() || self.neuronModel.getRecordedTimeRange() <= 0;
      }
    );

    const timeControlNode = new TimeControlNode( playingProperty, {
      includeStepBackwardButton: true,
      playPauseOptions: { radius: 25 },
      stepForwardOptions: {
        listener: function() { neuronClockModelAdapter.stepClockWhilePaused(); }
      },
      stepBackwardOptions: {
        listener: function() { neuronClockModelAdapter.stepClockBackWhilePaused(); },
        isPlayingProperty: stepBackDisabledProperty
      },
      playPauseStepXSpacing: 5,
      right: this.layoutBounds.maxX / 2,
      centerY: centerYForLowerControls
    } );
    this.addChild( timeControlNode );

    // space between layout edge and controls like reset, zoom control, legend, speed panel, etc.
    const leftPadding = 20;

    const stimulateNeuronButton = new RectangularPushButton( {
      content: new MultiLineText( stimulateNeuronString, { font: BUTTON_FONT } ),
      listener: function() { self.neuronModel.initiateStimulusPulse(); },
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      right: worldNodeClipArea.bounds.maxX,
      centerY: centerYForLowerControls,
      minWidth: 50,
      maxWidth: 200, // empirically determined
      minHeight: 65
    } );

    this.addChild( stimulateNeuronButton );

    this.neuronModel.stimulusLockoutProperty.link( function( stimulusLockout ) {
      stimulateNeuronButton.enabled = !stimulusLockout;
    } );

    // NeuronModel uses specialized real time constant clock simulation
    // The clock adapter calculates the appropriate dt and dispatches it to the interested model
    neuronClockModelAdapter.registerStepCallback( this.neuronModel.step.bind( this.neuronModel ) );

    const panelLeftPos = this.layoutBounds.maxX - leftPadding;
    const ionsAndChannelsLegendPanel = new IonsAndChannelsLegendPanel();
    this.addChild( ionsAndChannelsLegendPanel );
    ionsAndChannelsLegendPanel.right = panelLeftPos;
    ionsAndChannelsLegendPanel.top = clipAreaBounds.y;

    const axonCrossSectionControlPanel = new AxonCrossSectionControlPanel( this.neuronModel, {
      minWidth: ionsAndChannelsLegendPanel.width,
      maxWidth: ionsAndChannelsLegendPanel.width
    } );
    this.addChild( axonCrossSectionControlPanel );
    axonCrossSectionControlPanel.centerX = ionsAndChannelsLegendPanel.centerX;
    axonCrossSectionControlPanel.top = ionsAndChannelsLegendPanel.bottom + 20;

    // Create and add the Reset All Button in the bottom right
    const resetAllButton = new ResetAllButton( {
      listener: function() {
        zoomProperty.reset();
        neuronClockModelAdapter.reset();
      },
      right: ionsAndChannelsLegendPanel.right,
      centerY: centerYForLowerControls
    } );
    this.addChild( resetAllButton );

    const concentrationReadoutLayerNode = new ConcentrationReadoutLayerNode( this.neuronModel, zoomProperty,
      zoomableNode, worldNodeClipArea.bounds, axonCrossSectionNode );
    this.addChild( concentrationReadoutLayerNode );

    this.neuronModel.concentrationReadoutVisibleProperty.link( function( concentrationVisible ) {
      concentrationReadoutLayerNode.visible = concentrationVisible;
    } );

    const simSpeedControlPanel = new SimSpeedControlPanel( neuronClockModelAdapter.speedProperty, {
      left: this.layoutBounds.minX + leftPadding,
      centerY: centerYForLowerControls,
      maxWidth: 250 // empirically determined
    } );
    this.addChild( simSpeedControlPanel );

    const zoomControl = new ZoomControl( zoomProperty, MIN_ZOOM, MAX_ZOOM );
    this.addChild( zoomControl );
    zoomControl.top = clipAreaBounds.y;
    zoomControl.left = this.layoutBounds.minX + leftPadding;

    const membranePotentialChartNode = new MembranePotentialChart( new Dimension2( worldNodeClipArea.bounds.width - 60, CHART_HEIGHT ), neuronClockModelAdapter );
    membranePotentialChartNode.layerSplit = true; // optimization
    membranePotentialChartNode.left = worldNodeClipArea.bounds.left;
    membranePotentialChartNode.bottom = clipAreaBounds.maxY;
    this.addChild( membranePotentialChartNode );
  }

  neuron.register( 'NeuronScreenView', NeuronScreenView );

  return inherit( ScreenView, NeuronScreenView );
} );
