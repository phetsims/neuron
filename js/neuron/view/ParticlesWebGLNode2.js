// Copyright 2002-2015, University of Colorado Boulder

/**
 * A WebGL Scenery node that is used to render particles.  This is done as an optimization, since representing every
 * particle as an individual Scenery node is too computationally intensive.
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
  var Matrix3 = require( 'DOT/Matrix3' );
  var NeuronConstants = require( 'NEURON/neuron/NeuronConstants' );
  var ShaderProgram = require( 'SCENERY/util/ShaderProgram' );
  var Shape = require( 'KITE/Shape' );
  var WebGLNode = require( 'SCENERY/nodes/WebGLNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var TRIANGLE_RADIUS = 3; // empirically determined
  var RED_COLOR_BUFFER_DATA = [ 0.7, 0, 0 ];
  var GREEN_COLOR_BUFFER_DATA = [ 0, 0.7, 0 ];

  // function to create a triangle shape from a single point
  function createTriangleAroundPoint( x, y ) {

    var triangle = new Shape.regularPolygon( 3, TRIANGLE_RADIUS );

    // translate
    triangle = triangle.transformed( Matrix3.translation( x, y ) );

    return triangle;
  }

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
    this.constrainedBounds = bounds.dilated( -TRIANGLE_RADIUS );

    this.triangleShapes = [];

    self.update();

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

      // Simple example for custom shader
      var vertexShaderSource = [
        // Position
        'attribute vec3 aPosition;',
        'attribute vec3 aColor;',
        'varying vec3 vColor;',
        'uniform mat3 uModelViewMatrix;',
        'uniform mat3 uProjectionMatrix;',

        'void main( void ) {',
        '  vColor = aColor;',
        // homogeneous model-view transformation
        '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',
        // homogeneous map to to normalized device coordinates
        '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',
        // combine with the z coordinate specified
        '  gl_Position = vec4( ndc.xy, aPosition.z, 1.0 );',
        '}'
      ].join( '\n' );

      // Simple demo for custom shader
      var fragmentShaderSource = [
        'precision mediump float;',
        'varying vec3 vColor;',

        // Returns the color from the vertex shader
        'void main( void ) {',
        '  gl_FragColor = vec4( vColor, 1.0 );',
        '}'
      ].join( '\n' );

      drawable.shaderProgram = new ShaderProgram( gl, vertexShaderSource, fragmentShaderSource, {
        attributes: [ 'aPosition', 'aColor' ],
        uniforms: [ 'uModelViewMatrix', 'uProjectionMatrix' ]
      } );

      //TODO: I'm assuming that these are created once and then reused on each paint.  True?
      drawable.vertexBuffer = gl.createBuffer();
      drawable.colorBuffer = gl.createBuffer();
    },

    /**
     * TODO: Document this once finalized (and when I understand it better).
     * @param drawable
     * @param matrix
     */
    paintWebGLDrawable: function( drawable, matrix ) {
      var gl = drawable.gl;
      var shaderProgram = drawable.shaderProgram;

      //----------------------

      // convert triangle shapes into vertices
      var vertexData = [];
      this.triangleShapes.forEach( function( triangleShape ) {
        var trianglePoints = triangleShape.subpaths[ 0 ].points;
        trianglePoints.forEach( function( point ) {
          vertexData.push( point.x );
          vertexData.push( point.y );
          vertexData.push( 0.2 ); // z position
        } );
      } );
      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertexData ), gl.STATIC_DRAW );

      var colorBufferData = [];
      this.triangleShapes.forEach( function() {
        // for now, all triangles are the same color, but this will evolve soon
        var colorData = RED_COLOR_BUFFER_DATA;
        colorBufferData = colorBufferData.concat( colorData );
        colorBufferData = colorBufferData.concat( colorData );
        colorBufferData = colorBufferData.concat( colorData );
      } );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.colorBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( colorBufferData ), gl.STATIC_DRAW );

      //----------------------

      shaderProgram.use();

      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uModelViewMatrix, false, matrix.entries );
      gl.uniformMatrix3fv( shaderProgram.uniformLocations.uProjectionMatrix, false, drawable.webGLBlock.projectionMatrixArray );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.vertexBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aPosition, 3, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, drawable.colorBuffer );
      gl.vertexAttribPointer( shaderProgram.attributeLocations.aColor, 3, gl.FLOAT, false, 0, 0 );

      gl.drawArrays( gl.TRIANGLES, 0, this.triangleShapes.length * 3 );

      shaderProgram.unuse();
    },

    /**
     * TODO: Document this once finalized (and when I understand it better).
     * @param drawable
     */
    disposeWebGLDrawable: function( drawable ) {
      drawable.shaderProgram.dispose();
      drawable.gl.deleteBuffer( drawable.vertexBuffer );

      drawable.shaderProgram = null;
    },

    /**
     * Update the representation show in the canvas based on the model state.  This is intended to be called any time
     * particles move in a given time step, which should be once per frame or less.
     */
    update: function() {
      var self = this;
      // generate a set of triangles located where the particles are
      this.triangleShapes = [];
      var xPos, yPos;
      this.neuronModel.backgroundParticles.forEach( function( backgroundParticle ) {
        xPos = self.modelViewTransform.modelToViewX( backgroundParticle.positionX );
        yPos = self.modelViewTransform.modelToViewY( backgroundParticle.positionY );
        if ( self.constrainedBounds.containsCoordinates( xPos, yPos ) ) {
          self.triangleShapes.push( createTriangleAroundPoint( xPos, yPos ) );
        }
      } );

      self.invalidatePaint();
    }
  } );
} );