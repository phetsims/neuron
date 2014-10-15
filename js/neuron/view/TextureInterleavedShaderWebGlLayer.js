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
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );

  function TextureInterleavedShaderWebGlLayer( args ) {
    WebGLLayer.call( this, args );
  }


  return inherit( WebGLLayer, TextureInterleavedShaderWebGlLayer, {
    /**
     * A new attribute aTexCoord is introduced which extracts the texture
     * coordinates from the buffer data and passes to fragment shader.
     * See  gl.vertexAttribPointer( shaderProgram.attributeLocations.aTexCoord, 2, gl.FLOAT, false, fSize * stride, uvOffset ); in the setMaterial
     * method of ParticleWebGlNode. The Actual Buffer data is created in createVerticesTexCoords method if ParticlesWebgLNode
     */
    initialize: function() {
      var gl = this.gl;
      gl.clearColor( 0.0, 0.0, 0.0, 0.0 );

      gl.enable( gl.BLEND );
      gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

      //This is an ubershader, which handles all of the different vertex/fragment types in a single shader
      //To reduce overhead of switching programs.
      //TODO: Perhaps the shader program should be loaded through an external file with a RequireJS plugin
      this.shaderProgram = new ShaderProgram( gl,

        /********** Vertex Shader **********/

          'precision mediump float;\n' +
          //The vertex to be transformed
          'attribute vec3 aVertex;\n' +
          'attribute vec2 aTexCoord;\n' +

          // The transformation matrix
          'uniform mat4 uMatrix;\n' +

          // The texture coordinates (if any)
          //TODO: Is this needed here in the vertex shader?
          'varying vec2 texCoord;\n' +

          // The color to render (if any)
          //TODO: Is this needed here in the vertex shader?
          'uniform vec4 uColor;\n' +
          'void main() {\n' +

          //This texture is not needed for rectangles, but we (JO/SR) don't expect it to be expensive, so we leave
          //it for simplicity
          //  '  texCoord = aVertex.xy;\n' +
          '  texCoord = aTexCoord;\n' +
          '  gl_Position = uMatrix * vec4( aVertex, 1 );\n' +
          '}',

        /********** Fragment Shader **********/

        //Directive to indicate high precision
          'precision mediump float;\n' +

          //Texture coordinates (for images)
          'varying vec2 texCoord;\n' +

          //Color (rgba) for filled items
          'uniform vec4 uColor;\n' +

          //Fragment type such as fragmentTypeFill or fragmentTypeTexture
          'uniform int uFragmentType;\n' +

          //Texture (if any)
          'uniform sampler2D uTexture;\n' +
          'void main() {\n' +
          '  if (uFragmentType==' + WebGLLayer.fragmentTypeFill + '){\n' +
          '    gl_FragColor = uColor;\n' +
          '  }else if (uFragmentType==' + WebGLLayer.fragmentTypeTexture + '){\n' +
          '    gl_FragColor = texture2D( uTexture, texCoord );\n' +
          '  }\n' +
          '}',

        ['aVertex', 'aTexCoord'], // attribute names
        ['uTexture', 'uMatrix', 'uColor', 'uFragmentType'] // uniform names
      );

      this.setSize( this.canvas.width, this.canvas.height );

      this.shaderProgram.use();
    },
  } );
} );