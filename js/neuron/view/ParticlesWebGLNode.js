// Copyright 2015-2017, University of Colorado Boulder

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
  var neuron = require( 'NEURON/neuron' );
  var NeuronParticlesTexture = require( 'NEURON/neuron/view/NeuronParticlesTexture' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
  var Vector2 = require( 'DOT/Vector2' );
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
    WebGLNode.call( this, ParticlesPainter, {
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
    this.elementData = new Uint16Array( MAX_PARTICLES * ( VERTICES_PER_PARTICLE + 2 ) );
    this.particleData = new Array( MAX_PARTICLES );

    // pre-calculate the texture coordinates for the two different particle types
    this.sodiumTextureCoords = this.particlesTexture.getTexCoords( ParticleType.SODIUM_ION );
    this.potassiumTextureCoords = this.particlesTexture.getTexCoords( ParticleType.POTASSIUM_ION );

    for ( var i = 0; i < MAX_PARTICLES; i++ ) {

      // For better performance, the array of particle data objects is initialized here and the values updated rather
      // than reallocated during each update.
      this.particleData[ i ] = {
        pos: new Vector2(),
        radius: 1,
        type: null,
        opacity: 1
      };

      // Also for better performance, the element data is initialized at the start for the max number of particles.
      var indexBase = i * 6;
      var valueBase = i * 4;
      this.elementData[ indexBase ] = valueBase;
      this.elementData[ indexBase + 1 ] = valueBase + 1;
      this.elementData[ indexBase + 2 ] = valueBase + 2;
      this.elementData[ indexBase + 3 ] = valueBase + 3;
      if ( i + 1 < MAX_PARTICLES ) {
        // Add the 'degenerate triangle' that will force a discontinuity in the triangle strip.
        this.elementData[ indexBase + 4 ] = valueBase + 3;
        this.elementData[ indexBase + 5 ] = valueBase + 4;
      }
    }

    this.numActiveParticles = 0; // @private

    // initial update
    this.updateParticleData();

    // monitor a property that indicates when a particle state has changed and initiate a redraw
    neuronModel.particlesMoved.addListener( function() {
      self.invalidatePaint();
    } );

    // monitor a property that indicates whether all ions are being depicted and initiate a redraw on a change
    neuronModel.allIonsSimulatedProperty.lazyLink( function() {
      self.invalidatePaint();
    } );

    // monitor a property that indicates when the zoom level and changes and initiate a redraw
    zoomMatrixProperty.lazyLink( function() {
      self.invalidatePaint();
    } );

    /**
     * There is an issue in Scenery where, if nothing is drawn, whatever was previously drawn stays there.  This was
     * causing problems in this sim when turning off the "Show All Ions" setting, see
     * https://github.com/phetsims/neuron/issues/100.  The Scenery issue is
     * https://github.com/phetsims/scenery/issues/503.  To work around this problem, a property was added to the model
     * and linked here that can be used to set the node invisible if there are no particles to be rendered.  This can
     * probably be removed if and when the Scenery issue is addressed.
     */
    neuronModel.atLeastOneParticlePresentProperty.lazyLink( function( atLeastOneParticlePresent ) {
      self.visible = atLeastOneParticlePresent;
      self.invalidatePaint();
    } );
  }

  neuron.register( 'ParticlesWebGLNode', ParticlesWebGLNode );

  inherit( WebGLNode, ParticlesWebGLNode, {

    /**
     * Check if the provided particle is in the current rendering bounds and, if so, create a particle data object and
     * add it to the list that will be converted into vertex data in a subsequent step.
     * @param {Particle} particle
     * @private
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
        particleDataEntry.pos.setXY( zoomedXPos, zoomedYPos );
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
     * @private
     */
    updateParticleData: function() {
      this.numActiveParticles = 0;

      // For better performance, we loop over the arrays contained within the observable arrays rather than using the
      // forEach function.  This is much more efficient.  Note that this is only safe if no mods are made to the
      // contents of the observable array.

      var i;
      var particleArray = this.neuronModel.backgroundParticles.getArray();

      for ( i = 0; i < particleArray.length; i++ ) {
        this.addParticleData( particleArray[ i ] );
      }

      particleArray = this.neuronModel.transientParticles.getArray();

      for ( i = 0; i < particleArray.length; i++ ) {
        this.addParticleData( particleArray[ i ] );
      }

      particleArray = this.neuronModel.playbackParticles.getArray();

      for ( i = 0; i < particleArray.length; i++ ) {
        this.addParticleData( particleArray[ i ] );
      }
    }

  } );

  /**
   * Constructor for the object that will do the actual painting for this node.  This constructor, rather than an
   * instance, is passed to the parent WebGLNode type.
   * @constructor
   * @param {WebGLRenderingContext} gl
   * @param {WaveWebGLNode} node
   */
  function ParticlesPainter( gl, node ) {
    this.gl = gl;
    this.node = node;

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
      '  gl_FragColor = texture2D( uSampler, vTextureCoordinate );',
      '  gl_FragColor.a *= vOpacity;',
      '}'
    ].join( '\n' );

    this.shaderProgram = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource, {
      attributes: [ 'aPosition', 'aTextureCoordinate', 'aOpacity' ],
      uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix' ]
    } );

    this.texture = gl.createTexture();
    this.vertexBuffer = gl.createBuffer();
    this.elementBuffer = gl.createBuffer();

    // bind the texture that contains the particle images
    gl.bindTexture( gl.TEXTURE_2D, this.texture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
    // Texture filtering, see http://learningwebgl.com/blog/?p=571
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    // ship the texture data to the GPU
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.node.particlesTexture.canvas );

    // generate a mipmap for better handling of zoom in/out
    gl.generateMipmap( gl.TEXTURE_2D );
  }

  inherit( Object, ParticlesPainter, {
    paint: function( modelViewMatrix, projectionMatrix ) {
      var gl = this.gl;
      var shaderProgram = this.shaderProgram;
      var i; // loop index

      this.node.updateParticleData();

      // Convert particle data to vertices that represent a rectangle plus texture coordinates.
      var vertexDataIndex = 0;
      for ( i = 0; i < this.node.numActiveParticles; i++ ) {

        // convenience var
        var particleDatum = this.node.particleData[ i ];

        // Tweak Alert!  The radii of the particles are adjusted here in order to look correct.
        var adjustedParticleRadius;
        var textureCoordinates;
        if ( particleDatum.type === ParticleType.SODIUM_ION ) {
          adjustedParticleRadius = particleDatum.radius * 1.9;
          textureCoordinates = this.node.sodiumTextureCoords;
        }
        else if ( particleDatum.type === ParticleType.POTASSIUM_ION ) {
          adjustedParticleRadius = particleDatum.radius * 2.1;
          textureCoordinates = this.node.potassiumTextureCoords;
        }

        //-------------------------------------------------------------------------------------------------------------
        // Add the vertex data.  Though WebGL uses 3 component vectors, this only assigns x and y values because z is
        // assumed to be 1.  This is not done in a loop in order to get optimal performance.
        //-------------------------------------------------------------------------------------------------------------

        // upper left vertex position
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.pos.x - adjustedParticleRadius;
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.pos.y - adjustedParticleRadius;

        // texture coordinate, which is a 2-component vector
        this.node.vertexData[ vertexDataIndex++ ] = textureCoordinates.minX; // x texture coordinate
        this.node.vertexData[ vertexDataIndex++ ] = textureCoordinates.minY; // y texture coordinate

        // opacity, which is a single value
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.opacity;

        // lower left vertex position
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.pos.x - adjustedParticleRadius;
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.pos.y + adjustedParticleRadius;

        // texture coordinate, which is a 2-component vector
        this.node.vertexData[ vertexDataIndex++ ] = textureCoordinates.minX; // x texture coordinate
        this.node.vertexData[ vertexDataIndex++ ] = textureCoordinates.maxY; // y texture coordinate

        // opacity, which is a single value
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.opacity;

        // upper right vertex position
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.pos.x + adjustedParticleRadius;
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.pos.y - adjustedParticleRadius;

        // texture coordinate, which is a 2-component vector
        this.node.vertexData[ vertexDataIndex++ ] = textureCoordinates.maxX; // x texture coordinate
        this.node.vertexData[ vertexDataIndex++ ] = textureCoordinates.minY; // y texture coordinate

        // opacity, which is a single value
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.opacity;

        // lower right vertex position
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.pos.x + adjustedParticleRadius;
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.pos.y + adjustedParticleRadius;

        // texture coordinate, which is a 2-component vector
        this.node.vertexData[ vertexDataIndex++ ] = textureCoordinates.maxX; // x texture coordinate
        this.node.vertexData[ vertexDataIndex++ ] = textureCoordinates.maxY; // y texture coordinate

        // opacity, which is a single value
        this.node.vertexData[ vertexDataIndex++ ] = particleDatum.opacity;
      }

      // Load the vertex data into the GPU.
      gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, this.node.vertexData, gl.DYNAMIC_DRAW );

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
      gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer );
      gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.node.elementData, gl.STATIC_DRAW );

      shaderProgram.use();

      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, modelViewMatrix.entries );
      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, projectionMatrix.entries );

      // activate and bind the texture
      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_2D, this.texture );
      gl.uniform1i( shaderProgram.uniformLocations.uSampler, 0 );

      // add the element data
      gl.drawElements( gl.TRIANGLE_STRIP, this.node.numActiveParticles * 6 - 2, gl.UNSIGNED_SHORT, 0 );

      shaderProgram.unuse();

      return WebGLNode.PAINTED_SOMETHING;
    },

    dispose: function() {
      this.shaderProgram.dispose();
      this.gl.deleteBuffer( this.vertexBuffer );
      this.gl.deleteTexture( this.texture );
      this.gl.deleteBuffer( this.elementBuffer );
      this.shaderProgram = null;
    }
  } );

  return ParticlesWebGLNode;
} );