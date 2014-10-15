// Copyright 2002-2014, University of Colorado Boulder
/**
 *
 * The vertex Shader of this webGL layer uses interleaved TextureCoordinates and passes it to
 * fragment shader.This is required as different particles (which are made up of 2 triangles, 6 vertices) need to map themselves to
 * texture coordinates of different tiles. See ParticlesWebGLNode class and ParticleTextureMap to see how these classes work together.
 * @author Sharfudeen Ashraf (for Ghent University)
 *
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var WebGLLayer = require( 'SCENERY/layers/WebGLLayer' );

  function TextureInterleavedShaderWebGlLayer( args ) {
    WebGLLayer.call( this, args );
  }


  return inherit( WebGLLayer, TextureInterleavedShaderWebGlLayer, {

  } );
} );