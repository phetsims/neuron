// Copyright 2002-2014, University of Colorado Boulder

/**
 * Particles Node, rendered in WebGL to improve performance
 * Particles are rendered by mapping their rectangular corners with a dynamically created SpriteSheet tiles.
 *
 * The Tile shapes (Circle or Rhombus) are arranged by Opacity value ranging from 0.00 to 0.99 (A total of 100 tiles for each particle, 10 rows and 10 columns)
 * The Tiles doesn't get created on every  webgl render call  but only when the user zooms in and out.Having a fixed Sprite sheet results in  pixelation thats
 * why we have to scale and draw  the Sprite Sheet dynamically whenever  changes the Zoom property.
 *
 * The code makes use of a different vertex shader, the Default WebglLayer's Vertex shader assumes the TextureCoordinates to be Vertex
 * Coordinates itself.(thats why even Vertex coordinates  are given in normalized coordinates and the actual shape transformation  scaled
 * done using viewMatrix during rendering).This is not applicable in our case as  we have to display 1000s triangles each mapped to a different tile position.
 * So each Vertex is interleaved with the appropriate Texture coordinates and sent to Webgl subsystem. The shaderProgram.attributeLocations.aTexCoord in the
 * SetMaterial method informs the shader how to retrieve the Texture coordinates for each vertex.
 *
 * The Particles position is also transformed using the Zoomable Node's transform matrix to take care of the position when scaled.
 *
 * * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var WebGLLayer = require( 'SCENERY/layers/WebGLLayer' );
  var Color = require( 'SCENERY/util/Color' );
  var ParticleTextureMap = require( 'NEURON/neuron/view/ParticleTextureMap' );
  var TextureInterleavedShaderWebGlLayer = require( 'NEURON/neuron/view/TextureInterleavedShaderWebGlLayer' );
  var Renderer = require( 'SCENERY/layers/Renderer' );
  var scenery = require( 'SCENERY/scenery' );


  function ParticlesWebGLNode( neuronModel, modelViewTransform, scaleProperty, zoomableRootNode, particleBounds ) {
    var thisNode = this;
    Renderer.WebGL = new Renderer( TextureInterleavedShaderWebGlLayer, 'webgl', scenery.bitmaskSupportsWebGL, {} );
    WebGLNode.call( this, {canvasBounds: new Bounds2( 0, 0, 500, 400 )} );
    this.neuronModel = neuronModel;
    this.modelViewTransform = modelViewTransform;
    this.particleTextureMap = new ParticleTextureMap( modelViewTransform, scaleProperty );
    this.scaleProperty = scaleProperty;
    this.zoomableRootNode = zoomableRootNode;
    this.particleBounds = particleBounds;
    this.visibleParticlesSize = 0; // Partciles within the clipping region of Zoomable Node are considered visible
    this.allParticles = [];

    // Get a reference to the ScaleMatrix every time when the User zooms in and out.This Scale matrix is used for
    // appropriately positioning the particle in a zoomed state.
    function updateScaleMatrix( zoomFactor ) {
      thisNode.scaleMatrix = zoomableRootNode.getTransform().getMatrix();
    }

    thisNode.redefineSpriteSheet = false;
    scaleProperty.link( function( zoomFactor ) {
      updateScaleMatrix();
      thisNode.redefineSpriteSheet = true; // The User has changed the Zoom level so appropriately make the tiles bigger or smaller
    } );

    updateScaleMatrix();

    this.invalidatePaint();

  }

  return inherit( WebGLNode, ParticlesWebGLNode, {

    initialize: function( gl ) {
      this.texture = null;
      this.canvasTexture = document.createElement( 'canvas' );
      this.createTextureImage( gl );

    },

    render: function( gl, shaderProgram, viewMatrix ) {

      this.allParticles = [];
      this.allParticles = this.neuronModel.backgroundParticles.getArray();
      this.allParticles = this.allParticles.concat( this.neuronModel.transientParticles.getArray() );
      this.allParticles = this.allParticles.concat( this.neuronModel.playbackParticles.getArray() );

      if ( this.redefineSpriteSheet ) {
        this.createTextureImage( gl );
        this.redefineSpriteSheet = false;
      }
      var uMatrix = viewMatrix;
      gl.uniformMatrix4fv( shaderProgram.uniformLocations.uMatrix, false, uMatrix.entries );


      //each vertex is made up of 4 values 2  for x and y coordinates  and 2 for uv coordinates
      var vertexBuffer = gl.createBuffer();
      gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
      var verticesTexCoords = this.createVerticesTexCoords();
      var floatArrayTextCoords = new Float32Array( verticesTexCoords );
      gl.bufferData( gl.ARRAY_BUFFER, floatArrayTextCoords, gl.DYNAMIC_DRAW );

      var fSize = floatArrayTextCoords.BYTES_PER_ELEMENT;

      //  use 4 if UV in interleaved 4 bytes for each vertex, 2 for xy coordinates and 2 for uv (interleaved)
      var stride = 4;
      var uvOffset = fSize * 2; // (offset indicating how to retrive the UV in ur case after the first 2 values)
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aVertex, 2, gl.FLOAT, false, fSize * stride, 0 );
      this.setMaterial( gl, shaderProgram, fSize, stride, uvOffset );

      //for debugging TODO will be removed once dev is completed
      //this.setColor(gl,shaderProgram,fSize,stride);
      var noOfParticles = this.visibleParticlesSize;
      gl.drawArrays( gl.TRIANGLES, 0, noOfParticles * 6 );
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

      //adjust the bounds based on Zoom factor
      var particleViewBounds = thisNode.particleBounds.copy();
      particleViewBounds = particleViewBounds.transformed( thisNode.scaleMatrix.copy().invert() );

      this.allParticles.forEach( function( particle ) {

        var particleViewPosition = thisNode.modelViewTransform.modelToViewPosition( particle.getPositionReference() );
        if ( !particleViewBounds.containsCoordinates( particleViewPosition.x, particleViewPosition.y ) ) {
          return;
        }
        thisNode.visibleParticlesSize++;
        // Position according to the scaled and Translated Position of ZoomableRootNode. The ScaleProperty is
        // Observed by this class and the scaleMatrix is updated from zoomableRootNode
        particleViewPosition = thisNode.scaleMatrix.timesVector2( particleViewPosition );

        //center Position
        var xPos = particleViewPosition.x | 0;
        var yPos = particleViewPosition.y | 0;
        var vertexCords = thisNode.particleTextureMap.getParticleCoords( particle.getType(), xPos, yPos );
        var textCords = thisNode.particleTextureMap.getTexCords( particle.getType(), particle.getOpaqueness() );

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

    createTextureImage: function( gl ) {

      if ( this.texture !== null ) {
        gl.deleteTexture( this.texture );
      }

      this.particleTextureMap.calculateAndAssignCanvasDimensions( this.canvasTexture );
      var context = this.canvasTexture.getContext( '2d' );
      this.particleTextureMap.createTiles( context );

      var texture = this.texture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, texture );

      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

      /* //useful debugging to know the size of the shape in case if the shape is not correctly matched with the Tetxture..TODO will be removed
       gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT );
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT );
       gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
       */

      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvasTexture );

      // The alpha is not pre-multiplied in the generated canvas image not
      // doing so results in white patch in the place  of transparent rectangle
      gl.pixelStorei( gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true );

      // Texture filtering, see http://learningwebgl.com/blog/?p=571
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
      gl.generateMipmap( gl.TEXTURE_2D );
      gl.bindTexture( gl.TEXTURE_2D, null );


    },

    dispose: function( gl ) {
      gl.deleteTexture( this.texture );
    }

  } );

} );