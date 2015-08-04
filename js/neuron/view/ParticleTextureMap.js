// Copyright 2002-2011, University of Colorado
/**
 * Creates tiles for particles of different opacity
 * A opacity of .34 will be on the 3rd row and 4th column
 * The Texture contains group of 400 tiles (200 for Sodium and 200 for potassium)
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
  var DOTUtil = require( 'DOT/Util' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );

  /**
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<number>} zoomProperty
   * @constructor
   */
  function ParticleTextureMap( modelViewTransform, zoomProperty ) {
    this.modelViewTransform = modelViewTransform;
    this.zoomProperty = zoomProperty;
    this.sodiumParticle = new SodiumIon();
    this.potassiumParticle = new PotassiumIon();
    this.canvasStrokeStyle = Color.BLACK.getCanvasStyle();
    this.strokeGapBetweenParticles = 4;

    //Start building the tiles after a gap so the strokes dont overlap
    this.xMargin = this.strokeGapBetweenParticles;
    this.yMargin = this.strokeGapBetweenParticles;
  }

  return inherit( Object, ParticleTextureMap, {

    /**
     * Update the overall dimensions of the sprite sheet.  The dimensions are a function of the zoom factor.
     */
    updateSpriteSheetDimensions: function() {
      // The particle images are contained in a square space, particleSize is the height/width of that square.  The
      // multiplier was empirically determined.
      this.particleSize = this.modelViewTransform.modelToViewDeltaX( this.sodiumParticle.getRadius() ) *
                          this.zoomProperty.value * 3;

      var totalParticlesPerColumn = 20;

      // Draw potassium particle shapes after drawing all the sodium particles
      this.potasiumTileHeightOffset = this.yMargin;
      this.potasiumTileHeightOffset += ( totalParticlesPerColumn * this.particleSize / 2 );
      this.potasiumTileHeightOffset += 10 * this.strokeGapBetweenParticles;

      this.tileTotalHeght = this.potasiumTileHeightOffset;
      this.tileTotalHeght += totalParticlesPerColumn * this.particleSize / 2;
      this.tileTotalHeght += 10 * this.strokeGapBetweenParticles;
      this.tileTotalHeght += this.yMargin;

      this.tileTotalWidth = this.xMargin;
      this.tileTotalWidth += totalParticlesPerColumn * this.particleSize;
      this.tileTotalWidth += 10 * this.strokeGapBetweenParticles;

      this.canvasWidth = 0;
      this.canvasHeight = 0;
    },

    calculateAndAssignCanvasDimensions: function( canvas ) {
      this.canvasWidth = canvas.width = Util.toPowerOf2( this.tileTotalWidth );
      this.canvasHeight = canvas.height = Util.toPowerOf2( this.tileTotalHeght );
    },

    /**
     * For a given particle type and position the method gives
     * the bounding rectangle of that particle
     *
     * @param {ParticleType.String} particleType
     * @param {number} xPos
     * @param {number} yPos
     * @param {Bounds2} coords
     * @returns {Bounds2}
     */
    getParticleCoords: function( particleType, xPos, yPos, coords ) {
      coords = coords || new Bounds2( 0, 0, 0, 0 );
      var w = this.particleSize;
      var h = w;
      coords.setMinX( xPos - w / 2 );
      coords.setMinY( yPos - h / 2 );
      coords.setMaxX( xPos + w / 2 );
      coords.setMaxY( yPos + h / 2 );

      return coords;
    },

    /**
     * Get the current width and height for the specified particle type.
     * TODO: if the refactoring to make the particles the same size works out, this can be replaced with a public variable
     */
    getParticleSize: function( particleType ) {
      return this.particleSize;
    },

    /**
     * Creates tiles for particles of different opacity
     * A opacity of .34 will be on the 3rd row and 4th column
     * @param {Canvas.context} context
     */
    createTiles: function( context ) {
      context.strokeStyle = Color.BLACK.getCanvasStyle();
      context.lineWidth = 1;

      var opacityString;
      var opacityValue;
      var particlePos;
      var i = 0;
      var j = 0;

      var particlesPerColumn = 10;
      var particlesPerRow = 10;

      // create tiles for sodium particles

      context.lineWidth = Math.floor( this.particleSize * 0.1 );

      for ( i = 0; i < particlesPerRow; i++ ) {
        for ( j = 0; j < particlesPerColumn; j++ ) {
          opacityValue = ( i * 0.1 ) + ( j * 0.01 );
          context.strokeStyle = Color.BLACK.withAlpha( opacityValue * 1.2 ).getCanvasStyle();
          context.fillStyle = this.sodiumParticle.getRepresentationColor().withAlpha( opacityValue ).getCanvasStyle();// All sodium ions are of the same color,
          context.beginPath();
          particlePos = this.tilePostAt( this.sodiumParticle.getType(), i, j );
          context.arc( particlePos.x, particlePos.y, this.particleSize / 2, 0, 2 * Math.PI, false );
          context.fill();
          context.stroke();
        }
      }

      // create tiles for potassium particles

      context.lineWidth = Math.max( this.particleSize * 0.2, 1 );

      for ( i = 0; i < particlesPerRow; i++ ) {
        for ( j = 0; j < particlesPerColumn; j++ ) {
          opacityValue = ( i * 0.1 ) + ( j * 0.01 );
          particlePos = this.tilePostAt( this.potassiumParticle.getType(), i, j );
          var x = particlePos.x;
          var y = particlePos.y;
          context.strokeStyle = Color.BLACK.withAlpha( opacityValue * 1.3 ).getCanvasStyle();
          context.fillStyle = this.potassiumParticle.getRepresentationColor().withAlpha( opacityValue ).getCanvasStyle();// All sodium ions are of the same color,
          context.beginPath();
          context.moveTo( x - this.particleSize / 2, y );
          context.lineTo( x, y - this.particleSize / 2 );
          context.lineTo( x + this.particleSize / 2, y );
          context.lineTo( x, y + this.particleSize / 2 );
          context.closePath();
          context.stroke();
          context.fill();
        }
      }
    },

    /**
     * returns or sets the center pos of the tile on the given posVector
     * @param {ParticleType.String} particleType
     * @param {number} row
     * @param {number} column
     * @param {Vector2} posVector
     * @returns {Vector2}
     */
    tilePostAt: function( particleType, row, column, posVector ) {
      // TODO: IntelliJ is highlighting some things in this function as errors.  This should be fixed.
      posVector = posVector || new Vector2();
        posVector.x = ( column * this.particleSize ) + this.particleSize / 2;
        posVector.y = ( row * this.particleSize) + this.particleSize / 2;
      if ( particleType === ParticleType.POTASSIUM_ION ) {
        //The Potassium Tiles are arranged after Sodium
        posVector.y += this.potasiumTileHeightOffset;
      }

      posVector.x += this.xMargin; // account for horizontal margin
      posVector.y += this.yMargin;
      posVector.x += column * this.strokeGapBetweenParticles; // account for gap between particles
      posVector.y += row * this.strokeGapBetweenParticles;

      return posVector;
    },

    // TODO: Name should be getTexCoords, not getTexCords.
    /**
     * Get the Tile's  normalized texture coordinates based on particle's opacity
     * @param {ParticleType.String} particleType
     * @param {number} opacity
     * @param {Vector2}posVector
     * @param {Bounds2} coords
     * @returns {*|Bounds2}
     */
    getTexCords: function( particleType, opacity, posVector, coords ) {
      if ( opacity >= 1 ) {
        opacity = 0.99; // The Max is 0.99 but mapped to 1 , see createTiles method
      }
      var opacityStr = DOTUtil.toFixed( opacity, 4 );
      var parts = opacityStr.split( "." );
      var row = parts[ 1 ].charAt( 0 );
      var column = parts[ 1 ].charAt( 1 );
      var tileRadius = this.particleSize / 2;
      var tilePost = this.tilePostAt( particleType, row, column, posVector );
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