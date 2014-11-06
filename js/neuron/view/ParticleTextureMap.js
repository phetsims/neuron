// Copyright 2002-2011, University of Colorado
/**
 * Creates tiles for particles of  different opacity
 * A opacity of .34 will be on the 3rd row and 4th column
 * The Texture contains group of 400 tiles (200 for Sodium and 200 for potassium)
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PotassiumIon = require( 'NEURON/neuron/model/PotassiumIon' );
  var SodiumIon = require( 'NEURON/neuron/model/SodiumIon' );
  var Vector2 = require( 'DOT/Vector2' );
  var Color = require( 'SCENERY/util/Color' );
  var Util = require( 'SCENERY/util/Util' );
  var DOTUtil = require( 'DOT/Util' );
  var ParticleType = require( 'NEURON/neuron/model/ParticleType' );

  /**
   *
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<number>} scaleProperty
   * @constructor
   */
  function ParticleTextureMap( modelViewTransform, scaleProperty ) {
    this.modelViewTransform = modelViewTransform;
    this.scaleProperty = scaleProperty;
    //Sodium
    this.sodiumParticle = new SodiumIon();
    this.potassiumParticle = new PotassiumIon();
    this.canvasStrokeStyle = Color.BLACK.getCanvasStyle();
    this.strokeGapBetweenParticles = 4;
    //Start building the tiles after a gap
    this.xMargin = this.strokeGapBetweenParticles;
    this.yMargin = this.strokeGapBetweenParticles;

  }

  return inherit( Object, ParticleTextureMap, {

    updateSpriteSheetDimensions: function() {
      var thisTextureMap = this;
      thisTextureMap.sodiumParticleViewRadius = thisTextureMap.modelViewTransform.modelToViewDeltaX( thisTextureMap.sodiumParticle.getRadius() ) * thisTextureMap.scaleProperty.value * 1.2;
      thisTextureMap.potassiumParticleSize = thisTextureMap.modelViewTransform.modelToViewDeltaX( thisTextureMap.potassiumParticle.getRadius() ) * thisTextureMap.scaleProperty.value * 1.35;

      var totalParticlesPerColumn = 20;

      //Draw Potassium particle shapes after drawing all the Sodium Particles
      thisTextureMap.potasiumTileHeightOffset = thisTextureMap.yMargin;
      thisTextureMap.potasiumTileHeightOffset += (totalParticlesPerColumn * thisTextureMap.sodiumParticleViewRadius);
      thisTextureMap.potasiumTileHeightOffset += 10 * thisTextureMap.strokeGapBetweenParticles;


      thisTextureMap.tileTotalHeght = thisTextureMap.potasiumTileHeightOffset;
      thisTextureMap.tileTotalHeght += totalParticlesPerColumn * thisTextureMap.potassiumParticleSize;
      thisTextureMap.tileTotalHeght += 10 * thisTextureMap.strokeGapBetweenParticles;
      thisTextureMap.tileTotalHeght += thisTextureMap.yMargin;

      var maxParticleSize = Math.max( thisTextureMap.potassiumParticleSize, thisTextureMap.sodiumParticleViewRadius );// each row has 10 particles
      thisTextureMap.tileTotalWidth = thisTextureMap.xMargin;
      thisTextureMap.tileTotalWidth += totalParticlesPerColumn * maxParticleSize;
      thisTextureMap.tileTotalWidth += 10 * thisTextureMap.strokeGapBetweenParticles;

      thisTextureMap.canvasWidth = 0;
      thisTextureMap.canvasHeight = 0;
    },
    calculateAndAssignCanvasDimensions: function( canvas ) {
      this.canvasWidth = canvas.width = Util.toPowerOf2( this.tileTotalWidth );
      this.canvasHeight = canvas.height = Util.toPowerOf2( this.tileTotalHeght );
    },
    getParticleCoords: function( particleType, xPos, yPos, coords ) {

      coords = coords || {};
      var w = this.sodiumParticleViewRadius;
      if ( particleType === ParticleType.SODIUM_ION ) {
        w = this.sodiumParticleViewRadius;
      }
      if ( particleType === ParticleType.POTASSIUM_ION ) {
        w = this.potassiumParticleSize;
      }
      var h = w;
      coords.leftX = xPos - w;
      coords.topY = yPos - h;
      coords.rightX = xPos + w;
      coords.bottomY = yPos + h;

      return coords;
    },
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

      for ( i = 0; i < particlesPerRow; i++ ) {
        for ( j = 0; j < particlesPerColumn; j++ ) {

          opacityString = "." + i + "" + j;
          opacityValue = parseFloat( opacityString );
          if ( opacityValue === 0.99 ) {
            opacityValue = 1;
          }
          context.strokeStyle = Color.BLACK.withAlpha( opacityValue * 1.2 ).getCanvasStyle();
          context.fillStyle = this.sodiumParticle.getRepresentationColor().withAlpha( opacityValue ).getCanvasStyle();// All sodium ions are of the same color,
          context.beginPath();
          particlePos = this.tilePostAt( this.sodiumParticle.getType(), i, j );
          context.arc( particlePos.x, particlePos.y, this.sodiumParticleViewRadius, 0, 2 * Math.PI, false );
          context.fill();
          context.stroke();


        }
      }

      context.strokeStyle = Color.BLACK.getCanvasStyle();
      context.lineWidth = 3;

      for ( i = 0; i < particlesPerRow; i++ ) {
        for ( j = 0; j < particlesPerColumn; j++ ) {
          opacityString = "." + i + "" + j;
          opacityValue = parseFloat( opacityString );
          if ( opacityValue === 0.99 ) {
            opacityValue = 1;
          }
          particlePos = this.tilePostAt( this.potassiumParticle.getType(), i, j );
          var x = particlePos.x;
          var y = particlePos.y;
          context.strokeStyle = Color.BLACK.withAlpha( opacityValue * 1.3 ).getCanvasStyle();
          context.fillStyle = this.potassiumParticle.getRepresentationColor().withAlpha( opacityValue ).getCanvasStyle();// All sodium ions are of the same color,
          context.beginPath();
          context.moveTo( x - this.potassiumParticleSize, y );
          context.lineTo( x, y - this.potassiumParticleSize );
          context.lineTo( x + this.potassiumParticleSize, y );
          context.lineTo( x, y + this.potassiumParticleSize );
          context.closePath();
          context.stroke();
          context.fill();


        }
      }

    },
    //returns or sets the center pos of the tile
    tilePostAt: function( particleType, row, column, posVector ) {
      posVector = posVector || new Vector2();
      if ( particleType === ParticleType.SODIUM_ION ) {
        posVector.x = (column * 2 * this.sodiumParticleViewRadius) + this.sodiumParticleViewRadius;
        posVector.y = (row * 2 * this.sodiumParticleViewRadius) + this.sodiumParticleViewRadius;
      }
      if ( particleType === ParticleType.POTASSIUM_ION ) {
        posVector.x = (column * 2 * this.potassiumParticleSize) + this.potassiumParticleSize;
        posVector.y = (row * 2 * this.potassiumParticleSize) + this.potassiumParticleSize;
        //The Potassium Tiles are arranged after Sodium
        posVector.y += this.potasiumTileHeightOffset;
      }

      posVector.x += this.xMargin; // account for horizontal margin
      posVector.y += this.yMargin;
      posVector.x += column * this.strokeGapBetweenParticles; // account for gap between particles
      posVector.y += row * this.strokeGapBetweenParticles;


      return posVector;

    },
    //Get the Tile's  normalized coordinates based on particle's opacity
    getTexCords: function( particleType, opacity, posVector, coords ) {
      if ( opacity >= 1 ) {
        opacity = 0.99; // The Max is 0.99 but mapped to 1 , see createTiles method
      }
      var opacityStr = DOTUtil.toFixed( opacity, 4 );
      var parts = opacityStr.split( "." );
      var row = parts[1].charAt( 0 );
      var column = parts[1].charAt( 1 );


      var tileRadius = 0;
      if ( particleType === ParticleType.SODIUM_ION ) {
        tileRadius = this.sodiumParticleViewRadius;
      }
      if ( particleType === ParticleType.POTASSIUM_ION ) {
        tileRadius = this.potassiumParticleSize;
      }

      var tilePost = this.tilePostAt( particleType, row, column, posVector );

      tileRadius += this.strokeGapBetweenParticles / 2;
      coords = coords || {};
      // Particle Pos is at center tp get the left corder, substrat the radius and normalize the value by
      // dividing it by canvasWidth, the Tex Coords needs to be on the range of 0..1
      coords.leftX = (tilePost.x - tileRadius) / this.canvasWidth;
      coords.topY = (tilePost.y - tileRadius) / this.canvasHeight;
      coords.rightX = (tilePost.x + tileRadius) / this.canvasWidth;
      coords.bottomY = (tilePost.y + tileRadius) / this.canvasHeight;


      return coords;
    }
  } );

} );