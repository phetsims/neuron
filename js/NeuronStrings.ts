// Copyright 2021-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/LocalizedStringProperty.js';
import neuron from './neuron.js';

type StringsType = {
  'neuron': {
    'title': string;
    'titleStringProperty': LocalizedStringProperty;
  };
  'stimulateNeuron': string;
  'stimulateNeuronStringProperty': LocalizedStringProperty;
  'legend': string;
  'legendStringProperty': LocalizedStringProperty;
  'sodiumIon': string;
  'sodiumIonStringProperty': LocalizedStringProperty;
  'potassiumIon': string;
  'potassiumIonStringProperty': LocalizedStringProperty;
  'sodiumGatedChannel': string;
  'sodiumGatedChannelStringProperty': LocalizedStringProperty;
  'potassiumGatedChannel': string;
  'potassiumGatedChannelStringProperty': LocalizedStringProperty;
  'sodiumLeakChannel': string;
  'sodiumLeakChannelStringProperty': LocalizedStringProperty;
  'potassiumLeakChannel': string;
  'potassiumLeakChannelStringProperty': LocalizedStringProperty;
  'allIons': string;
  'allIonsStringProperty': LocalizedStringProperty;
  'potentialChart': string;
  'potentialChartStringProperty': LocalizedStringProperty;
  'charges': string;
  'chargesStringProperty': LocalizedStringProperty;
  'concentrations': string;
  'concentrationsStringProperty': LocalizedStringProperty;
  'chartTitle': string;
  'chartTitleStringProperty': LocalizedStringProperty;
  'chartYAxisLabel': string;
  'chartYAxisLabelStringProperty': LocalizedStringProperty;
  'chartXAxisLabel': string;
  'chartXAxisLabelStringProperty': LocalizedStringProperty;
  'chartClear': string;
  'chartClearStringProperty': LocalizedStringProperty;
  'showLegend': string;
  'showLegendStringProperty': LocalizedStringProperty;
  'units': {
    'mM': string;
    'mMStringProperty': LocalizedStringProperty;
  };
  'concentrationReadoutPattern': {
    '0label': {
      '1value': {
        '2units': string;
        '2unitsStringProperty': LocalizedStringProperty;
      }
    }
  };
  'potassiumChemicalSymbol': string;
  'potassiumChemicalSymbolStringProperty': LocalizedStringProperty;
  'sodiumChemicalSymbol': string;
  'sodiumChemicalSymbolStringProperty': LocalizedStringProperty;
  'fastForward': string;
  'fastForwardStringProperty': LocalizedStringProperty;
  'normal': string;
  'normalStringProperty': LocalizedStringProperty;
  'slowMotion': string;
  'slowMotionStringProperty': LocalizedStringProperty;
};

const NeuronStrings = getStringModule( 'NEURON' ) as StringsType;

neuron.register( 'NeuronStrings', NeuronStrings );

export default NeuronStrings;
