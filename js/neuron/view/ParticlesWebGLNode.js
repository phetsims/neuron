// Copyright 2002-2014, University of Colorado Boulder

//REVIEW - Please clean up this comment using the 120 column guideline specified in the PhET Development Overview.
/**
 * Particles Node, rendered in WebGL to improve performance
 * Particles are rendered by mapping their rectangular corners with a dynamically created SpriteSheet tiles.
 *
 * The Tile shapes (Circle or Rhombus) are arranged by Opacity value ranging from 0.00 to 0.99 (A total of 100 tiles for each particle, 10 rows and 10 columns)
 * The Tiles doesn't get created on every  webgl render call  but only when the user zooms in and out.
 * Having a fixed Sprite sheet results in  pixelation thats  why we have to scale and draw  the Sprite Sheet dynamically whenever  changes the Zoom property.
 *
 * The code makes use of a different vertex shader, the Default WebglLayer's Vertex shader assumes the TextureCoordinates to be Vertex
 * Coordinates itself.(thats why  Vertex coordinates  are given in normalized coordinates ).
 * In case of Base WebGLNode, the transformation of shapes are handled by manipulating the viewMatrix during rendering.This is not applicable in our case as  we have to display 1000s triangles each mapped to a different tile position.
 * So each Vertex is interleaved with the appropriate Texture coordinates and sent to Webgl subsystem. The shaderProgram.attributeLocations.aTexCoord in the
 * SetMaterial method informs the shader how to retrieve the Texture coordinates for each vertex.
 *
 * The Particles position is also transformed using the Zoomable Node's transform matrix to take care of the particle's position when scaled.
 *
 * * @author Sharfudeen Ashraf (for Ghent University)
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
  var Vector3 = require( 'DOT/Vector3' );

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<number>} scaleProperty
   * @param {Node} zoomableRootNode
   * @param {Shape} clipArea
   * @constructor
   */
  function ParticlesWebGLNode( neuronModel, modelViewTransform, scaleProperty, zoomableRootNode, clipArea ) {
    var thisNode = this;
    Renderer.WebGL = new Renderer( TextureInterleavedShaderWebGlLayer, 'webgl', scenery.bitmaskSupportsWebGL, {} );
    WebGLNode.call( this );
    this.neuronModel = neuronModel;
    this.modelViewTransform = modelViewTransform;
    this.particleTextureMap = new ParticleTextureMap( modelViewTransform, scaleProperty );
    this.scaleProperty = scaleProperty;
    this.zoomableRootNode = zoomableRootNode;
    this.particleBounds = clipArea.bounds;
    this.visibleParticlesSize = 0; // Only Particles within the clipping region of Zoomable Node are considered visible
    this.allParticles = [];
    this.textureBound = false;

    // Get a reference to the ScaleMatrix every time when the User zooms in and out.This Scale matrix is used for
    // appropriately positioning the particle in a zoomed state.
    function updateScaleMatrix( zoomFactor ) {
      thisNode.zoomTransformationMatrix = zoomableRootNode.getTransform().getMatrix();
      thisNode.updateTextureImage();
      //adjust the bounds based on Zoom factor
      thisNode.particleViewBounds = thisNode.particleBounds.copy();

      // Particle View bounds is used to manually clip particles, because of Zoom functionality
      // once scaled up/down the actual bounds gets minimized or maximized
      thisNode.particleViewBounds = thisNode.particleViewBounds.transformed( thisNode.zoomTransformationMatrix.copy().invert() );
      if ( thisNode.gl ) {
        thisNode.bindTextureImage( thisNode.gl );
      }
    }

    thisNode.canvas = document.createElement( 'canvas' );
    thisNode.context = this.canvas.getContext( '2d' );

    scaleProperty.link( function( zoomFactor ) {
      updateScaleMatrix();
    } );

    updateScaleMatrix();

    // For performance reasons and to avoid new vector creation use a single instance
    this.tilePosVector = new Vector2();
    this.viewTransformationMatrix = thisNode.modelViewTransform.getMatrix();
    this.particleViewPosition = new Vector2();
    //REVIEW - This variable appears to be unused.
    this.viewPortPosition = new Vector3();

    this.invalidatePaint();


  }

  return inherit( WebGLNode, ParticlesWebGLNode, {

    initialize: function( gl ) {
      this.texture = null;
      this.gl = gl;
      this.updateTextureImage( gl );
      this.bindTextureImage( gl );


    },

    render: function( gl, shaderProgram, viewMatrix ) {

      this.gl = gl;

      if ( !this.textureBound ) {
        this.bindTextureImage( gl );
        this.textureBound = true;
      }

      this.allParticles = [];
      this.allParticles = this.neuronModel.backgroundParticles.getArray().slice();
      //REVIEW: slice() unnecessary, because concat just reads from its parameters.
      this.allParticles = this.allParticles.concat( this.neuronModel.transientParticles.getArray().slice() );
      this.allParticles = this.allParticles.concat( this.neuronModel.playbackParticles.getArray().slice() );


      var uMatrix = viewMatrix; // see TextureInterleavedShaderWebGLLayer for how uMatrix is calculated only once and cached
      gl.uniformMatrix4fv( shaderProgram.uniformLocations.uMatrix, false, uMatrix.entries );

      //each vertex is made up of 4 values 2  for x and y coordinates  and 2 for uv coordinates
      var vertexBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
      var verticesTexCoords = this.createVerticesTexCoords();
      var floatArrayTextCoords = new Float32Array( verticesTexCoords );
      gl.bufferData( gl.ARRAY_BUFFER, floatArrayTextCoords, gl.DYNAMIC_DRAW );

      var fSize = floatArrayTextCoords.BYTES_PER_ELEMENT;

      //  use 4 if UV in interleaved. 4 bytes for each vertex (ie 2 for xy coordinates and 2 for uv (interleaved))
      var stride = 4;
      var uvOffset = fSize * 2; // (offset indicating how to retrive the UV in ur case after the first 2 values)
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aVertex, 2, gl.FLOAT, false, fSize * stride, 0 );
      this.setMaterial( gl, shaderProgram, fSize, stride, uvOffset );

      // To see how tiles are formed uncomment setting the color - useful for debugging
      //this.setColor(gl,shaderProgram,fSize,stride);
      gl.drawArrays( gl.TRIANGLES, 0, this.visibleParticlesSize * 6 );
      gl.bindTexture( gl.TEXTURE_2D, null );
      gl.deleteBuffer( vertexBuffer );


    },

    setMaterial: function( gl, shaderProgram, fSize, stride, uvOffset ) {
      gl.uniform1i( shaderProgram.uniformLocations.uTexture, 0 ); // TEXTURE0 slot

      //Indicate the branch of logic to use in the ubershader.  In this case, a texture should be used for the image
      gl.uniform1i( shaderProgram.uniformLocations.uFragmentType, WebGLLayer.fragmentTypeTexture );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aTexCoord, 2, gl.FLOAT, false, fSize * stride, uvOffset );
      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_2D, this.texture );

    },

    setColor: function( gl, shaderProgram, fSize, stride ) {
      var color = Color.toColor( Color.ORANGE );
      gl.uniform1i( shaderProgram.uniformLocations.uFragmentType, WebGLLayer.fragmentTypeFill );
      gl.uniform4f( shaderProgram.uniformLocations.uColor, color.r / 255, color.g / 255, color.b / 255, color.a );
    },

    createVerticesTexCoords: function() {
      var index = 0;
      var vertexData = [];
      var thisNode = this;
      this.visibleParticlesSize = 0;

      // Use the same reference, the Vertex buffer array uses only the primitives, so no need to create new instances
      var tilePosVector = this.tilePosVector;
      var viewTransformationMatrix = this.viewTransformationMatrix;
      var particleViewPosition = this.particleViewPosition;

      var textCords = {};
      var vertexCords = {};

      this.allParticles.forEach( function( particle ) {

        particleViewPosition.x = particle.getPositionX();
        particleViewPosition.y = particle.getPositionY();
        viewTransformationMatrix.multiplyVector2( particleViewPosition );
        if ( !thisNode.particleViewBounds.containsCoordinates( particleViewPosition.x, particleViewPosition.y ) ) {
          return;
        }
        thisNode.visibleParticlesSize++;
        // Position according to the scaled and Translated Position of ZoomableRootNode. The ScaleProperty is
        // Observed by this class and the scaleMatrix is updated from zoomableRootNode
        thisNode.zoomTransformationMatrix.multiplyVector2( particleViewPosition ); // (changes, the passed particleViewPosition)

        //center Position
        var xPos = particleViewPosition.x;
        var yPos = particleViewPosition.y;

        //for performance reasons this method updates vertexCords (and returns the same)   instead of creating a new one
        vertexCords = thisNode.particleTextureMap.getParticleCoords( particle.getType(), xPos, yPos, vertexCords );

        //for performance reasons this method updates the texCords (and returns the same)  instead of creating a new one
        textCords = thisNode.particleTextureMap.getTexCords( particle.getType(), particle.getOpaqueness(), tilePosVector, textCords );

        //left bottom
        vertexData[index++] = vertexCords.leftX;//x
        vertexData[index++] = vertexCords.bottomY;//y
        vertexData[index++] = textCords.leftX; //u
        vertexData[index++] = textCords.bottomY; //v

        //left top
        vertexData[index++] = vertexCords.leftX;
        vertexData[index++] = vertexCords.topY;
        vertexData[index++] = textCords.leftX;//u
        vertexData[index++] = textCords.topY;//v

        //right top
        vertexData[index++] = vertexCords.rightX;
        vertexData[index++] = vertexCords.topY;
        vertexData[index++] = textCords.rightX;//u
        vertexData[index++] = textCords.topY;//v

        //---2nd triangle-----

        //right top
        vertexData[index++] = vertexCords.rightX;
        vertexData[index++] = vertexCords.topY;
        vertexData[index++] = textCords.rightX;//u
        vertexData[index++] = textCords.topY;//v

        //right bottom
        vertexData[index++] = vertexCords.rightX;
        vertexData[index++] = vertexCords.bottomY;
        vertexData[index++] = textCords.rightX;//u
        vertexData[index++] = textCords.bottomY;//v

        //left bottom
        vertexData[index++] = vertexCords.leftX;
        vertexData[index++] = vertexCords.bottomY;
        vertexData[index++] = textCords.leftX;//u
        vertexData[index++] = textCords.bottomY;//v

      } );

      return vertexData;

    },
    updateTextureImage: function( gl ) {

      var thisNode = this;
      thisNode.context.clearRect( 0, 0, thisNode.canvas.width, thisNode.canvas.height );
      thisNode.particleTextureMap.updateSpriteSheetDimensions();
      thisNode.particleTextureMap.calculateAndAssignCanvasDimensions( thisNode.canvas );
      thisNode.particleTextureMap.createTiles( thisNode.context );
    },

    bindTextureImage: function( gl ) {

      if ( this.texture !== null ) {
        gl.bindTexture( gl.TEXTURE_2D, null );
        gl.deleteTexture( this.texture );
      }

      var texture = this.texture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, texture );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

      /*
       // useful debugging to know the size of the shape in case if the shape is not correctly matched with the Tetxture..
       gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT );
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT );
       gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
       */

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
    }

  } );

} );