// Copyright 2002-2015, University of Colorado Boulder

/**
 * A WebGL Scenery node that is used to render the sodium and potassium particles, a.k.a. atoms, that need to be
 * portrayed in the Neuron simulation.  This node exists an optimization, since representing every particle as an
 * individual Scenery node proved to be far too computationally intensive.
 *
 * TODO: Elaborate on the specific approach used if this node is retained.
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var ParticleTextureMap = require( 'NEURON/neuron/view/ParticleTextureMap2' );
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MAX_PARTICLES = 2000; // several trials were run and peak number of particles was 1841, so this value should be safe
  var PRINT_DATA_URL_OF_SPRITE_SHEET = true; // very useful for debugging issues with the sprite sheet texture
  var VERTICES_PER_PARTICLE = 4; // basically one per corner of the rectangle that encloses the particle
  var POSITION_VALUES_PER_VERTEX = 2; // x and y, z is considered to be always 1
  var TEXTURE_VALUES_PER_VERTEX = 2; // x and y coordinates within the 2D texture
  var OPACITY_VALUES_PER_VERTEX = 1; // a single value from 0 to 1

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<number>} zoomProperty
   * @param {Property.<Matrix3>} zoomMatrixProperty - a matrix that tracks how zoomed in or out this node is, used to
   * determine whether a given particle needs to be rendered
   * @param {Shape} bounds
   * @constructor
   */
  function ParticlesWebGLNode( neuronModel, modelViewTransform, zoomProperty, zoomMatrixProperty, bounds ) {
    var self = this;
    WebGLNode.call( this, {
      canvasBounds: bounds
    } );

    // Keep references to the things that needed in order to render the particles.
    this.neuronModel = neuronModel;
    this.modelViewTransform = modelViewTransform;
    this.viewTransformationMatrix = modelViewTransform.getMatrix();
    this.particleTextureMap = new ParticleTextureMap( modelViewTransform, zoomProperty );
    this.zoomMatrixProperty = zoomMatrixProperty;
    this.particleBounds = bounds;

    // Create the canvas on which particle tiles are drawn and used as a texture.
    this.particleTextureCanvas = document.createElement( 'canvas' );
    this.particleCanvasContext = this.particleTextureCanvas.getContext( '2d' );

    // flag to indicate whether the texture needs to be updated on next paint
    this.textureDirty = true;

    // The texture must be updated when the zoom factor changes.
    zoomProperty.lazyLink( function() {
      self.textureDirty = true;
    } );

    // Set up some variables for reuse instead of reallocating them with each repaint.  This improves performance.
    this.vertexData = new Float32Array( MAX_PARTICLES * VERTICES_PER_PARTICLE *
                                        ( POSITION_VALUES_PER_VERTEX + TEXTURE_VALUES_PER_VERTEX + OPACITY_VALUES_PER_VERTEX) );
    this.elementData = new Array( MAX_PARTICLES * ( VERTICES_PER_PARTICLE + 2 ) );
    this.texCoords = new Bounds2( 0, 0, 0, 0 ); // The normalized texture coordinates that corresponds to the vertex corners
    this.vertexCords = new Bounds2( 0, 0, 0, 0 );// the rectangle bounds of a particle (used to create 2 triangles)
    this.tilePosVector = new Vector2();
    this.particleViewPosition = new Vector2();

    // For better performance, an array of particle data objects is allocated now, and their values are updated rather
    // than discarded and reallocated.
    this.particleData = new Array( MAX_PARTICLES );
    for ( var i = 0; i < MAX_PARTICLES; i++ ) {
      this.particleData[ i ] = {
        xPos: 0,
        yPos: 0,
        type: null,
        opacity: 1
      };
    }
    this.numActiveParticles = 0;

    // initial update
    this.updateParticleData();

    // Monitor a property that indicates when a particle state has changed and initiate a redraw.
    neuronModel.on( NeuronConstants.PARTICLES_MOVED_EVENT, function() {
      self.invalidatePaint();
    } );
  }

  return inherit( WebGLNode, ParticlesWebGLNode, {

    /**
     * Initialization routine called by the base class that sets up the vertex and fragment shaders and does other
     * initialization.
     * @param {WebGLNodeDrawable} drawable
     */
    initializeWebGLDrawable: function( drawable ) {
      var gl = drawable.gl;

      // vertex shader
      var vertexShaderSource = [
        'attribute vec2 aPosition;',
        'attribute vec2 aTextureCoordinate;',
        'attribute float aOpacity;',
        'varying vec2 vTextureCoordinate;',
        'varying float vOpacity;',
        'uniform mat3 uModelViewMatrix;',
        'uniform mat3 uProjectionMatrix;',

        'void main( void ) {',
        // homogeneous model-view transformation
        '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',
        // homogeneous map to to normalized device coordinates
        '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',
        // texture coordinate
        '  vTextureCoordinate = aTextureCoordinate;',
        // opacity
        '  vOpacity = aOpacity;',
        // assume a z value of 1 for the position
        '  gl_Position = vec4( ndc.xy, 1.0, 1.0 );',
        '}'
      ].join( '\n' );

      // fragment shader
      var fragmentShaderSource = [
        'precision mediump float;',
        'varying vec2 vTextureCoordinate;',
        'varying float vOpacity;',
        'uniform sampler2D uSampler;',
        'void main( void ) {',
        // TODO: I (jblanco) am leaving some commented-out code below for ease of testing, these should be removed
        // when all the WebGL functionality has been finalized.
        //'  gl_FragColor = texture2D(uSampler, vec2(0.5, 0.5));',
        //'  gl_FragColor = vec4( 0, 0, 0, 1 );',
        //'  gl_FragColor = vec4( 0, 1, 0, 0.1 );',
        '  gl_FragColor = texture2D( uSampler, vTextureCoordinate );',
        '  if ( gl_FragColor.a > 0.0 ){',
        '    gl_FragColor.a = vOpacity;',
        '  }',
        '}'
      ].join( '\n' );

      drawable.shaderProgram = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource, {
        attributes: [ 'aPosition', 'aTextureCoordinate', 'aOpacity' ],
        uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix' ]
      } );

      drawable.texture = gl.createTexture();
      drawable.vertexBuffer = gl.createBuffer();
      drawable.elementBuffer = gl.createBuffer();

      // TODO: I'm totally guessing on the following, based on some examples I've been looking at (jblanco).  Should
      // the uniform go into the ShaderProgram abstraction?  Ashraf doesn't seem to use it at all, so maybe it isn't
      // necessary.
      drawable.uniformSamplerLoc = gl.getUniformLocation( drawable.shaderProgram.program, "uSampler" );
    },

    /**
     * method that is called by Scenery to repaint this node
     * @param {WebGLDrawable} drawable
     * @param {Matrix3} matrix
     */
    paintWebGLDrawable: function( drawable, matrix ) {
      var gl = drawable.gl;
      var shaderProgram = drawable.shaderProgram;
      var i; // loop index

      this.updateParticleData();

      if ( this.textureDirty ) {
        this.updateTexture( drawable );
        this.textureDirty = false;
      }

      // Convert particle data to vertices that represent a rectangle plus texture coordinates.
      var vertexDataIndex = 0;
      var elementDataIndex = 0;
      var elementDataValue = 0;
      for ( i = 0; i < this.numActiveParticles; i++ ) {

        // convenience var
        var particleDatum = this.particleData[ i ];

        // Get the particle view size as it currently exists in the texture map (which is based on the zoom level).
        var particleSize = this.particleTextureMap.getParticleSize( particleDatum.type );

        // Get the texture coordinates.  For performance reasons, this method updates pre-allocated values.
        this.particleTextureMap.getTexCords( particleDatum.type, this.tilePosVector, this.texCoords );

        // Add the vertices, which essentially represent the four corners that enclose the particle.
        for ( var j = 0; j < VERTICES_PER_PARTICLE; j++ ) {

          // vertex, which is a 2-component vector (z is assumed to be 1)
          this.vertexData[ vertexDataIndex++ ] = particleDatum.xPos + particleSize / 2 * ( j < 2 ? -1 : 1 );
          this.vertexData[ vertexDataIndex++ ] = particleDatum.yPos + particleSize / 2 * ( j % 2 === 0 ? -1 : 1 );

          // texture coordinate, which is a 2-component vector
          this.vertexData[ vertexDataIndex++ ] = j < 2 ? this.texCoords.minX : this.texCoords.maxX; // x texture coordinate
          this.vertexData[ vertexDataIndex++ ] = j % 2 === 0 ? this.texCoords.minY : this.texCoords.maxY; // y texture coordinate

          // opacity, which is a single value
          this.vertexData[ vertexDataIndex++ ] = particleDatum.opacity;
        }

        // Add the element indices.  This is done so that we can create 'degenerate triangles' and thus have
        // discontinuities in the triangle strip, thus creating separate rectangles.
        this.elementData[ elementDataIndex++ ] = elementDataValue++;
        this.elementData[ elementDataIndex++ ] = elementDataValue++;
        this.elementData[ elementDataIndex++ ] = elementDataValue++;
        this.elementData[ elementDataIndex++ ] = elementDataValue;
        if ( i + 1 < this.numActiveParticles ) {
          // Add the 'degenerate triangle' that will force a discontinuity in the triangle strip.
          this.elementData[ elementDataIndex++ ] = elementDataValue++;
          this.elementData[ elementDataIndex++ ] = elementDataValue;
        }
      }

      // Load the vertex data into the GPU.
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW );

      // Set up the attributes that will be passed into the vertex shader.
      var elementSize = Float32Array.BYTES_PER_ELEMENT;
      var elementsPerVertex = POSITION_VALUES_PER_VERTEX + TEXTURE_VALUES_PER_VERTEX + OPACITY_VALUES_PER_VERTEX;
      var stride = elementSize * elementsPerVertex;
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, stride, 0 );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aTextureCoordinate, 2, gl.FLOAT, false, stride,
        elementSize * TEXTURE_VALUES_PER_VERTEX );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aOpacity, 1, gl.FLOAT, false, stride,
        elementSize * ( POSITION_VALUES_PER_VERTEX + TEXTURE_VALUES_PER_VERTEX ) );

      // Load the element data into the GPU.
      gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, drawable.elementBuffer );
      gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( this.elementData ), gl.STATIC_DRAW );

      shaderProgram.use();

      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, matrix.entries );
      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, drawable.webGLBlock.projectionMatrixArray );

      // TODO: The following line of code is a guess based on things seen elsewhere.  Should this uniform be in shaderProgram.uniformLocations?
      gl.uniform1i( drawable.uniformSamplerLoc, 0 );

      // add the element data
      gl.drawElements( gl.TRIANGLE_STRIP, elementDataIndex, gl.UNSIGNED_SHORT, 0 );

      shaderProgram.unuse();
    },

    /**
     * Update the texture that is used to render the individual particles.  This is generally called when the zoom
     * amount is changed.  This also binds the texture.
     */
    updateTexture: function( drawable ) {
      this.particleCanvasContext.clearRect( 0, 0, this.particleTextureCanvas.width, this.particleTextureCanvas.height );
      this.particleTextureMap.updateSpriteSheetDimensions();
      this.particleTextureMap.calculateAndAssignCanvasDimensions( this.particleTextureCanvas );
      this.particleTextureMap.createTiles( this.particleCanvasContext );
      if ( PRINT_DATA_URL_OF_SPRITE_SHEET ) {
        console.log( 'this.particleTextureCanvas.toDataURL() = ' + this.particleTextureCanvas.toDataURL() );
      }
      this.bindTextureImage( drawable );
    },

    /**
     * bind the tiles canvas as a texture
     * @param drawable
     */
    bindTextureImage: function( drawable ) {
      var gl = drawable.gl;

      gl.bindTexture( gl.TEXTURE_2D, drawable.texture );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

      // The alpha is not pre-multiplied in the generated canvas image.  This results in white patch in the place
      // of transparent rectangle if this next step isn't done.
      gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true );

      // Texture filtering, see http://learningwebgl.com/blog/?p=571
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );

      // ship the texture data to the GPU
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.particleTextureCanvas );

      // generate a mipmap for better handling of zoom in/out
      gl.generateMipmap( gl.TEXTURE_2D );
    },

    disposeWebGLDrawable: function( drawable ) {
      drawable.shaderProgram.dispose();
      drawable.gl.deleteBuffer( drawable.vertexBuffer );
      drawable.gl.deleteTexture( drawable.texture );
      drawable.gl.deleteBuffer( drawable.elementBuffer );

      drawable.shaderProgram = null;
    },

    /**
     * Check if the provided particle is in the current rendering bounds and, if so, create a particle data object and
     * add it to the list that will be converted into vertex data in a subsequent step.
     * @param particle
     */
    addParticleData: function( particle ) {
      var xPos = this.modelViewTransform.modelToViewX( particle.positionX );
      var yPos = this.modelViewTransform.modelToViewY( particle.positionY );

      // Figure out the location of the zoomed particle and then determine whether that location is within the bounds.
      // This is done in order to effectively clip the particle rendering region, since clip areas are not supported
      // in WebGLNode as of this writing (Aug 3 2010).
      var zoomMatrix = this.zoomMatrixProperty.value;
      var zoomedXPos = zoomMatrix.m00() * xPos + zoomMatrix.m02();
      var zoomedYPos = zoomMatrix.m11() * yPos + zoomMatrix.m12();
      if ( this.particleBounds.containsCoordinates( zoomedXPos, zoomedYPos ) ) {
        var particleDataEntry = this.particleData[ this.numActiveParticles ];
        particleDataEntry.xPos = zoomedXPos;
        particleDataEntry.yPos = zoomedYPos;
        particleDataEntry.type = particle.getType();
        particleDataEntry.opacity = particle.getOpaqueness();
        assert && assert( this.numActiveParticles < MAX_PARTICLES - 1 );
        this.numActiveParticles = Math.min( this.numActiveParticles + 1, MAX_PARTICLES );
      }
    },

    /**
     * Update the representation shown in the canvas based on the model state.  This is intended to be called any time
     * one or more particles move in a given time step, which means once per frame or less.
     */
    updateParticleData: function() {
      var self = this;
      this.numActiveParticles = 0;

      // For better performance, we loop over the arrays contained within the observable arrays rather than using the
      // forEach function.  This is much more efficient.  Note that this is only safe if no mods are made to the
      // contents of the observable array.

      var i = 0;
      var particleArray = this.neuronModel.backgroundParticles.getArray();

      for ( i = 0; i < particleArray.length; i++ ) {
        self.addParticleData( particleArray[ i ] );
      }

      particleArray = this.neuronModel.transientParticles.getArray();

      for ( i = 0; i < particleArray.length; i++ ) {
        self.addParticleData( particleArray[ i ] );
      }

      particleArray = this.neuronModel.playbackParticles.getArray();

      for ( i = 0; i < particleArray.length; i++ ) {
        self.addParticleData( particleArray[ i ] );
      }
    }
  } );
} );