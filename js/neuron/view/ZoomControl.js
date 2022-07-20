// Copyright 2014-2022, University of Colorado Boulder

/**
 * A Scenery node that can be used to control the zoom factor.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Path, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import VSlider from '../../../../sun/js/VSlider.js';
import neuron from '../../neuron.js';

class ZoomControl extends VBox {

  /**
   * @param {Property.<number>} zoomProperty - property that indicates how far zoomed in the simulation is, between
   * @param {number} minZoom - the furthest out the sim can be zoomed (1)
   * @param {number} maxZoom - the furthest in the sim can be zoomed
   */
  constructor( zoomProperty, minZoom, maxZoom ) {

    const zoomSlider = new VSlider( zoomProperty, new Range( minZoom, maxZoom ), {
      thumbSize: new Dimension2( 22, 18 ),
      trackSize: new Dimension2( 1, 100 ),
      thumbTouchAreaXDilation: 8,
      thumbTouchAreaYDilation: 8
    } );

    function createZoomControlButton( contentNode, marginOptions, listener ) {
      return new RectangularPushButton( {
        content: contentNode,
        cornerRadius: 2,
        xMargin: marginOptions.xMargin,
        yMargin: marginOptions.yMargin,
        baseColor: 'white',
        listener: listener,
        touchAreaXDilation: 5,
        touchAreaYDilation: 5
      } );
    }

    const sideLength = 24; // length of one side of the button, empirically determined
    const symbolLength = 0.5 * sideLength;
    const symbolLineWidth = 0.12 * sideLength;

    const plusSymbolShape = new Shape()
      .moveTo( symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, symbolLength )
      .moveTo( 0, symbolLength / 2 )
      .lineTo( symbolLength, symbolLength / 2 );

    const minusSymbolShape = new Shape()
      .moveTo( -symbolLength / 2, 0 )
      .lineTo( symbolLength / 2, 0 );

    const symbolOptions = {
      lineWidth: symbolLineWidth,
      stroke: 'black',
      centerX: sideLength / 2,
      centerY: sideLength / 2
    };

    const plusButton = createZoomControlButton( new Path( plusSymbolShape, symbolOptions ), {
      xMargin: 6,
      yMargin: 6
    }, () => {
      zoomProperty.set( Utils.clamp( zoomProperty.value + 0.1, minZoom, maxZoom ) );
    } );

    const minusButton = createZoomControlButton( new Path( minusSymbolShape, symbolOptions ), {
      xMargin: 6,
      yMargin: 10
    }, () => {
      zoomProperty.set( Utils.clamp( zoomProperty.value - 0.1, minZoom, maxZoom ) );
    } );

    // Temporarily set the zoom to a value that puts the knob roughly half way up so that the initial layout of the
    // VBox will work.
    const originalZoomValue = zoomProperty.value;
    zoomProperty.set( 4 );

    // vertical panel
    super( {
      children: [ plusButton, zoomSlider, minusButton ],
      align: 'center',
      resize: false,
      spacing: 12
    } );

    // restore the zoom to its original value
    zoomProperty.set( originalZoomValue );
  }
}

neuron.register( 'ZoomControl', ZoomControl );

export default ZoomControl;