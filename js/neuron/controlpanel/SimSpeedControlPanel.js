// Copyright 2002-2014, University of Colorado Boulder

/**
 * Control panel for choosing the sim speed
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */
define( function( require ) {
  'use strict';

  //imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var VerticalAquaRadioButtonGroup = require( 'SUN/VerticalAquaRadioButtonGroup' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // Labels for speed radio buttons
  var fastForwardString = require( 'string!NEURON/fastForward' );
  var normalString = require( 'string!NEURON/normal' );
  var slowMotionString = require( 'string!NEURON/slowMotion' );


  /**
   * @param speedProperty
   * @constructor
   */
  function SimSpeedControlPanel( speedProperty ) {


    var radioButtonFont = new PhetFont( { size: 12, weight: 'bold' } );
    var speedRadioButtonGroup = new VerticalAquaRadioButtonGroup( [
      { node: new Text( fastForwardString, {font: radioButtonFont} ), property: speedProperty, value: 2 },
      { node: new Text( normalString, {font: radioButtonFont} ), property: speedProperty, value: 1 },
      { node: new Text( slowMotionString, {font: radioButtonFont} ), property: speedProperty, value: 0.5 }
    ] );


    Panel.call( this, speedRadioButtonGroup, {
      // panel options
      fill: 'rgb(238,238,238)',
      xMargin: 2,
      yMargin: 2,
      lineWidth: 0
    } );

  }

  return inherit( Panel, SimSpeedControlPanel );

} );