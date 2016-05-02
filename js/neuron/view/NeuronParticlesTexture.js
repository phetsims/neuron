// Copyright 2014-2015, University of Colorado Boulder

/**
 * creates particles on a canvas that can used for rendering as a texture using WebGL
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var NeuronConstants = require( 'NEURON/neuron/common/NeuronConstants' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var CANVAS_LENGTH = 128; // width and height of the canvas, must be a power of 2 so that mipmapping can be used
  var MARGIN = CANVAS_LENGTH * 0.1; // space around the particles
  var STROKE_WIDTH = CANVAS_LENGTH / 32;
  var PRINT_DATA_URL_OF_SPRITE_SHEET = false; // very useful for debugging issues with the sprite sheet texture

  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function NeuronParticlesTexture( modelViewTransform ) {
    this.modelViewTransform = modelViewTransform; // @private
    this.strokeGapBetweenParticles = 4;  // @private - empirically determined

    // create the canvas upon which the particle images will be drawn
    this.canvas = document.createElement( 'canvas' );
    this.canvas.width = CANVAS_LENGTH;
    this.canvas.height = CANVAS_LENGTH;
    this.canvasContext = this.canvas.getContext( '2d' );

    // create the particle images on the canvas
    this.createParticleImages( this.canvasContext );

    // for debugging
    if ( PRINT_DATA_URL_OF_SPRITE_SHEET ) {
      console.log( 'this.canvas..toDataURL() = ' + this.canvas.toDataURL() );
    }
  }

  neuron.register( 'NeuronParticlesTexture', NeuronParticlesTexture );

  return inherit( Object, NeuronParticlesTexture, {

    /**
     * Draw the particles on the provided canvas.
     * @param {Canvas.context} context
     * @private
     */
    createParticleImages: function( context ) {

      // clear the canvas
      this.canvasContext.clearRect( 0, 0, this.canvas.width, this.canvas.height );

      // initialize some of the attributes that are shared by all particles
      context.strokeStyle = Color.BLACK.getCanvasStyle();
      context.lineWidth = STROKE_WIDTH;
      context.lineJoin = 'round';

      var particlePos;

      // create the image for sodium ions
      var sodiumParticleRadius = ( CANVAS_LENGTH / 2 - 2 * MARGIN ) / 2;
      context.fillStyle = NeuronConstants.SODIUM_COLOR.getCanvasStyle();
      context.beginPath();
      particlePos = this.getTilePosition( ParticleType.SODIUM_ION, particlePos );
      context.arc( particlePos.x, particlePos.y, sodiumParticleRadius, 0, 2 * Math.PI, false );
      context.fill();
      context.stroke();

      // create the image for potassium ions
      var potassiumParticleWidth = CANVAS_LENGTH / 2 - 2 * MARGIN;
      particlePos = this.getTilePosition( ParticleType.POTASSIUM_ION, particlePos );
      var x = particlePos.x;
      var y = particlePos.y;
      context.fillStyle = NeuronConstants.POTASSIUM_COLOR.getCanvasStyle();
      context.beginPath();
      context.moveTo( x - potassiumParticleWidth / 2, y );
      context.lineTo( x, y - potassiumParticleWidth / 2 );
      context.lineTo( x + potassiumParticleWidth / 2, y );
      context.lineTo( x, y + potassiumParticleWidth / 2 );
      context.closePath();
      context.fill();
      context.stroke();
    },

    /**
     * calculates the center position of the tile for the given type
     * @param {ParticleType} particleType
     * @private
     */
    getTilePosition: function( particleType ) {

      // allocate a vector if none was provided
      var posVector = new Vector2( CANVAS_LENGTH / 4, CANVAS_LENGTH / 4 );

      if ( particleType === ParticleType.POTASSIUM_ION ) {
        //The Potassium Tiles are arranged after Sodium
        posVector.y = posVector.y + CANVAS_LENGTH / 2;
      }

      return posVector;
    },

    /**
     * get the tile's normalized texture coordinates
     * @param {ParticleType} particleType
     * @returns {Bounds2}
     * @public
     */
    getTexCoords: function( particleType ) {
      var coords = new Bounds2( 0, 0, 0, 0 );
      var tileCenterPosition = this.getTilePosition( particleType );
      var tileRadius = CANVAS_LENGTH / 4;

      // Set the normalized bounds within the texture for the requested particle type.
      coords.setMinX( ( tileCenterPosition.x - tileRadius ) / this.canvas.width );
      coords.setMinY( ( tileCenterPosition.y - tileRadius ) / this.canvas.height );
      coords.setMaxX( (tileCenterPosition.x + tileRadius ) / this.canvas.width );
      coords.setMaxY( ( tileCenterPosition.y + tileRadius ) / this.canvas.height );

      return coords;
    }

  } );
} );