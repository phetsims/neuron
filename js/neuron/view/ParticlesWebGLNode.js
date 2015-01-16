// Copyright 2002-2014, University of Colorado Boulder

/**
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
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
  var WebGLLayer = require( 'SCENERY/layers/WebGLLayer' );
  var Color = require( 'SCENERY/util/Color' );
  var ParticleTextureMap = require( 'NEURON/neuron/view/ParticleTextureMap' );
  var TextureInterleavedShaderWebGlLayer = require( 'NEURON/neuron/view/TextureInterleavedShaderWebGlLayer' );
  var Renderer = require( 'SCENERY/layers/Renderer' );
  var scenery = require( 'SCENERY/scenery' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // constants
  // Used for pre-initializing the VertexData. at the most the number of particles are observed to be
  // in the range of 1500-1600
  var MAX_PARTICLES = 2000;
  var DEBUG_TILE_BOUNDS = false;

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<number>} zoomProperty
   * @param {Node} zoomableRootNode
   * @param {Shape} clipArea
   * @constructor
   */
  function ParticlesWebGLNode( neuronModel, modelViewTransform, zoomProperty, zoomableRootNode, clipArea ) {
    var thisNode = this;
    Renderer.WebGL = new Renderer( TextureInterleavedShaderWebGlLayer, 'webgl', scenery.bitmaskSupportsWebGL, {} );
    WebGLNode.call( this );
    this.neuronModel = neuronModel;
    this.modelViewTransform = modelViewTransform;
    this.particleTextureMap = new ParticleTextureMap( modelViewTransform, zoomProperty );
    this.zoomProperty = zoomProperty;
    this.zoomableRootNode = zoomableRootNode;
    this.particleBounds = clipArea.bounds;
    this.visibleParticlesSize = 0; // Only Particles within the clipping region of Zoomable Node are considered visible
    this.allParticles = [];


    var noOfTriangleVerticesPerParticle = 12; // 6 corners(2 triangle) coordinates per corner
    var noOfTextCoordinatesPerVertex = 2;
    var totalNoOfVertices = MAX_PARTICLES * noOfTriangleVerticesPerParticle * noOfTextCoordinatesPerVertex;
    this.vertexData = new Float32Array( totalNoOfVertices );

    //The canvas on which particle tiles are drawn and used as a texture
    thisNode.canvas = document.createElement( 'canvas' );
    thisNode.context = this.canvas.getContext( '2d' );

    zoomProperty.link( function( zoomFactor ) {
      thisNode.updateTexture();
    } );

    // For performance reasons and to avoid new vector creation use a single instance
    this.tilePosVector = new Vector2();
    this.viewTransformationMatrix = thisNode.modelViewTransform.getMatrix();
    this.particleViewPosition = new Vector2();
    this.invalidatePaint();

    //To reduce GC re-use the same textCords and vertexCords
    this.textCords = new Bounds2( 0, 0, 0, 0 ); // The normalized texture coordinates that corresponds to the vertex corners
    this.vertexCords = new Bounds2( 0, 0, 0, 0 );// the rectangle bounds of a particle (used to create 2 triangles)
  }

  return inherit( WebGLNode, ParticlesWebGLNode, {

    initialize: function( gl ) {
      this.texture = null;
      this.gl = gl;
      var vertexBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
      this.updateTexture();
    },

    /**
     * This method does the following on initialization (also context restore) and on every zooms in and out action
     * 1)Draws the Particle Tiles based on new scaled dimension on to the canvas
     * 2)Binds the canvas Texture
     * 3)Get a reference to the scaleMatrix to appropriately position the particle in a zoomed state.
     */
    updateTexture: function() {
      //if gl not initialized don't proceed
      if ( !this.gl ) {
        return;
      }
      var thisNode = this;
      thisNode.zoomTransformationMatrix = thisNode.zoomableRootNode.getTransform().getMatrix();
      thisNode.updateTextureImage();
      //adjust the bounds based on Zoom factor
      thisNode.particleViewBounds = thisNode.particleBounds.copy();

      // Particle View bounds is used to manually clip particles, because of Zoom functionality
      // once scaled up/down the actual bounds gets minimized or maximized
      thisNode.particleViewBounds = thisNode.particleViewBounds.transformed( thisNode.zoomTransformationMatrix.copy().invert() );
      thisNode.bindTextureImage( thisNode.gl );

    },

    render: function( gl, shaderProgram, viewMatrix ) {
      this.gl = gl;
      this.allParticles = [];
      this.allParticles = this.neuronModel.backgroundParticles.getArray().slice();
      this.allParticles = this.allParticles.concat( this.neuronModel.transientParticles.getArray() );
      this.allParticles = this.allParticles.concat( this.neuronModel.playbackParticles.getArray() );

      var uMatrix = viewMatrix; // see TextureInterleavedShaderWebGLLayer for how uMatrix is calculated only once and cached
      gl.uniformMatrix4fv( shaderProgram.uniformLocations.uMatrix, false, uMatrix.entries );

      //each vertex is made up of 4 values 2  for x and y coordinates  and 2 for uv coordinates
      this.populateVerticesTexCoords();
      gl.bufferData( gl.ARRAY_BUFFER, this.vertexData, gl.DYNAMIC_DRAW );
      var fSize = this.vertexData.BYTES_PER_ELEMENT;

      //  use 4 if UV in interleaved. 4 bytes for each vertex (ie 2 for xy coordinates and 2 for uv (interleaved))
      var stride = 4;
      var uvOffset = fSize * 2; // (offset indicating how to retrive the UV in ur case after the first 2 values)
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aVertex, 2, gl.FLOAT, false, fSize * stride, 0 );
      this.setMaterial( gl, shaderProgram, fSize, stride, uvOffset );
      gl.drawArrays( gl.TRIANGLES, 0, this.visibleParticlesSize * 6 );
      gl.bindTexture( gl.TEXTURE_2D, null );
    },

    setMaterial: function( gl, shaderProgram, fSize, stride, uvOffset ) {
      gl.uniform1i( shaderProgram.uniformLocations.uTexture, 0 ); // TEXTURE0 slot
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aTexCoord, 2, gl.FLOAT, false, fSize * stride, uvOffset );
      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_2D, this.texture );

      var fragmentType = WebGLLayer.fragmentTypeTexture;
      if ( DEBUG_TILE_BOUNDS ) {  // To see how tiles are formed
        fragmentType = WebGLLayer.fragmentTypeFill;
        var color = Color.toColor( Color.ORANGE );
        gl.uniform4f( shaderProgram.uniformLocations.uColor, color.r / 255, color.g / 255, color.b / 255, color.a );
      }

      //Indicate the branch of logic to use in the ubershader.  In this case, a texture should be used for the image
      gl.uniform1i( shaderProgram.uniformLocations.uFragmentType, fragmentType );

    },

    /**
     * populates vertexData (Float32Array array) with vertex and texture data for all particles
     */
    populateVerticesTexCoords: function() {
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
        thisNode.particleTextureMap.getTexCords( particle.getType(), particle.getOpaqueness(), tilePosVector, thisNode.textCords );

        //left bottom
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMinX();//x
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMaxY();//y
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMinX(); //u
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMaxY(); //v

        //left top
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMinX();
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMinY();
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMinX();//u
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMinY();//v

        //right top
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMaxX();
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMinY();
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMaxX();//u
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMinY();//v

        //---2nd triangle-----

        //right top
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMaxX();
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMinY();
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMaxX();//u
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMinY();//v

        //right bottom
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMaxX();
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMaxY();
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMaxX();//u
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMaxY();//v

        //left bottom
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMinX();
        thisNode.vertexData[ index++ ] = thisNode.vertexCords.getMaxY();
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMinX();//u
        thisNode.vertexData[ index++ ] = thisNode.textCords.getMaxY();//v

      } );
    },

    /**
     * draw tiles based on new dimension on to the canvas
     */
    updateTextureImage: function() {

      var thisNode = this;
      thisNode.context.clearRect( 0, 0, thisNode.canvas.width, thisNode.canvas.height );
      thisNode.particleTextureMap.updateSpriteSheetDimensions();
      thisNode.particleTextureMap.calculateAndAssignCanvasDimensions( thisNode.canvas );
      thisNode.particleTextureMap.createTiles( thisNode.context );
    },

    /**
     * bind the tiles canvas as a texture
     * @param gl
     */
    bindTextureImage: function( gl ) {

      if ( this.texture !== null ) {
        gl.bindTexture( gl.TEXTURE_2D, null );
        gl.deleteTexture( this.texture );
      }

      var texture = this.texture = gl.createTexture();
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
    },

    dispose: function( gl ) {
      gl.deleteTexture( this.texture );
      this.texture = null;
    }

  } );

} );