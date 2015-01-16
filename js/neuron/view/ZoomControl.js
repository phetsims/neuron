//  Copyright 2002-2014, University of Colorado Boulder

/**
 * A Scenery node that can be used to control the zoom factor.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HSlider = require( 'SUN/HSlider' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Util = require( 'DOT/Util' );


  /**
   * @param {Property.<number>} zoomProperty - property that indicates how far zoomed in the simulation is, between
   * @param {number} minZoom - the furthest out the sim can be zoomed (1)
   * @param {number} maxZoom - the furthest in the sim can be zoomed
   * @constructor
   */
  function ZoomControl( zoomProperty, minZoom, maxZoom ) {

    var zoomSliderOptions = {
      thumbSize: new Dimension2( 18, 22 ),
      trackSize: new Dimension2( 100, 1 )
    };
    var zoomSlider = new HSlider( zoomProperty, { min: minZoom, max: maxZoom }, zoomSliderOptions );
    zoomSlider.rotation = -Math.PI / 2;

    function createZoomControlButton( contentNode, marginOptions, listener ) {
      return new RectangularPushButton( {
        content: contentNode,
        cornerRadius: 2,
        xMargin: marginOptions.xMargin,
        yMargin: marginOptions.yMargin,
        baseColor: 'white',
        listener: listener
      } );
    }

    var sideLength = 24; // length of one side of the button, empirically determined
    var symbolLength = 0.5 * sideLength;
    var symbolLineWidth = 0.12 * sideLength;

    var plusSymbolShape = new Shape()
      .moveTo( symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, symbolLength )
      .moveTo( 0, symbolLength / 2 )
      .lineTo( symbolLength, symbolLength / 2 );

    var minusSymbolShape = new Shape()
      .moveTo( -symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, 0 );

    var symbolOptions = {
      lineWidth: symbolLineWidth,
      stroke: 'black',
      centerX: sideLength / 2,
      centerY: sideLength / 2
    };

    var plusButton = createZoomControlButton( new Path( plusSymbolShape, symbolOptions ), { xMargin: 6, yMargin: 6 }, function() {
      zoomProperty.set( Util.clamp( zoomProperty.value + 0.1, minZoom, maxZoom ) );
    } );

    var minusButton = createZoomControlButton( new Path( minusSymbolShape, symbolOptions ), { xMargin: 6, yMargin: 10 }, function() {
      zoomProperty.set( Util.clamp( zoomProperty.value - 0.1, minZoom, maxZoom ) );
    } );


    // vertical panel
    VBox.call( this, {
      children: [ plusButton, zoomSlider, minusButton ],
      align: 'center',
      resize: false,
      spacing: 12
    } );

    // Spacing is not even, because the rotation of horizontal slider into vertical doesn't center the thumb in the track
    minusButton.top = zoomSlider.bottom + 4;

  }

  return inherit( VBox, ZoomControl );

} );

