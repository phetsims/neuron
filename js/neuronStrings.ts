// Copyright 2021-2022, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import neuron from './neuron.js';

type StringsType = {
  'neuron': {
    'title': string;
  };
  'stimulateNeuron': string;
  'legend': string;
  'sodiumIon': string;
  'potassiumIon': string;
  'sodiumGatedChannel': string;
  'potassiumGatedChannel': string;
  'sodiumLeakChannel': string;
  'potassiumLeakChannel': string;
  'allIons': string;
  'potentialChart': string;
  'charges': string;
  'concentrations': string;
  'chartTitle': string;
  'chartYAxisLabel': string;
  'chartXAxisLabel': string;
  'chartClear': string;
  'showLegend': string;
  'units': {
    'mM': string;
  };
  'concentrationReadoutPattern': {
    '0label': {
      '1value': {
        '2units': string;
      }
    }
  };
  'potassiumChemicalSymbol': string;
  'sodiumChemicalSymbol': string;
  'fastForward': string;
  'normal': string;
  'slowMotion': string;
};

const neuronStrings = getStringModule( 'NEURON' ) as StringsType;

neuron.register( 'neuronStrings', neuronStrings );

export default neuronStrings;
