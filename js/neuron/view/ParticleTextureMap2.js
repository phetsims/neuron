// Copyright 2002-2011, University of Colorado
/**
 * Creates images that can be used as a WebGL texture for the purpose of rendering sodium and potassium ions.
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  var SodiumIon = require( 'NEURON/neuron/model/SodiumIon' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );

  // constants
  var PARTICLE_IMAGE_SIZE = 32; // height and width in pixels of the particle images created

  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ParticleTextureMap( modelViewTransform ) {
    this.modelViewTransform = modelViewTransform;
    this.sodiumParticle = new SodiumIon();
    this.potassiumParticle = new PotassiumIon();
    this.strokeGapBetweenParticles = 4; // empirically determined

    // Start building the tiles after a gap so the strokes don't overlap
    this.xMargin = this.strokeGapBetweenParticles;
    this.yMargin = this.strokeGapBetweenParticles;
  }

  return inherit( Object, ParticleTextureMap, {

    /**
     * TODO: doc
     */
    updateSpriteSheetDimensions: function() {

      var numParticleTypes = 2;

      this.potassiumTileHeightOffset = this.yMargin + PARTICLE_IMAGE_SIZE + this.strokeGapBetweenParticles;

      this.totalHeight = this.yMargin * 2;
      this.totalHeight += numParticleTypes * PARTICLE_IMAGE_SIZE;
      this.totalHeight += ( numParticleTypes - 1 ) * this.strokeGapBetweenParticles;

      this.totalWidth = 2 * this.xMargin;
      this.totalWidth += PARTICLE_IMAGE_SIZE;

      this.canvasWidth = 0;
      this.canvasHeight = 0;
    },

    calculateAndAssignCanvasDimensions: function( canvas ) {
      this.canvasWidth = canvas.width = Util.toPowerOf2( this.totalWidth );
      this.canvasHeight = canvas.height = Util.toPowerOf2( this.totalHeight );
    },

    /**
     * Create a 'tile' for each particle types on the provide canvas.
     * @param {Canvas.context} context
     */
    createTiles: function( context ) {
      context.strokeStyle = Color.BLACK.getCanvasStyle();
      context.lineWidth = 1;

      var particlePos;
      var i = 0;
      var j = 0;

      var particlesPerColumn = 1;
      var particlesPerRow = 1;

      // create the image for sodium ions
      context.lineWidth = Math.floor( PARTICLE_IMAGE_SIZE * 0.1 );
      context.strokeStyle = Color.BLACK.getCanvasStyle();
      context.fillStyle = this.sodiumParticle.getRepresentationColor().getCanvasStyle();
      context.beginPath();
      particlePos = this.tilePostAt( this.sodiumParticle.getType() );
      context.arc( particlePos.x, particlePos.y, PARTICLE_IMAGE_SIZE / 2, 0, 2 * Math.PI, false );
      context.fill();
      context.stroke();

      // create the image for potassium ions
      // TODO: if lineWidth is the same when this is worked out, eliminate redundant setting here.
      context.lineWidth = Math.floor( PARTICLE_IMAGE_SIZE * 0.1 );
      particlePos = this.tilePostAt( this.potassiumParticle.getType() );
      var x = particlePos.x;
      var y = particlePos.y;
      context.strokeStyle = Color.BLACK.getCanvasStyle();
      context.fillStyle = this.potassiumParticle.getRepresentationColor().getCanvasStyle();
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo( x - PARTICLE_IMAGE_SIZE / 2, y );
      context.lineTo( x, y - PARTICLE_IMAGE_SIZE / 2 );
      context.lineTo( x + PARTICLE_IMAGE_SIZE / 2, y );
      context.lineTo( x, y + PARTICLE_IMAGE_SIZE / 2 );
      context.closePath();
      context.fill();
      context.stroke();
    },

    /**
     * calculates the center position of the tile for the given type
     * @param {ParticleType.String} particleType
     * @param {Vector2} posVector - vector where calcluated values are placed, prevents allocation if provided
     * @private
     */
    tilePostAt: function( particleType, posVector ) {

      // allocate a vector if none was provided
      posVector = posVector || new Vector2();

      // calculate the center position
      posVector.x = this.xMargin + PARTICLE_IMAGE_SIZE / 2;
      posVector.y = PARTICLE_IMAGE_SIZE / 2 + this.yMargin;
      if ( particleType === ParticleType.POTASSIUM_ION ) {
        //The Potassium Tiles are arranged after Sodium
        posVector.y = posVector.y + this.potassiumTileHeightOffset;
      }

      return posVector;
    },

    /**
     * Get the Tile's normalized texture coordinates
     * @param {ParticleType.String} particleType
     * @param {Vector2} posVector
     * @param {Bounds2} coords
     * @returns {Bounds2}
     */
    getTexCoords: function( particleType, posVector, coords ) {
      var tileRadius = PARTICLE_IMAGE_SIZE / 2;
      var tilePost = this.tilePostAt( particleType, posVector );
      tileRadius += this.strokeGapBetweenParticles / 2;
      coords = coords || new Bounds2( 0, 0, 0, 0 );

      // Particle Pos is at center. get the left corder, substract the radius and normalize the value by
      // dividing it by canvasWidth, the Tex Coords needs to be on the range of 0..1
      coords.setMinX( (tilePost.x - tileRadius) / this.canvasWidth );
      coords.setMinY( (tilePost.y - tileRadius) / this.canvasHeight );
      coords.setMaxX( (tilePost.x + tileRadius) / this.canvasWidth );
      coords.setMaxY( (tilePost.y + tileRadius) / this.canvasHeight );

      return coords;
    }
  } );
} );