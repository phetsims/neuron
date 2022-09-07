// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import neuron from './neuron.js';

type StringsType = {
  'neuron': {
    'title': string;
    'titleStringProperty': TReadOnlyProperty<string>;
  };
  'stimulateNeuron': string;
  'stimulateNeuronStringProperty': TReadOnlyProperty<string>;
  'legend': string;
  'legendStringProperty': TReadOnlyProperty<string>;
  'sodiumIon': string;
  'sodiumIonStringProperty': TReadOnlyProperty<string>;
  'potassiumIon': string;
  'potassiumIonStringProperty': TReadOnlyProperty<string>;
  'sodiumGatedChannel': string;
  'sodiumGatedChannelStringProperty': TReadOnlyProperty<string>;
  'potassiumGatedChannel': string;
  'potassiumGatedChannelStringProperty': TReadOnlyProperty<string>;
  'sodiumLeakChannel': string;
  'sodiumLeakChannelStringProperty': TReadOnlyProperty<string>;
  'potassiumLeakChannel': string;
  'potassiumLeakChannelStringProperty': TReadOnlyProperty<string>;
  'allIons': string;
  'allIonsStringProperty': TReadOnlyProperty<string>;
  'potentialChart': string;
  'potentialChartStringProperty': TReadOnlyProperty<string>;
  'charges': string;
  'chargesStringProperty': TReadOnlyProperty<string>;
  'concentrations': string;
  'concentrationsStringProperty': TReadOnlyProperty<string>;
  'chartTitle': string;
  'chartTitleStringProperty': TReadOnlyProperty<string>;
  'chartYAxisLabel': string;
  'chartYAxisLabelStringProperty': TReadOnlyProperty<string>;
  'chartXAxisLabel': string;
  'chartXAxisLabelStringProperty': TReadOnlyProperty<string>;
  'chartClear': string;
  'chartClearStringProperty': TReadOnlyProperty<string>;
  'showLegend': string;
  'showLegendStringProperty': TReadOnlyProperty<string>;
  'units': {
    'mM': string;
    'mMStringProperty': TReadOnlyProperty<string>;
  };
  'concentrationReadoutPattern': {
    '0label': {
      '1value': {
        '2units': string;
        '2unitsStringProperty': TReadOnlyProperty<string>;
      }
    }
  };
  'potassiumChemicalSymbol': string;
  'potassiumChemicalSymbolStringProperty': TReadOnlyProperty<string>;
  'sodiumChemicalSymbol': string;
  'sodiumChemicalSymbolStringProperty': TReadOnlyProperty<string>;
  'fastForward': string;
  'fastForwardStringProperty': TReadOnlyProperty<string>;
  'normal': string;
  'normalStringProperty': TReadOnlyProperty<string>;
  'slowMotion': string;
  'slowMotionStringProperty': TReadOnlyProperty<string>;
};

const neuronStrings = getStringModule( 'NEURON' ) as StringsType;

neuron.register( 'neuronStrings', neuronStrings );

export default neuronStrings;
