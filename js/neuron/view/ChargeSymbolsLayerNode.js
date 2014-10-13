// Copyright 2002-2011, University of Colorado
/**
 * Container class for ChargeSymbols
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );
  var ChargeSymbolNode = require( 'NEURON/neuron/view/ChargeSymbolNode' );

  // Max size of the charge symbols, tweak as needed.
  var MAX_CHARGE_SYMBOL_SIZE = 5;// was 8
  /**
   *
   * @param neuronModel
   * @param mvt
   * @constructor
   */
  function ChargeSymbolsLayerNode(neuronModel,mvt) {

    Node.call(this);
    var chargeSymbolLayer = this;
    /**
     * Add the change symbols to the canvas.  These are added by going through
     * the list of channels and placing two symbols - one intended to be out
     * of the membrane one one inside of it - between each pair of gates.
     */
    function addChargeSymbols() {
      // Create a sorted list of the membrane channels in the model.
      var sortedMembraneChannels = neuronModel.membraneChannels.getArray().slice();
      sortMembraneChannelList( sortedMembraneChannels );

      // Go through the list and put charge symbols between each pair of channels.
      for ( var i = 0; i < sortedMembraneChannels.length; i++ ) {
        addChargeSymbolPair( sortedMembraneChannels[ i ], sortedMembraneChannels[ (i + 1) % sortedMembraneChannels.length ] );
      }
    }

    function addChargeSymbolPair( channel1, channel2 ) {

      var outerChargeSymbol;
      var innerChargeSymbol;
      var innerSymbolLocation = new Vector2();
      var outerSymbolLocation = new Vector2();
      var neuronCenterPoint = new Vector2( 0, 0 );  // Assumes center of neuron at (0, 0).

      calcChargeSymbolLocations( channel1.getCenterLocation(), channel2.getCenterLocation(), neuronCenterPoint, outerSymbolLocation, innerSymbolLocation );
      outerChargeSymbol = new ChargeSymbolNode( neuronModel, MAX_CHARGE_SYMBOL_SIZE, 0.1, false );
      outerChargeSymbol.setTranslation( mvt.modelToViewPosition( innerSymbolLocation ) );
      chargeSymbolLayer.addChild( outerChargeSymbol );
      innerChargeSymbol = new ChargeSymbolNode( neuronModel, MAX_CHARGE_SYMBOL_SIZE, 0.1, true );
      innerChargeSymbol.setTranslation( mvt.modelToViewPosition( outerSymbolLocation ) );
      chargeSymbolLayer.addChild( innerChargeSymbol );
    }

    /**
     * Calculate the locations of the charge symbols and set the two provided
     * points accordingly.
     *
     * @param p1
     * @param p2
     * @param center
     * @param outerPoint
     * @param innerPoint
     */
    function calcChargeSymbolLocations( p1, p2, neuronCenter, outerPoint, innerPoint ) {
      // Find the center point between the given points.
      var center = new Vector2( (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 );

      // Convert to polar coordinates.
      var radius = Math.sqrt( Math.pow( center.x - neuronCenter.x, 2 ) + Math.pow( center.y - neuronCenter.y, 2 ) );
      var angle = Math.atan2( center.y - neuronCenter.y, center.x - neuronCenter.x );

      // Add some distance to the radius to make the charge outside the cell.
      var outsideRadius = radius + 5; // Tweak as needed to position outer charge symbol. (was 4)

      // Subtract some distance from the radius to make the charge inside the cell.
      var insideRadius = radius - 4; // Tweak as needed to position outer charge symbol.(was 3 in java)

      // Convert to cartesian coordinates
      outerPoint.setXY( outsideRadius * Math.cos( angle ), outsideRadius * Math.sin( angle ) );
      innerPoint.setXY( insideRadius * Math.cos( angle ), insideRadius * Math.sin( angle ) );
    }


    /**
     * Sort the provided list of membrane channels such that they proceed in
     * clockwise order around the membrane.
     *
     * @param membraneChannels
     */
    function sortMembraneChannelList( membraneChannels ) {
      var orderChanged = true;
      while ( orderChanged ) {
        orderChanged = false;
        for ( var i = 0; i < membraneChannels.length - 1; i++ ) {
          var p1 = membraneChannels[ i ].getCenterLocation();
          var p2 = membraneChannels[ i + 1 ].getCenterLocation();
          var a1 = Math.atan2( p1.y, p1.x );
          var a2 = Math.atan2( p2.y, p2.x );
          if ( a1 > a2 ) {
            // These two need to be swapped.
            var tempChannel = membraneChannels[i ];
            membraneChannels[ i] = membraneChannels[ i + 1 ];
            membraneChannels[ i + 1] = tempChannel;
            orderChanged = true;
          }
        }
      }
    }


    addChargeSymbols();
  }


  return inherit( Node, ChargeSymbolsLayerNode );

} );