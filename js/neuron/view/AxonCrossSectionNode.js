// Copyright 2014-2015, University of Colorado Boulder

/**
 * Representation of the transverse cross section of the axon the view.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var neuron = require( 'NEURON/neuron' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Color = require( 'SCENERY/util/Color' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var MEMBRANE_COLOR = Color.YELLOW;
  var LINE_WIDTH = 1;

  /**
   * Constructor for the AxonCrossSectionNode
   * @param {NeuronModel} axonMembraneModel
   * @param {ModelViewTransform2} mvt
   * @constructor
   */
  function AxonCrossSectionNode( axonMembraneModel, mvt ) {
    var self = this;
    Node.call( self, {} );
    var outerDiameter = axonMembraneModel.getCrossSectionDiameter() + axonMembraneModel.getMembraneThickness();
    var innerDiameter = axonMembraneModel.getCrossSectionDiameter() - axonMembraneModel.getMembraneThickness();

    // Create the cross section, which consists of an outer circle that
    // represents the outer edge of the membrane and an inner circle that
    // represents the inner edge of the membrane and the inner portion of
    // the axon.
    var outerDiameterCircle = mvt.modelToViewShape( new Shape().ellipse( 0, 0, outerDiameter / 2, outerDiameter / 2 ) );
    var innerDiameterCircle = mvt.modelToViewShape( new Shape().ellipse( 0, 0, innerDiameter / 2, innerDiameter / 2 ) );
    var outerMembrane = new Path( outerDiameterCircle, { fill: MEMBRANE_COLOR, stroke: Color.BLACK, lineWidth: LINE_WIDTH } );
    self.addChild( outerMembrane );
    var innerMembrane = new Path( innerDiameterCircle, { fill: new Color( 73, 210, 242 ), stroke: Color.BLACK, lineWidth: LINE_WIDTH } );
    self.addChild( innerMembrane );
  }

  neuron.register( 'AxonCrossSectionNode', AxonCrossSectionNode );

  return inherit( Node, AxonCrossSectionNode );
} );

