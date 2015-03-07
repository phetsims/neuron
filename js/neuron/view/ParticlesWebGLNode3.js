// Copyright 2002-2015, University of Colorado Boulder

/**
 * A WebGL Scenery node that is used to render particles.  This is done as an optimization, since representing every
 * particle as an individual Scenery node proved to be too computationally intensive.
 *
 * !!!!!!!!!!!!!!!!! TODO: Fix this header doc up, it's copied from the original version Scenery 0.1 version !!!!!!!!!
 *
 * Particles Node, rendered in WebGL to improve performance
 * Particles are rendered by mapping their rectangular corners with a dynamically created SpriteSheet tiles.
 *
 * The Tile shapes (Circle or Rhombus) are arranged by Opacity value ranging from 0.00 to 0.99 (A total of 100 tiles
 * for each particle, 10 rows and 10 columns).The Tiles doesn't get created on every  webgl render call  but only when the
 * user zooms in and out.Having a fixed Sprite sheet results in  pixelation thats  why we have to scale and draw the
 * SpriteSheet dynamically whenever  changes the Zoom property.
 *
 * The code makes use of a different vertex shader, the Default WebglLayer's Vertex shader assumes the TextureCoordinates to
 * be Vertex Coordinates itself.(that's why  Vertex are given in normalized coordinates ).
 *
 * In case of Base WebGLNode, the transformation of shapes are handled by manipulating the viewMatrix during rendering.However
 * this is not applicable in our case as we have to display 1000s triangles each mapped to a different tile position.
 * So each Vertex is interleaved with the appropriate Texture coordinates and sent to Webgl subsystem.
 * The shaderProgram.attributeLocations.aTexCoord in theSetMaterial method informs the shader how to retrieve the
 * Texture coordinates for each vertex.
 *
 * The Particles position is also transformed using the Zoomable Node's transform matrix to take care of the particle's
 * position when scaled.
 *
 ** @author Sharfudeen Ashraf (for Ghent University)
 ** @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var particlesTextureImage = require( 'image!NEURON/neuron-particles.png' );

  // constants
  var SQUARE_SIDE_LENGTH = 4; // empirically determined
  var SQUARE_HALF_DIAGONAL_LENGTH = ( SQUARE_SIDE_LENGTH * Math.sqrt( 2 ) ) / 2;
  var SQUARE_VERTEX_OFFSETS = [
    new Vector2( -SQUARE_HALF_DIAGONAL_LENGTH, SQUARE_HALF_DIAGONAL_LENGTH ),
    new Vector2( -SQUARE_HALF_DIAGONAL_LENGTH, -SQUARE_HALF_DIAGONAL_LENGTH ),
    new Vector2( SQUARE_HALF_DIAGONAL_LENGTH, SQUARE_HALF_DIAGONAL_LENGTH ),
    new Vector2( SQUARE_HALF_DIAGONAL_LENGTH, -SQUARE_HALF_DIAGONAL_LENGTH )
  ];

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<number>} zoomProperty
   * @param {Node} zoomableRootNode
   * @param {Shape} bounds
   * @constructor
   */
  function ParticlesWebGLNode( neuronModel, modelViewTransform, zoomProperty, zoomableRootNode, bounds ) {
    var self = this;
    WebGLNode.call( this, {
      canvasBounds: bounds
    } );

    // keep references to the things that needed in order to render the particles
    this.neuronModel = neuronModel;
    this.modelViewTransform = modelViewTransform;

    // constrain the bounds so that the generated shapes aren't off the edge of the canvas
    this.constrainedBounds = bounds.dilated( -SQUARE_SIDE_LENGTH / 2 );

    self.update();

    // TODO: Instead of doing what's shown below, consider just redrawing at every time step.  Seems like that would be simpler.
    // Monitor a property that indicates when a particle state has changed and initiate a redraw.
    neuronModel.on( NeuronConstants.PARTICLES_MOVED_EVENT, function() {
      self.update();
    } );
  }

  return inherit( WebGLNode, ParticlesWebGLNode, {

    /**
     * Initialization routine called by the base class that sets up the vertex and fragment shaders and does other
     * initialization.
     * @param drawable
     */
    initializeWebGLDrawable: function( drawable ) {
      var gl = drawable.gl;

      // vertex shader
      var vertexShaderSource = [
        'attribute vec3 aPosition;',
        'attribute vec2 aTextureCoordinate;',
        'varying vec2 vTexCoord;',
        'uniform mat3 uModelViewMatrix;',
        'uniform mat3 uProjectionMatrix;',

        'void main( void ) {',
        // homogeneous model-view transformation
        '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',
        // homogeneous map to to normalized device coordinates
        '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',
        // texture coordinate
        '  vTexCoord = aTextureCoordinate;',
        // combine with the z coordinate specified
        '  gl_Position = vec4( ndc.xy, aPosition.z, 1.0 );',
        '}'
      ].join( '\n' );

      // fragment shader
      var fragmentShaderSource = [
        'precision mediump float;',
        'varying vec2 vTexCoord;',
        'uniform sampler2D uSampler;',
        'void main( void ) {',
        //'  gl_FragColor = texture2D(uSampler, vec2(0.5, 0.5));',
        //'  gl_FragColor = vec4( 0, 0, 0, 1 );',
        '  gl_FragColor = texture2D(uSampler, vTexCoord);',
        '}'
      ].join( '\n' );
      //var fragmentShaderSource = [
      //  'precision mediump float;',
      //  'varying vec2 vTexCoord;',
      //  'uniform sampler2D uSampler;',
      //  'void main( void ) {',
      //  '  gl_FragColor = texture2D(uSampler, vTexCoord);',
      //  '}'
      //].join( '\n' );
      //var fragmentShaderSource = [
      //  'precision mediump float;',
      //  'void main( void ) {',
      //  '  gl_FragColor = vec4( 0, 0, 0.5, 1 );',
      //  '}'
      //].join( '\n' );

      drawable.shaderProgram = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource, {
        attributes: [ 'aPosition', 'aTextureCoordinate' ],
        uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix' ]
      } );

      drawable.vertexBuffer = gl.createBuffer();
      drawable.elementBuffer = gl.createBuffer();

      // set up the texture
      console.log( 'woodImage.complete = ' + particlesTextureImage.complete );
      drawable.texture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, drawable.texture );
      gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, particlesTextureImage );
      gl.generateMipmap( gl.TEXTURE_2D );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT );

      // TODO: I'm totally guessing on the following, based on some examples I've been looking at (jblanco).  Should
      // the uniform go into the ShaderProgram abstraction?
      drawable.uniformSamplerLoc = gl.getUniformLocation( drawable.shaderProgram.program, "uSampler" );
    },

    /**
     * TODO: Document this once finalized (and when I understand it better).
     * @param drawable
     * @param matrix
     */
    paintWebGLDrawable: function( drawable, matrix ) {
      var self = this;
      var gl = drawable.gl;
      var shaderProgram = drawable.shaderProgram;

      // Convert particle data to vertices that represent a rectangle plus texture coordinates.
      var vertexData = [];
      this.particleData.forEach( function( particleDatum ) {
        // create a square that encloses this data point TODO: Faster to use C-style?
        _.times( 4, function( index ) {

          // position, which is a 3-component vector
          vertexData.push( particleDatum.xPos + SQUARE_VERTEX_OFFSETS[ index ].x );
          vertexData.push( particleDatum.yPos + SQUARE_VERTEX_OFFSETS[ index ].y );
          vertexData.push( 0.2 ); // z position

          // texture coordinate, which is a 2-component vector
          vertexData.push( index < 2 ? 0 : 0.5 ); // x texture coordinate
          var yBase = particleDatum.type === ParticleType.SODIUM_ION ? 0.5 : 0;
          vertexData.push( yBase + ( index % 2 === 0 ? 0.5 : 0 ) ); // y texture coordinate
        } );
      } );

      // Load the vertex data into the GPU.
      var elementSize = Float32Array.BYTES_PER_ELEMENT;
      var elementsPerVertex = 3 + 2; // vertex + texture coordinate
      var stride = elementSize * elementsPerVertex;
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertexData ), gl.STATIC_DRAW );

      // Set up the attributes that will be passed into the vertex shader.
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 3, gl.FLOAT, false, stride, 0 );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aTextureCoordinate, 2, gl.FLOAT, false, stride, elementSize * 3 );

      // Set up the element indices.  This is done so that we can create 'degenerate triangles' and thus have
      // discontinuities in the triangle strip, thus creating separate rectangles.
      var elementData = [];
      var count = 0;
      _.times( this.particleData.length, function( index ) {
        elementData.push( count++ );
        elementData.push( count++ );
        elementData.push( count++ );
        elementData.push( count );
        //debugger;
        if ( index + 1 < self.particleData.length ) {
          // Add the 'degenerate triangle' that will force a discontinuity in the triangle strip.
          elementData.push( count++ );
          elementData.push( count );
        }
      } );
      //if ( elementData.length > 2 ) {
      //  debugger;
      //}
      gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, drawable.elementBuffer );
      gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( elementData ), gl.STATIC_DRAW );

      shaderProgram.use();

      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, matrix.entries );
      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, drawable.webGLBlock.projectionMatrixArray );

      // TODO: The following line of code is a guess based on things seen elsewhere.  Should this uniform be in shaderProgram.uniformLocations?
      gl.uniform1i( drawable.uniformSamplerLoc, 0 );

      //gl.drawArrays( gl.TRIANGLE_STRIP, 0, this.particleData.length * 4 );
      gl.drawElements( gl.TRIANGLE_STRIP, elementData.length, gl.UNSIGNED_SHORT, 0 );

      shaderProgram.unuse();
    },

    /**
     * TODO: Document this once finalized (and when I understand it better).
     * @param drawable
     */
    disposeWebGLDrawable: function( drawable ) {
      drawable.shaderProgram.dispose();
      drawable.gl.deleteBuffer( drawable.vertexBuffer );
      drawable.gl.deleteBuffer( drawable.textureBuffer );
      drawable.gl.deleteBuffer( drawable.elementBuffer );

      drawable.shaderProgram = null;
    },

    clearParticleData: function() {
      this.particleData = [];
    },

    /**
     * Check if the provided particle is in the current rendering bounds and, if so, create a particle data object and
     * add it to the list that will be converted into vertex data in a subsequent step.
     * @param particle
     */
    addDataForParticle: function( particle ) {
      var xPos = this.modelViewTransform.modelToViewX( particle.positionX );
      var yPos = this.modelViewTransform.modelToViewY( particle.positionY );
      if ( this.constrainedBounds.containsCoordinates( xPos, yPos ) ) {
        this.particleData.push( {
          xPos: this.modelViewTransform.modelToViewX( particle.positionX ),
          yPos: this.modelViewTransform.modelToViewY( particle.positionY ),
          type: particle.getType()
        } );
      }
    },

    /**
     * Update the representation shown in the canvas based on the model state.  This is intended to be called any time
     * one or more particles move in a given time step, which means once per frame or less.
     */
    update: function() {
      var self = this;
      this.clearParticleData();

      // TODO: Would it be substantially more efficient to do a C-style loop here?
      this.neuronModel.backgroundParticles.forEach( function( backgroundParticle ) {
        self.addDataForParticle( backgroundParticle );
      } );

      // TODO: Would it be substantially more efficient to do a C-style loop here?
      this.neuronModel.transientParticles.forEach( function( transientParticle ) {
        self.addDataForParticle( transientParticle );
      } );

      self.invalidatePaint();
    }
  } );
} );