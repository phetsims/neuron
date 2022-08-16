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
    'titleProperty': TReadOnlyProperty<string>;
  };
  'stimulateNeuron': string;
  'stimulateNeuronProperty': TReadOnlyProperty<string>;
  'legend': string;
  'legendProperty': TReadOnlyProperty<string>;
  'sodiumIon': string;
  'sodiumIonProperty': TReadOnlyProperty<string>;
  'potassiumIon': string;
  'potassiumIonProperty': TReadOnlyProperty<string>;
  'sodiumGatedChannel': string;
  'sodiumGatedChannelProperty': TReadOnlyProperty<string>;
  'potassiumGatedChannel': string;
  'potassiumGatedChannelProperty': TReadOnlyProperty<string>;
  'sodiumLeakChannel': string;
  'sodiumLeakChannelProperty': TReadOnlyProperty<string>;
  'potassiumLeakChannel': string;
  'potassiumLeakChannelProperty': TReadOnlyProperty<string>;
  'allIons': string;
  'allIonsProperty': TReadOnlyProperty<string>;
  'potentialChart': string;
  'potentialChartProperty': TReadOnlyProperty<string>;
  'charges': string;
  'chargesProperty': TReadOnlyProperty<string>;
  'concentrations': string;
  'concentrationsProperty': TReadOnlyProperty<string>;
  'chartTitle': string;
  'chartTitleProperty': TReadOnlyProperty<string>;
  'chartYAxisLabel': string;
  'chartYAxisLabelProperty': TReadOnlyProperty<string>;
  'chartXAxisLabel': string;
  'chartXAxisLabelProperty': TReadOnlyProperty<string>;
  'chartClear': string;
  'chartClearProperty': TReadOnlyProperty<string>;
  'showLegend': string;
  'showLegendProperty': TReadOnlyProperty<string>;
  'units': {
    'mM': string;
    'mMProperty': TReadOnlyProperty<string>;
  };
  'concentrationReadoutPattern': {
    '0label': {
      '1value': {
        '2units': string;
        '2unitsProperty': TReadOnlyProperty<string>;
      }
    }
  };
  'potassiumChemicalSymbol': string;
  'potassiumChemicalSymbolProperty': TReadOnlyProperty<string>;
  'sodiumChemicalSymbol': string;
  'sodiumChemicalSymbolProperty': TReadOnlyProperty<string>;
  'fastForward': string;
  'fastForwardProperty': TReadOnlyProperty<string>;
  'normal': string;
  'normalProperty': TReadOnlyProperty<string>;
  'slowMotion': string;
  'slowMotionProperty': TReadOnlyProperty<string>;
};

const neuronStrings = getStringModule( 'NEURON' ) as StringsType;

neuron.register( 'neuronStrings', neuronStrings );

export default neuronStrings;
