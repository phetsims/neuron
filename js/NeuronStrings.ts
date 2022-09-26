// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import LinkableProperty from '../../axon/js/LinkableProperty.js';
import neuron from './neuron.js';

type StringsType = {
  'neuron': {
    'title': string;
    'titleStringProperty': LinkableProperty<string>;
  };
  'stimulateNeuron': string;
  'stimulateNeuronStringProperty': LinkableProperty<string>;
  'legend': string;
  'legendStringProperty': LinkableProperty<string>;
  'sodiumIon': string;
  'sodiumIonStringProperty': LinkableProperty<string>;
  'potassiumIon': string;
  'potassiumIonStringProperty': LinkableProperty<string>;
  'sodiumGatedChannel': string;
  'sodiumGatedChannelStringProperty': LinkableProperty<string>;
  'potassiumGatedChannel': string;
  'potassiumGatedChannelStringProperty': LinkableProperty<string>;
  'sodiumLeakChannel': string;
  'sodiumLeakChannelStringProperty': LinkableProperty<string>;
  'potassiumLeakChannel': string;
  'potassiumLeakChannelStringProperty': LinkableProperty<string>;
  'allIons': string;
  'allIonsStringProperty': LinkableProperty<string>;
  'potentialChart': string;
  'potentialChartStringProperty': LinkableProperty<string>;
  'charges': string;
  'chargesStringProperty': LinkableProperty<string>;
  'concentrations': string;
  'concentrationsStringProperty': LinkableProperty<string>;
  'chartTitle': string;
  'chartTitleStringProperty': LinkableProperty<string>;
  'chartYAxisLabel': string;
  'chartYAxisLabelStringProperty': LinkableProperty<string>;
  'chartXAxisLabel': string;
  'chartXAxisLabelStringProperty': LinkableProperty<string>;
  'chartClear': string;
  'chartClearStringProperty': LinkableProperty<string>;
  'showLegend': string;
  'showLegendStringProperty': LinkableProperty<string>;
  'units': {
    'mM': string;
    'mMStringProperty': LinkableProperty<string>;
  };
  'concentrationReadoutPattern': {
    '0label': {
      '1value': {
        '2units': string;
        '2unitsStringProperty': LinkableProperty<string>;
      }
    }
  };
  'potassiumChemicalSymbol': string;
  'potassiumChemicalSymbolStringProperty': LinkableProperty<string>;
  'sodiumChemicalSymbol': string;
  'sodiumChemicalSymbolStringProperty': LinkableProperty<string>;
  'fastForward': string;
  'fastForwardStringProperty': LinkableProperty<string>;
  'normal': string;
  'normalStringProperty': LinkableProperty<string>;
  'slowMotion': string;
  'slowMotionStringProperty': LinkableProperty<string>;
};

const NeuronStrings = getStringModule( 'NEURON' ) as StringsType;

neuron.register( 'NeuronStrings', NeuronStrings );

export default NeuronStrings;
