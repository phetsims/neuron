// Copyright 2014-2021, University of Colorado Boulder

/**
 * creates particles on a canvas that can used for rendering as a texture using WebGL
 *
 * @author Sharfudeen Ashraf (for Ghent University)
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';
import NeuronConstants from '../common/NeuronConstants.js';
import ParticleType from '../model/ParticleType.js';

// constants
const CANVAS_LENGTH = 128; // width and height of the canvas, must be a power of 2 so that mipmapping can be used
const MARGIN = CANVAS_LENGTH * 0.1; // space around the particles
const STROKE_WIDTH = CANVAS_LENGTH / 32;
const PRINT_DATA_URL_OF_SPRITE_SHEET = false; // very useful for debugging issues with the sprite sheet texture

class NeuronParticlesTexture {

  /**
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( modelViewTransform ) {
    this.modelViewTransform = modelViewTransform; // @private

    // create the canvas upon which the particle images will be drawn
    this.canvas = document.createElement( 'canvas' );
    this.canvas.width = CANVAS_LENGTH;
    this.canvas.height = CANVAS_LENGTH;
    this.canvasContext = this.canvas.getContext( '2d' );

    // create the particle images on the canvas
    this.createParticleImages( this.canvasContext );

    // for debugging
    if ( PRINT_DATA_URL_OF_SPRITE_SHEET ) {
      console.log( `this.canvas..toDataURL() = ${this.canvas.toDataURL()}` );
    }
  }

  /**
   * Draw the particles on the provided canvas.
   * @param {Canvas.context} context
   * @private
   */
  createParticleImages( context ) {

    // clear the canvas
    this.canvasContext.clearRect( 0, 0, this.canvas.width, this.canvas.height );

    // initialize some of the attributes that are shared by all particles
    context.strokeStyle = Color.BLACK.getCanvasStyle();
    context.lineWidth = STROKE_WIDTH;
    context.lineJoin = 'round';

    let particlePos;

    // create the image for sodium ions
    const sodiumParticleRadius = ( CANVAS_LENGTH / 2 - 2 * MARGIN ) / 2;
    context.fillStyle = NeuronConstants.SODIUM_COLOR.getCanvasStyle();
    context.beginPath();
    particlePos = this.getTilePosition( ParticleType.SODIUM_ION, particlePos );
    context.arc( particlePos.x, particlePos.y, sodiumParticleRadius, 0, 2 * Math.PI, false );
    context.fill();
    context.stroke();

    // create the image for potassium ions
    const potassiumParticleWidth = CANVAS_LENGTH / 2 - 2 * MARGIN;
    particlePos = this.getTilePosition( ParticleType.POTASSIUM_ION, particlePos );
    const x = particlePos.x;
    const y = particlePos.y;
    context.fillStyle = NeuronConstants.POTASSIUM_COLOR.getCanvasStyle();
    context.beginPath();
    context.moveTo( x - potassiumParticleWidth / 2, y );
    context.lineTo( x, y - potassiumParticleWidth / 2 );
    context.lineTo( x + potassiumParticleWidth / 2, y );
    context.lineTo( x, y + potassiumParticleWidth / 2 );
    context.closePath();
    context.fill();
    context.stroke();
  }

  /**
   * calculates the center position of the tile for the given type
   * @param {ParticleType} particleType
   * @private
   */
  getTilePosition( particleType ) {

    // allocate a vector if none was provided
    const posVector = new Vector2( CANVAS_LENGTH / 4, CANVAS_LENGTH / 4 );

    if ( particleType === ParticleType.POTASSIUM_ION ) {
      //The Potassium Tiles are arranged after Sodium
      posVector.y = posVector.y + CANVAS_LENGTH / 2;
    }

    return posVector;
  }

  /**
   * get the tile's normalized texture coordinates
   * @param {ParticleType} particleType
   * @returns {Bounds2}
   * @public
   */
  getTexCoords( particleType ) {
    const coords = new Bounds2( 0, 0, 0, 0 );
    const tileCenterPosition = this.getTilePosition( particleType );
    const tileRadius = CANVAS_LENGTH / 4;

    // Set the normalized bounds within the texture for the requested particle type.
    coords.setMinX( ( tileCenterPosition.x - tileRadius ) / this.canvas.width );
    coords.setMinY( ( tileCenterPosition.y - tileRadius ) / this.canvas.height );
    coords.setMaxX( ( tileCenterPosition.x + tileRadius ) / this.canvas.width );
    coords.setMaxY( ( tileCenterPosition.y + tileRadius ) / this.canvas.height );

    return coords;
  }
}

neuron.register( 'NeuronParticlesTexture', NeuronParticlesTexture );

export default NeuronParticlesTexture;