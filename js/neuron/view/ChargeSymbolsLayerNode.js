// Copyright 2014-2021, University of Colorado Boulder
/**
 * Container class for ChargeSymbols
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Node } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';
import ChargeSymbolNode from './ChargeSymbolNode.js';

// Max size of the charge symbols, tweak as needed.
const MAX_CHARGE_SYMBOL_SIZE = 10;

class ChargeSymbolsLayerNode extends Node {

  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} mvt
   */
  constructor( neuronModel, mvt ) {

    super();

    neuronModel.chargesShownProperty.link( chargesShown => {
      this.visible = chargesShown;
    } );

    /**
     * Add the change symbols to the canvas.  These are added by going through the list of channels and placing two
     * symbols - one intended to be out of the membrane one one inside of it - between each pair of gates.
     */
    const addChargeSymbols = () => {
      // Create a sorted list of the membrane channels in the model.
      const sortedMembraneChannels = neuronModel.membraneChannels.slice();
      sortMembraneChannelList( sortedMembraneChannels );

      // Go through the list and put charge symbols between each pair of channels.
      for ( let i = 0; i < sortedMembraneChannels.length; i++ ) {
        addChargeSymbolPair( sortedMembraneChannels[ i ], sortedMembraneChannels[ ( i + 1 ) % sortedMembraneChannels.length ] );
      }
    };

    const outerChargeSymbol = new ChargeSymbolNode( neuronModel, MAX_CHARGE_SYMBOL_SIZE, 0.1, true );
    const innerChargeSymbol = new ChargeSymbolNode( neuronModel, MAX_CHARGE_SYMBOL_SIZE, 0.1, false );

    // function to add a pair of complementary charge symbols, one inside the membrane and one outside
    const addChargeSymbolPair = ( channel1, channel2 ) => {

      const innerSymbolPosition = new Vector2( 0, 0 );
      const outerSymbolPosition = new Vector2( 0, 0 );
      const outerSymbolParentNode = new Node();
      outerSymbolParentNode.addChild( outerChargeSymbol );
      const innerSymbolParentNode = new Node();
      innerSymbolParentNode.addChild( innerChargeSymbol );

      calcChargeSymbolPositions( channel1.getCenterPosition(), channel2.getCenterPosition(), Vector2.ZERO, outerSymbolPosition, innerSymbolPosition );
      outerSymbolParentNode.setTranslation( mvt.modelToViewPosition( outerSymbolPosition ) );
      this.addChild( outerSymbolParentNode );
      innerSymbolParentNode.setTranslation( mvt.modelToViewPosition( innerSymbolPosition ) );
      this.addChild( innerSymbolParentNode );
    };

    /**
     * Calculate the positions of the charge symbols and set the two provided points accordingly.
     * @param {Vector2} p1
     * @param {Vector2} p2
     * @param {Vector2} neuronCenter
     * @param {Vector2} outerPoint // out parameter
     * @param {Vector2} innerPoint // out parameter
     */
    function calcChargeSymbolPositions( p1, p2, neuronCenter, outerPoint, innerPoint ) {

      // Find the center point between the given points.
      const center = new Vector2( ( p1.x + p2.x ) / 2, ( p1.y + p2.y ) / 2 );

      // Convert to polar coordinates.
      const radius = Math.sqrt( Math.pow( center.x - neuronCenter.x, 2 ) + Math.pow( center.y - neuronCenter.y, 2 ) );
      const angle = Math.atan2( center.y - neuronCenter.y, center.x - neuronCenter.x );

      // Add some distance to the radius to make the charge outside the cell.
      const outsideRadius = radius + 5; // Tweak as needed to position outer charge symbol. (was 4)

      // Subtract some distance from the radius to make the charge inside the cell.
      const insideRadius = radius - 4; // Tweak as needed to position outer charge symbol.(was 3 in java)

      // Convert to cartesian coordinates
      outerPoint.setXY( outsideRadius * Math.cos( angle ), outsideRadius * Math.sin( angle ) );
      innerPoint.setXY( insideRadius * Math.cos( angle ), insideRadius * Math.sin( angle ) );
    }

    /**
     * Sort the provided list of membrane channels such that they proceed in clockwise order around the membrane.
     * @param {Array.<MembraneChannel>} membraneChannels
     */
    function sortMembraneChannelList( membraneChannels ) {
      let orderChanged = true;
      while ( orderChanged ) {
        orderChanged = false;
        for ( let i = 0; i < membraneChannels.length - 1; i++ ) {
          const p1 = membraneChannels[ i ].getCenterPosition();
          const p2 = membraneChannels[ i + 1 ].getCenterPosition();
          const a1 = Math.atan2( p1.y, p1.x );
          const a2 = Math.atan2( p2.y, p2.x );
          if ( a1 > a2 ) {
            // These two need to be swapped.
            const tempChannel = membraneChannels[ i ];
            membraneChannels[ i ] = membraneChannels[ i + 1 ];
            membraneChannels[ i + 1 ] = tempChannel;
            orderChanged = true;
          }
        }
      }
    }

    addChargeSymbols();
  }
}

neuron.register( 'ChargeSymbolsLayerNode', ChargeSymbolsLayerNode );

export default ChargeSymbolsLayerNode;
