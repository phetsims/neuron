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
  var PARTICLE_IMAGE_SIZE = 100; // height and width in pixels of the particle images created

  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ParticleTextureMap( modelViewTransform ) {
    this.modelViewTransform = modelViewTransform;
    this.sodiumParticle = new SodiumIon();
    this.potassiumParticle = new PotassiumIon();
    this.strokeGapBetweenParticles = 4;

    // Start building the tiles after a gap so the strokes don't overlap
    this.xMargin = this.strokeGapBetweenParticles;
    this.yMargin = this.strokeGapBetweenParticles;
  }

  return inherit( Object, ParticleTextureMap, {

    /**
     * TODO: doc
     */
    updateSpriteSheetDimensions: function() {

      // The particle images are contained in a square space, and the following two variables represent the width and
      // height of that square as a single number value for each of the particle types. The multipliers were
      // empirically determined.  Potassium atoms are made to have a slightly larger size or else they end up looking
      // smaller than the sodium atoms.
      //this.sodiumParticleViewSize = this.modelViewTransform.modelToViewDeltaX( this.sodiumParticle.getRadius() ) *
      //                              this.zoomProperty.value * 3;
      this.sodiumParticleViewSize = this.modelViewTransform.modelToViewDeltaX( this.sodiumParticle.getRadius() ) * 20;
      //this.potassiumParticleViewSize = this.modelViewTransform.modelToViewDeltaX( this.sodiumParticle.getRadius() ) *
      //                                 this.zoomProperty.value * 3.3;
      this.potassiumParticleViewSize = this.modelViewTransform.modelToViewDeltaX( this.sodiumParticle.getRadius() ) * 20;

      // some things below are based on the assumption that potassium atoms are greater or equal in size, so check it.
      assert && assert( this.potassiumParticleViewSize >= this.sodiumParticleViewSize );

      var totalParticlesPerColumn = 2;

      // Draw potassium particle shape after drawing all the sodium shape
      this.potasiumTileHeightOffset = this.yMargin + this.potassiumParticleViewSize + this.strokeGapBetweenParticles;

      this.tileTotalHeight = this.potasiumTileHeightOffset;
      this.tileTotalHeight += totalParticlesPerColumn * this.potassiumParticleViewSize / 2;
      this.tileTotalHeight += 10 * this.strokeGapBetweenParticles;
      this.tileTotalHeight += this.yMargin;

      this.tileTotalWidth = this.xMargin;
      this.tileTotalWidth += totalParticlesPerColumn * this.potassiumParticleViewSize;
      this.tileTotalWidth += 10 * this.strokeGapBetweenParticles;

      this.canvasWidth = 0;
      this.canvasHeight = 0;
    },

    calculateAndAssignCanvasDimensions: function( canvas ) {
      this.canvasWidth = canvas.width = Util.toPowerOf2( this.tileTotalWidth );
      this.canvasHeight = canvas.height = Util.toPowerOf2( this.tileTotalHeight );
    },

    /**
     * For a given particle type and position the method gives the bounding rectangle of that particle.
     *
     * @param {ParticleType.String} particleType
     * @param {number} xPos
     * @param {number} yPos
     * @param {Bounds2} coords
     * @returns {Bounds2}
     */
    getParticleCoords: function( particleType, xPos, yPos, coords ) {
      coords = coords || new Bounds2( 0, 0, 0, 0 );
      var w = this.getParticleSize( particleType );
      var h = w;
      coords.setMinX( xPos - w / 2 );
      coords.setMinY( yPos - h / 2 );
      coords.setMaxX( xPos + w / 2 );
      coords.setMaxY( yPos + h / 2 );

      return coords;
    },

    /**
     * Get the current width and height for the specified particle type.
     */
    getParticleSize: function( particleType ) {
      if ( particleType === ParticleType.SODIUM_ION ) {
        return this.sodiumParticleViewSize;
      }
      else if ( particleType === ParticleType.POTASSIUM_ION ) {
        return this.potassiumParticleViewSize;
      }
      throw new Error( 'unhandled particle type' );
    },

    /**
     * TODO: Doc if retained.
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

      // create the image for sodium particles

      context.lineWidth = Math.floor( this.sodiumParticleViewSize * 0.1 );

      context.strokeStyle = Color.BLACK.getCanvasStyle();
      context.fillStyle = this.sodiumParticle.getRepresentationColor().getCanvasStyle();
      context.beginPath();
      particlePos = this.tilePostAt( this.sodiumParticle.getType() );
      context.arc( particlePos.x, particlePos.y, this.sodiumParticleViewSize / 2, 0, 2 * Math.PI, false );
      context.fill();
      context.stroke();


      // create the image for potassium particles

      // TODO: if lineWidth is the same when this is worked out, eliminate redundant setting here.
      context.lineWidth = Math.floor( this.potassiumParticleViewSize * 0.1 );

      particlePos = this.tilePostAt( this.potassiumParticle.getType() );
      var x = particlePos.x;
      var y = particlePos.y;
      context.strokeStyle = Color.BLACK.getCanvasStyle();
      context.fillStyle = this.potassiumParticle.getRepresentationColor().getCanvasStyle();
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo( x - this.potassiumParticleViewSize / 2, y );
      context.lineTo( x, y - this.potassiumParticleViewSize / 2 );
      context.lineTo( x + this.potassiumParticleViewSize / 2, y );
      context.lineTo( x, y + this.potassiumParticleViewSize / 2 );
      context.closePath();
      context.fill();
      context.stroke();
    },

    /**
     * returns or sets the center pos of the tile on the given posVector
     * @param {ParticleType.String} particleType
     * @param {Vector2} posVector
     * @returns {Vector2}
     * @private
     */
    tilePostAt: function( particleType, posVector ) {
      // TODO: IntelliJ is highlighting some things in this function as errors.  This should be fixed.
      posVector = posVector || new Vector2();
      if ( particleType === ParticleType.SODIUM_ION ) {
        posVector.x = (this.sodiumParticleViewSize ) + this.sodiumParticleViewSize / 2;
        posVector.y = (this.sodiumParticleViewSize ) + this.sodiumParticleViewSize / 2;
      }
      if ( particleType === ParticleType.POTASSIUM_ION ) {
        posVector.x = (this.potassiumParticleViewSize ) + this.potassiumParticleViewSize / 2;
        posVector.y = (this.potassiumParticleViewSize ) + this.potassiumParticleViewSize / 2;
        //The Potassium Tiles are arranged after Sodium
        posVector.y += this.potasiumTileHeightOffset;
      }

      posVector.x += this.xMargin; // account for horizontal margin
      posVector.y += this.yMargin;
      posVector.x += this.strokeGapBetweenParticles; // account for gap between particles
      posVector.y += this.strokeGapBetweenParticles;

      return posVector;
    },

    // TODO: Name should be getTexCoords, not getTexCords.
    /**
     * Get the Tile's normalized texture coordinates
     * @param {ParticleType.String} particleType
     * @param {Vector2} posVector
     * @param {Bounds2} coords
     * @returns {Bounds2}
     */
    getTexCords: function( particleType, posVector, coords ) {
      var tileRadius = this.getParticleSize( particleType ) / 2;
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