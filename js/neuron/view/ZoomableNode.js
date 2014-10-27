//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Transform3 = require( 'DOT/Transform3' );
  var Matrix3 = require( 'DOT/Matrix3' );

  /**
   *
   * @param neuronModel
   * @param zoomableRootNode
   * @param viewPortPosition
   * @param zoomProperty
   * @constructor
   */
  function ZoomableNode( zoomableRootNode, zoomProperty, neuronModel, clipArea, viewPortPosition ) {

    var thisNode = this;
    Node.call( thisNode, { clipArea: clipArea } );
    zoomProperty.link( function( zoomFactor ) {
      // Zoom toward the top so that when zoomed in the membrane
      // is in a reasonable place and there is room for the chart below
      // it.
      var zoomTowardTopThreshold = 1.5;
      var scaleMatrix;
      var scaleAroundX;
      var scaleAroundY;
      if ( zoomFactor > zoomTowardTopThreshold ) {
        scaleAroundX = Math.round( viewPortPosition.x );
        scaleAroundY = (zoomFactor - zoomTowardTopThreshold) * neuronModel.getAxonMembrane().getCrossSectionDiameter() * 0.11;
        scaleMatrix = Matrix3.translation( scaleAroundX, scaleAroundY ).timesMatrix( Matrix3.scaling( zoomFactor, zoomFactor ) ).timesMatrix( Matrix3.translation( -scaleAroundX, -scaleAroundY ) );
      }
      else {
        scaleAroundX = (Math.round( viewPortPosition.x ));
        scaleAroundY = 0;
        scaleMatrix = Matrix3.translation( scaleAroundX, scaleAroundY ).timesMatrix( Matrix3.scaling( zoomFactor, zoomFactor ) ).timesMatrix( Matrix3.translation( -scaleAroundX, -scaleAroundY ) );

      }

      var scaleTransform = new Transform3( scaleMatrix );
      zoomableRootNode.setTransform( scaleTransform );

    } );

    thisNode.addChild( zoomableRootNode );

  }

  return inherit( Node, ZoomableNode );

} );