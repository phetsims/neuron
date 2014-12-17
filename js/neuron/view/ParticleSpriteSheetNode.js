// Copyright 2002-2011, University of Colorado

//REVIEW - This comment could use some cleanup.  Should it be retained even though it is only for debug?  If so,
// please state why.
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
   * @param {ModelViewTransform2D} modelViewTransform
   * @param {Property.<number>} zoomProperty
   * @constructor
   */
  function ParticleSpriteSheetNode( modelViewTransform, zoomProperty ) {

    var thisNode = this;
    CanvasNode.call( thisNode, {pickable: false, canvasBounds: new Bounds2( 0, 0, 300, 300 ) } );
    this.modelViewTransform = modelViewTransform;
    this.particleTextureMap = new ParticleTextureMap( modelViewTransform, zoomProperty );
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