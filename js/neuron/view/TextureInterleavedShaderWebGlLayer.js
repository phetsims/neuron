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
  var Matrix4 = require( 'DOT/Matrix4' );


  //Scenery uses Matrix3 and WebGL uses Matrix4, so we must convert.
  function matrix3To4( matrix3 ) {
    return new Matrix4(
      matrix3.m00(), matrix3.m01(), 0, matrix3.m02(),
      matrix3.m10(), matrix3.m11(), 0, matrix3.m12(),
      0, 0, 1, 0,
      0, 0, 0, 1 );
  }

  function TextureInterleavedShaderWebGlLayer( args ) {
    var thisLayer = this;
    WebGLLayer.call( thisLayer, args );

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
    render: function( scene, args ) {

      // If the context is lost, do not try to render anything.  On Chrome, it does not cause problems, but it seems
      // safer/faster to only render to an unlost context.
      if ( this.webglContextIsLost ) {
        return;
      }
      var gl = this.gl;

      if ( this.dirty ) {
        gl.clear( this.gl.COLOR_BUFFER_BIT );

        // Only ParticlesWebGL Node uses this TextureInterleaved Layer.
        // The Node doesn't use any transformations. The Scale calculation for the particles are done internally by the ParticlesWebGL Node
        // So this layer can cache the uniformViewMatrix.
        // This is not a generic solution but rather works only for ParticlesWebGLNode

        var instance = this.instances[0];
        if ( !this.uniformViewMatrix ) {
          var modelViewMatrix = matrix3To4( instance.trail.getMatrix() );
          var projectionMatrix = Matrix4.translation( -1, 1, 0 ).timesMatrix( Matrix4.scaling( 2 / this.logicalWidth, -2 / this.logicalHeight, 1 ) );
          this.uniformViewMatrix = projectionMatrix.timesMatrix( modelViewMatrix );
        }

        instance.data.drawable.render( this.shaderProgram, this.uniformViewMatrix );


      }
    }
  } );
} );