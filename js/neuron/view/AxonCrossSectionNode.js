// Copyright 2014-2022, University of Colorado Boulder

/**
 * Representation of the transverse cross section of the axon the view.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import { Shape } from '../../../../kite/js/imports.js';
import { Color, Node, Path } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';

// constants
const MEMBRANE_COLOR = Color.YELLOW;
const LINE_WIDTH = 1;

class AxonCrossSectionNode extends Node {

  /**
   * Constructor for the AxonCrossSectionNode
   * @param {NeuronModel} axonMembraneModel
   * @param {ModelViewTransform2} mvt
   */
  constructor( axonMembraneModel, mvt ) {
    super( {} );
    const outerDiameter = axonMembraneModel.getCrossSectionDiameter() + axonMembraneModel.getMembraneThickness();
    const innerDiameter = axonMembraneModel.getCrossSectionDiameter() - axonMembraneModel.getMembraneThickness();

    // Create the cross section, which consists of an outer circle that
    // represents the outer edge of the membrane and an inner circle that
    // represents the inner edge of the membrane and the inner portion of
    // the axon.
    const outerDiameterCircle = mvt.modelToViewShape( new Shape().ellipse( 0, 0, outerDiameter / 2, outerDiameter / 2 ) );
    const innerDiameterCircle = mvt.modelToViewShape( new Shape().ellipse( 0, 0, innerDiameter / 2, innerDiameter / 2 ) );
    const outerMembrane = new Path( outerDiameterCircle, {
      fill: MEMBRANE_COLOR,
      stroke: Color.BLACK,
      lineWidth: LINE_WIDTH
    } );
    this.addChild( outerMembrane );
    const innerMembrane = new Path( innerDiameterCircle, {
      fill: new Color( 73, 210, 242 ),
      stroke: Color.BLACK,
      lineWidth: LINE_WIDTH
    } );
    this.addChild( innerMembrane );
  }
}

neuron.register( 'AxonCrossSectionNode', AxonCrossSectionNode );

export default AxonCrossSectionNode;