// Copyright 2002-2015, University of Colorado Boulder

/**
 * A WebGL Scenery node that is used to render particles.  This is done as an optimization, since representing every
 * particle as an individual Scenery node proved to be too computationally intensive.
 *
 * Note to self: This version is an attempt to use Ashraf's sprite sheet approach for handling opacity.
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
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var ParticleTextureMap = require( 'NEURON/neuron/view/ParticleTextureMap' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var particlesTextureImage = require( 'image!NEURON/neuron-particles-texture-32x32.png' );

  // constants
  var SQUARE_SIDE_LENGTH = 5; // empirically determined
  var SQUARE_HALF_DIAGONAL_LENGTH = ( SQUARE_SIDE_LENGTH * Math.sqrt( 2 ) ) / 2;
  var SQUARE_VERTEX_OFFSETS = [
    new Vector2( -SQUARE_HALF_DIAGONAL_LENGTH, SQUARE_HALF_DIAGONAL_LENGTH ),
    new Vector2( -SQUARE_HALF_DIAGONAL_LENGTH, -SQUARE_HALF_DIAGONAL_LENGTH ),
    new Vector2( SQUARE_HALF_DIAGONAL_LENGTH, SQUARE_HALF_DIAGONAL_LENGTH ),
    new Vector2( SQUARE_HALF_DIAGONAL_LENGTH, -SQUARE_HALF_DIAGONAL_LENGTH )
  ];

  var MAX_PARTICLES = 1000; // ran several trials and peak was 882, so this value should be safe

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

    // Keep references to the things that needed in order to render the particles.
    // TODO: Check that all of these are used and needed.
    this.neuronModel = neuronModel;
    this.modelViewTransform = modelViewTransform;
    this.viewTransformationMatrix = modelViewTransform.getMatrix();
    this.particleTextureMap = new ParticleTextureMap( modelViewTransform, zoomProperty );
    this.zoomProperty = zoomProperty;
    this.zoomableRootNode = zoomableRootNode;
    this.particleBounds = bounds;
    this.visibleParticlesSize = 0; // Only Particles within the clipping region of Zoomable Node are considered visible
    this.allParticles = [];

    // Create the canvas on which particle tiles are drawn and used as a texture.
    // TODO: Maybe rename this to something like "particleTextureCanvas".
    this.canvas = document.createElement( 'canvas' );
    // TODO: Maybe rename this to canvasContext.
    this.context = this.canvas.getContext( '2d' );

    // The texture must be updated when the zoom factor changes.
    // TODO: Turned off to get it working without zoom, don't forget to turn on and get working.
    //zoomProperty.link( function() {
    //  self.updateTexture();
    //} );

    // constrain the bounds so that the generated shapes aren't off the edge of the canvas
    this.constrainedBounds = bounds.dilated( -SQUARE_SIDE_LENGTH / 2 );

    // Set up some values for reuse instead of reallocating them with each repaint.  This improves performance.
    this.texCoords = new Bounds2( 0, 0, 0, 0 ); // The normalized texture coordinates that corresponds to the vertex corners
    this.vertexCords = new Bounds2( 0, 0, 0, 0 );// the rectangle bounds of a particle (used to create 2 triangles)
    this.tilePosVector = new Vector2();
    this.particleViewPosition = new Vector2();

    // initial update
    this.update();

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
      console.log( 'initializeWebGLDrawable called' );

      var gl = drawable.gl;

      // vertex shader
      var vertexShaderSource = [
        'attribute vec3 aPosition;',
        'attribute vec2 aTextureCoordinate;',
        'varying vec2 vTextureCoordinate;',
        'uniform mat3 uModelViewMatrix;',
        'uniform mat3 uProjectionMatrix;',

        'void main( void ) {',
        // homogeneous model-view transformation
        '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',
        // homogeneous map to to normalized device coordinates
        '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',
        // texture coordinate
        '  vTextureCoordinate = aTextureCoordinate;',
        // assume a z value of 1 for the actual position
        '  gl_Position = vec4( ndc.xy, 1.0, 1.0 );',
        '}'
      ].join( '\n' );

      // fragment shader
      var fragmentShaderSource = [
        'precision mediump float;',
        'varying vec2 vTextureCoordinate;',
        'uniform sampler2D uSampler;',
        'void main( void ) {',
        //'  gl_FragColor = texture2D(uSampler, vec2(0.5, 0.5));',
        //'  gl_FragColor = vec4( 0, 0, 0, 1 );',
        //'  gl_FragColor = vec4( 0, 1, 0, 0.5 );',
        '  gl_FragColor = texture2D(uSampler, vTextureCoordinate);',
        '}'
      ].join( '\n' );
      //var fragmentShaderSource = [
      //  'precision mediump float;',
      //  'varying vec2 vTextureCoordinate;',
      //  'uniform sampler2D uSampler;',
      //  'void main( void ) {',
      //  '  gl_FragColor = texture2D(uSampler, vTextureCoordinate);',
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
      this.updateTexture( drawable );

      /*
      drawable.texture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, drawable.texture );
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, particlesTextureImage );
      //gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
      //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
      //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST );
      //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
      //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST );
      //gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
      gl.generateMipmap( gl.TEXTURE_2D );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT );
      */

      // TODO: I'm totally guessing on the following, based on some examples I've been looking at (jblanco).  Should
      // the uniform go into the ShaderProgram abstraction?  Ashraf doesn't seem to use it at all, so maybe it isn't
      // necessary.
      drawable.uniformSamplerLoc = gl.getUniformLocation( drawable.shaderProgram.program, "uSampler" );

      console.log( 'initializeWebGLDrawable exited' );
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

      // TODO: doc
      var tilePosVector = this.tilePosVector;

      // Convert particle data to vertices that represent a rectangle plus texture coordinates.
      // TODO: Should optimize to define the vertex data once and reuse instead of reallocating each time.
      var vertexData = [];
      this.particleData.forEach( function( particleDatum ) {

        // Get the particle view size as it currently exists in the texture map (which is based on the zoom level).
        var particleSize = self.particleTextureMap.getParticleSize( particleDatum.type );

        // Get the texture coordinates.  For performance reasons, this method updates pre-allocated values.
        self.particleTextureMap.getTexCords( particleDatum.type, particleDatum.opacity, self.tilePosVector, self.texCoords );

        // TODO: Faster to use C-style?
        _.times( 4, function( index ) {

          // vertex, which is a 2-component vector (z is assumed to be 1)
          vertexData.push( particleDatum.xPos + particleSize / 2 * ( index < 2 ? -1 : 1 ) );
          vertexData.push( particleDatum.yPos + particleSize / 2 * ( index % 2 === 0 ? -1 : 1 ) );

          // texture coordinate, which is a 2-component vector
          vertexData.push( index < 2 ? self.texCoords.minX : self.texCoords.maxX ); // x texture coordinate
          vertexData.push( index % 2 === 0 ? self.texCoords.minY : self.texCoords.maxY ); // y texture coordinate
        } );
      } );

      // Load the vertex data into the GPU.
      var elementSize = Float32Array.BYTES_PER_ELEMENT;
      var elementsPerVertex = 2 + 2; // xy vertex + texture coordinate
      var stride = elementSize * elementsPerVertex;
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
      // TODO: I (jblanco) believe that Ashraf allocated the vertex data once, and I think I'm doing it for every render.  I should look at using his approach.
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertexData ), gl.STATIC_DRAW );

      // Set up the attributes that will be passed into the vertex shader.
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, stride, 0 );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aTextureCoordinate, 2, gl.FLOAT, false, stride, elementSize * 2 );

      // Set up the element indices.  This is done so that we can create 'degenerate triangles' and thus have
      // discontinuities in the triangle strip, thus creating separate rectangles.
      var elementData = [];
      var count = 0;
      _.times( this.particleData.length, function( index ) {
        elementData.push( count++ );
        elementData.push( count++ );
        elementData.push( count++ );
        elementData.push( count );
        if ( index + 1 < self.particleData.length ) {
          // Add the 'degenerate triangle' that will force a discontinuity in the triangle strip.
          elementData.push( count++ );
          elementData.push( count );
        }
      } );
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
     * populates vertexData (Float32Array array) with vertex and texture data for all particles
     * TODO: Unused at one point during evolution, delete if ultimately unused.
     */
    populateVerticesTexCoords: function( vertexData ) {
      var index = 0;

      var thisNode = this;
      this.visibleParticlesSize = 0;

      // Use the same reference, the Vertex buffer array uses only the primitives, so no need to create new instances
      var tilePosVector = this.tilePosVector;
      var viewTransformationMatrix = this.viewTransformationMatrix;
      var particleViewPosition = this.particleViewPosition;

      this.allParticles.forEach( function( particle ) {

        particleViewPosition.x = particle.getPositionX();
        particleViewPosition.y = particle.getPositionY();
        viewTransformationMatrix.multiplyVector2( particleViewPosition );
        if ( !thisNode.particleViewBounds.containsCoordinates( particleViewPosition.x, particleViewPosition.y ) ) {
          return;
        }
        thisNode.visibleParticlesSize++;
        // Position according to the scaled and Translated Position of ZoomableRootNode. The zoomProperty is
        // Observed by this class and the scaleMatrix is updated from zoomableRootNode
        thisNode.zoomTransformationMatrix.multiplyVector2( particleViewPosition ); // (changes, the passed particleViewPosition)

        //center Position
        var xPos = particleViewPosition.x;
        var yPos = particleViewPosition.y;

        //for performance reasons this method updates vertexCords (and returns the same)   instead of creating a new one
        thisNode.particleTextureMap.getParticleCoords( particle.getType(), xPos, yPos, thisNode.vertexCords );

        //for performance reasons this method updates the texCords (and returns the same)  instead of creating a new one
        thisNode.particleTextureMap.getTexCords( particle.getType(), particle.getOpaqueness(), tilePosVector, thisNode.texCoords );

        //left bottom
        vertexData[ index++ ] = thisNode.vertexCords.getMinX();//x
        vertexData[ index++ ] = thisNode.vertexCords.getMaxY();//y
        vertexData[ index++ ] = thisNode.texCoords.getMinX(); //u
        vertexData[ index++ ] = thisNode.texCoords.getMaxY(); //v

        //left top
        vertexData[ index++ ] = thisNode.vertexCords.getMinX();
        vertexData[ index++ ] = thisNode.vertexCords.getMinY();
        vertexData[ index++ ] = thisNode.texCoords.getMinX();//u
        vertexData[ index++ ] = thisNode.texCoords.getMinY();//v

        //right top
        vertexData[ index++ ] = thisNode.vertexCords.getMaxX();
        vertexData[ index++ ] = thisNode.vertexCords.getMinY();
        vertexData[ index++ ] = thisNode.texCoords.getMaxX();//u
        vertexData[ index++ ] = thisNode.texCoords.getMinY();//v

        //---2nd triangle-----

        //right top
        vertexData[ index++ ] = thisNode.vertexCords.getMaxX();
        vertexData[ index++ ] = thisNode.vertexCords.getMinY();
        vertexData[ index++ ] = thisNode.texCoords.getMaxX();//u
        vertexData[ index++ ] = thisNode.texCoords.getMinY();//v

        //right bottom
        vertexData[ index++ ] = thisNode.vertexCords.getMaxX();
        vertexData[ index++ ] = thisNode.vertexCords.getMaxY();
        vertexData[ index++ ] = thisNode.texCoords.getMaxX();//u
        vertexData[ index++ ] = thisNode.texCoords.getMaxY();//v

        //left bottom
        vertexData[ index++ ] = thisNode.vertexCords.getMinX();
        vertexData[ index++ ] = thisNode.vertexCords.getMaxY();
        vertexData[ index++ ] = thisNode.texCoords.getMinX();//u
        vertexData[ index++ ] = thisNode.texCoords.getMaxY();//v
      } );
    },

    /**
     * draw tiles based on new dimension on to the canvas
     */
    updateTextureImage: function() {

      // TODO: Can't I just use 'this' here?
      var thisNode = this;
      thisNode.context.clearRect( 0, 0, thisNode.canvas.width, thisNode.canvas.height );
      thisNode.particleTextureMap.updateSpriteSheetDimensions();
      thisNode.particleTextureMap.calculateAndAssignCanvasDimensions( thisNode.canvas );
      thisNode.particleTextureMap.createTiles( thisNode.context );
      console.log( 'thisNode.canvas.toDataURL() = ' + thisNode.canvas.toDataURL() );
    },

    /**
     * This method does the following on initialization (also context restore) and on every zooms in and out action
     * 1)Draws the Particle Tiles based on new scaled dimension on to the canvas
     * 2)Binds the canvas Texture
     * 3)Get a reference to the scaleMatrix to appropriately position the particle in a zoomed state.
     */
    updateTexture: function( drawable ) {
      var thisNode = this;
      thisNode.zoomTransformationMatrix = thisNode.zoomableRootNode.getMatrix();
      thisNode.updateTextureImage();
      //adjust the bounds based on Zoom factor
      thisNode.particleViewBounds = thisNode.particleBounds.copy();

      // Particle View bounds is used to manually clip particles, because of Zoom functionality
      // once scaled up/down the actual bounds gets minimized or maximized
      thisNode.particleViewBounds = thisNode.particleViewBounds.transformed( thisNode.zoomTransformationMatrix.copy().invert() );
      thisNode.bindTextureImage( drawable );
    },

    /**
     * bind the tiles canvas as a texture
     * @param drawable
     */
    bindTextureImage: function( drawable ) {
      console.log( 'bindTextureImage called' );
      var gl = drawable.gl;

      // TODO: I think this deletes any previous texture.  Disabling for now, but will need to reinstate to make zooming work.
      //if ( this.texture !== null ) {
      //  gl.bindTexture( gl.TEXTURE_2D, null );
      //  gl.deleteTexture( this.texture );
      //}

      var texture = drawable.texture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, texture );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas );

      // The alpha is not pre-multiplied in the generated canvas image not
      // doing so results in white patch in the place  of transparent rectangle
      gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true );

      // Texture filtering, see http://learningwebgl.com/blog/?p=571
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
      gl.generateMipmap( gl.TEXTURE_2D );
      console.log( 'bindTextureImage exited' );
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
          type: particle.getType(),
          opacity: particle.getOpaqueness()
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

      // TODO: I have both raw particle data and pre-processed particle data, and I should only have one.  Figure out
      // which is better and remove the unneeded one.
      this.allParticles = [];
      this.allParticles = this.neuronModel.backgroundParticles.getArray().slice();
      this.allParticles = this.allParticles.concat( this.neuronModel.transientParticles.getArray() );
      this.allParticles = this.allParticles.concat( this.neuronModel.playbackParticles.getArray() );

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