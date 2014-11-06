// Copyright 2002-2011, University of Colorado
/**
 * The Node instances is meant for debugging purpose only
 * (During development we can attach it to a scenegraph node to see how particle tiles are laid out)
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ParticleTextureMap = require( 'NEURON/neuron/view/ParticleTextureMap' );

  /**
   *
   * @param {ModelViewTransform2D} modelViewTransform
   * @param {Property.<number>} scaleProperty
   * @constructor
   */
  function ParticleSpriteSheetNode( modelViewTransform, scaleProperty ) {

    var thisNode = this;
    CanvasNode.call( thisNode, {pickable: false, canvasBounds: new Bounds2( 0, 0, 300, 300 ) } );
    this.modelViewTransform = modelViewTransform;
    this.particleTextureMap = new ParticleTextureMap( modelViewTransform, scaleProperty );
    thisNode.invalidatePaint();


  }

  return inherit( CanvasNode, ParticleSpriteSheetNode, {
      // @param {CanvasContextWrapper} wrapper
      paintCanvas: function( wrapper ) {
        var context = wrapper.context;
        this.particleTextureMap.updateSpriteSheetDimensions();
        this.particleTextureMap.createTiles( context );

      }
    }
  );

} );