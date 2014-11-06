// Copyright 2002-2011, University of Colorado
/**
 * This class is replaced by ParticlesWebGLNode
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var TransientParticlesNode = require( 'NEURON/neuron/view/TransientParticlesNode' );
  var BackgroundParticlesNode = require( 'NEURON/neuron/view/BackgroundParticlesNode' );

  /**
   *
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} mvt
   * @constructor
   */
  function ParticlesCanvasLayerNode( neuronModel, mvt ) {

    var thisNode = this;
    Node.call( this );

    var backgroundParticleLayer = new Node();
    thisNode.addChild( backgroundParticleLayer );

    var transientParticleBounds = new Bounds2( 200, 20, 500, 300 ); // Can be smaller than the background particle bounds //TODO Ashraf verify with John
    var transientParticlesNode = new TransientParticlesNode( neuronModel, mvt, transientParticleBounds );
    thisNode.addChild( transientParticlesNode );

    //create multiple background particle node each rendering a subset at a time see class BackgroundParticles
    function createBackgroundParticleCanvas() {

      //TODO Ashraf need to precisely define particles bounds,smaller the better
      var backgroundParticleBounds = new Bounds2( 160, 10, 540, 300 );
      var activeCanvasIndexProperty = [];

      var backgroundParticleCanvasCount = 0;
      var totalCount = neuronModel.backgroundParticles.getArray().length;
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
        var particleSlice = neuronModel.backgroundParticles.getArray().slice( fromIndex, toIndex );
        var backgroundParticlesNode = new BackgroundParticlesNode( particleSlice, mvt, backgroundParticleBounds, activeCanvasIndexProperty[canvasIndex] );
        backgroundParticleLayer.addChild( backgroundParticlesNode );

      } );

      var currentActiveBackgroundCanvasIndex = 0;
      neuronModel.particlesStateChangedProperty.link( function( newValue ) {
        _.times( backgroundParticleCanvasCount, function( canvasIndex ) {
          activeCanvasIndexProperty[canvasIndex].value = false;
        } );
        if ( backgroundParticleCanvasCount ) {
          //make the background canvas rendering active on a round robin fashion
          activeCanvasIndexProperty[currentActiveBackgroundCanvasIndex].value = true;
          currentActiveBackgroundCanvasIndex++;

          if ( currentActiveBackgroundCanvasIndex > backgroundParticleCanvasCount - 1 ) {
            currentActiveBackgroundCanvasIndex = 0;
          }
        }

      } );

    }

    neuronModel.backgroundParticlesRedefinedProperty.lazyLink( function( backgroundParticlesRedefined ) {
      if ( backgroundParticlesRedefined ) {

        createBackgroundParticleCanvas();

      }
    } );

    createBackgroundParticleCanvas();

  }

  return inherit( Node, ParticlesCanvasLayerNode, {

  } );


} );

