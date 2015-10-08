// Copyright 2002-2015, University of Colorado Boulder

/**
 * A WebGL Scenery node that is used to render the sodium and potassium particles, a.k.a. ions, that need to be
 * portrayed in the Neuron simulation.  This node exists as an optimization, since representing every particle as an
 * individual Scenery node proved to be far too computationally intensive.
 *
 * In this node, particles are rendered using a texture that is created on a canvas.  The texture exists as a separate
 * class.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var NeuronParticlesTexture = require( 'NEURON/neuron/view/NeuronParticlesTexture' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );

  // constants
  var MAX_PARTICLES = 2000; // several trials were run and peak number of particles was 1841, so this value should be safe
  var VERTICES_PER_PARTICLE = 4; // basically one per corner of the rectangle that encloses the particle
  var POSITION_VALUES_PER_VERTEX = 2; // x and y, z is considered to be always 1
  var TEXTURE_VALUES_PER_VERTEX = 2; // x and y coordinates within the 2D texture
  var OPACITY_VALUES_PER_VERTEX = 1; // a single value from 0 to 1

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Matrix3>} zoomMatrixProperty - a matrix that tracks how zoomed in or out this node is, used to
   * determine whether a given particle needs to be rendered
   * @param {Shape} bounds
   * @constructor
   */
  function ParticlesWebGLNode( neuronModel, modelViewTransform, zoomMatrixProperty, bounds ) {
    var self = this;
    WebGLNode.call( this, {
      canvasBounds: bounds
    } );

    // Keep references to the things that needed in order to render the particles.
    this.neuronModel = neuronModel; // @private
    this.modelViewTransform = modelViewTransform; // @private
    this.viewTransformationMatrix = modelViewTransform.getMatrix(); // @private
    this.zoomMatrixProperty = zoomMatrixProperty; // @private
    this.particleBounds = bounds; // @private

    // Create the texture for the particles.
    this.particlesTexture = new NeuronParticlesTexture( modelViewTransform ); // @private

    // @private - pre-allocated arrays and values that are reused for better performance
    this.vertexData = new Float32Array( MAX_PARTICLES * VERTICES_PER_PARTICLE *
                                        ( POSITION_VALUES_PER_VERTEX + TEXTURE_VALUES_PER_VERTEX + OPACITY_VALUES_PER_VERTEX) );
    this.elementData = new Array( MAX_PARTICLES * ( VERTICES_PER_PARTICLE + 2 ) );
    this.particleData = new Array( MAX_PARTICLES );

    // pre-calculate the texture coordinates for the two different particle types
    this.sodiumTextureCoords = this.particlesTexture.getTexCoords( ParticleType.SODIUM_ION );
    this.potassiumTextureCoords = this.particlesTexture.getTexCoords( ParticleType.POTASSIUM_ION );

    // For better performance, the array of particle data objects is initialized here and the values updated rather
    // than reallocated during each update.
    for ( var i = 0; i < MAX_PARTICLES; i++ ) {
      this.particleData[ i ] = {
        xPos: 0,
        yPos: 0,
        radius: 1,
        type: null,
        opacity: 1
      };
    }
    this.numActiveParticles = 0;

    // initial update
    this.updateParticleData();

    // monitor a property that indicates when a particle state has changed and initiate a redraw
    neuronModel.on( NeuronConstants.PARTICLES_MOVED_EVENT, function() {
      self.invalidatePaint();
    } );

    // monitor a property that indicates when the zoom level and changes and initiate a redraw
    zoomMatrixProperty.link( function() { self.invalidatePaint(); } );
  }

  return inherit( WebGLNode, ParticlesWebGLNode, {

    /**
     * Initialization routine called by the base class that sets up the vertex and fragment shaders and does other
     * initialization.
     * @param {WebGLNodeDrawable} drawable
     * @public
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
        '  gl_FragColor.a *= vOpacity;',
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
      drawable.uniformSamplerLoc = gl.getUniformLocation( drawable.shaderProgram.program, 'uSampler' );

      // bind the texture that contains the particle images
      this.bindTextureImage( drawable, this.particlesTexture.canvas );
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

      // Convert particle data to vertices that represent a rectangle plus texture coordinates.
      var vertexDataIndex = 0;
      var elementDataIndex = 0;
      var elementDataValue = 0;
      for ( i = 0; i < this.numActiveParticles; i++ ) {

        // convenience var
        var particleDatum = this.particleData[ i ];

        // Tweak Alert!  The radii of the particles are adjusted here in order to look correct.
        // TODO: I (jblanco) am not entirely sure why this is needed in order to look right.  This should be investigated if retained.
        var adjustedParticleRadius;
        var textureCoordinates;
        if ( particleDatum.type === ParticleType.SODIUM_ION ){
          adjustedParticleRadius = particleDatum.radius * 1.9;
          textureCoordinates = this.sodiumTextureCoords;
        }
        else if ( particleDatum.type === ParticleType.POTASSIUM_ION ){
          adjustedParticleRadius = particleDatum.radius * 2.1;
          textureCoordinates = this.potassiumTextureCoords;
        }

        //-------------------------------------------------------------------------------------------------------------
        // Add the vertex data.  Though WebGL uses 3 component vectors, this only assigns x and y values because z is
        // assumed to be 1.  This is not done in a loop in order to get optimal performance.
        //-------------------------------------------------------------------------------------------------------------

        // upper left vertex position
        this.vertexData[ vertexDataIndex++ ] = particleDatum.xPos - adjustedParticleRadius;
        this.vertexData[ vertexDataIndex++ ] = particleDatum.yPos - adjustedParticleRadius;

        // texture coordinate, which is a 2-component vector
        this.vertexData[ vertexDataIndex++ ] = textureCoordinates.minX; // x texture coordinate
        this.vertexData[ vertexDataIndex++ ] = textureCoordinates.minY; // y texture coordinate

        // opacity, which is a single value
        this.vertexData[ vertexDataIndex++ ] = particleDatum.opacity;

        // lower left vertex position
        this.vertexData[ vertexDataIndex++ ] = particleDatum.xPos - adjustedParticleRadius;
        this.vertexData[ vertexDataIndex++ ] = particleDatum.yPos + adjustedParticleRadius;

        // texture coordinate, which is a 2-component vector
        this.vertexData[ vertexDataIndex++ ] = textureCoordinates.minX; // x texture coordinate
        this.vertexData[ vertexDataIndex++ ] = textureCoordinates.maxY; // y texture coordinate

        // opacity, which is a single value
        this.vertexData[ vertexDataIndex++ ] = particleDatum.opacity;

        // upper right vertex position
        this.vertexData[ vertexDataIndex++ ] = particleDatum.xPos + adjustedParticleRadius;
        this.vertexData[ vertexDataIndex++ ] = particleDatum.yPos - adjustedParticleRadius;

        // texture coordinate, which is a 2-component vector
        this.vertexData[ vertexDataIndex++ ] = textureCoordinates.maxX; // x texture coordinate
        this.vertexData[ vertexDataIndex++ ] = textureCoordinates.minY; // y texture coordinate

        // opacity, which is a single value
        this.vertexData[ vertexDataIndex++ ] = particleDatum.opacity;

        // lower right vertex position
        this.vertexData[ vertexDataIndex++ ] = particleDatum.xPos + adjustedParticleRadius;
        this.vertexData[ vertexDataIndex++ ] = particleDatum.yPos + adjustedParticleRadius;

        // texture coordinate, which is a 2-component vector
        this.vertexData[ vertexDataIndex++ ] = textureCoordinates.maxX; // x texture coordinate
        this.vertexData[ vertexDataIndex++ ] = textureCoordinates.maxY; // y texture coordinate

        // opacity, which is a single value
        this.vertexData[ vertexDataIndex++ ] = particleDatum.opacity;

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
     * bind the canvas that contains the particle images as a texture
     * @param drawable
     */
    bindTextureImage: function( drawable, canvas ) {
      var gl = drawable.gl;

      gl.bindTexture( gl.TEXTURE_2D, drawable.texture );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

      // Texture filtering, see http://learningwebgl.com/blog/?p=571
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );

      // ship the texture data to the GPU
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );

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
      var radius = this.modelViewTransform.modelToViewDeltaX( particle.getRadius() );

      // Figure out the location and radius of the zoomed particle.
      var zoomMatrix = this.zoomMatrixProperty.value;
      var zoomedXPos = zoomMatrix.m00() * xPos + zoomMatrix.m02();
      var zoomedYPos = zoomMatrix.m11() * yPos + zoomMatrix.m12();
      var zoomedRadius = zoomMatrix.m00() * radius;

      // Only add the particle if its zoomed location is within the bounds being shown.
      if ( this.particleBounds.containsCoordinates( zoomedXPos, zoomedYPos ) ) {
        var particleDataEntry = this.particleData[ this.numActiveParticles ];
        particleDataEntry.xPos = zoomedXPos;
        particleDataEntry.yPos = zoomedYPos;
        particleDataEntry.radius = zoomedRadius;
        particleDataEntry.type = particle.getType();
        particleDataEntry.opacity = particle.getOpacity();
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