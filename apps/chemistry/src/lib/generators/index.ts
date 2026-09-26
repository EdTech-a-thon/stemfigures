// Every generator on the site. The directory and its search, page titles
// and the sitemap all read this list, so adding a generator means adding its
// folder and one entry here.

import type { Component } from 'svelte'
import BohrModelPreview from './bohr-model/Preview.svelte'
import LewisStructuresPreview from './lewis-structures/Preview.svelte'
import MassReadingPreview from './mass-reading/Preview.svelte'
import OrbitalDiagramPreview from './orbital-diagram/Preview.svelte'
import ParticleDiagramPreview from './particle-diagram/Preview.svelte'
import PhReadingPreview from './ph-reading/Preview.svelte'
import TemperatureReadingPreview from './temperature-reading/Preview.svelte'
import VolumeByDisplacementPreview from './volume-by-displacement/Preview.svelte'
import VolumeReadingPreview from './volume-reading/Preview.svelte'

export interface Generator {
  id: string
  /** display name, e.g. "Volume Reading" (the page title adds "Generator") */
  name: string
  /** its address on the site */
  path: string
  /** one line for the directory card */
  blurb: string
  /** the page's search engine description */
  description: string
  /** words teachers might search for instead of the name */
  keywords: string[]
  /** component drawing a sample figure */
  Preview: Component
}

export const GENERATORS: Generator[] = [
  {
    id: 'volume-reading',
    name: 'Volume Reading',
    path: '/volume-reading',
    blurb: 'A graduated cylinder, buret, or beaker showing the volume you type.',
    description:
      'Make printable graduated cylinder, buret and beaker figures for chemistry tests. Type a volume and students read it from the meniscus, with a magnified view for the estimated digit.',
    keywords: ['graduated', 'cylinder', 'buret', 'burette', 'beaker', 'meniscus', 'volume', 'mL', 'milliliters', 'measurement', 'lab', 'glassware'],
    Preview: VolumeReadingPreview,
  },
  {
    id: 'volume-by-displacement',
    name: 'Volume by Displacement',
    path: '/volume-by-displacement',
    blurb: 'A graduated cylinder before and after an object is dropped in.',
    description:
      'Make printable water displacement figures for chemistry tests. Type the before and after readings and get two graduated cylinders, with an object in the second, for students to find its volume.',
    keywords: ['water', 'displacement', 'displaced', 'graduated', 'cylinder', 'object', 'marble', 'rock', 'cube', 'irregular', 'solid', 'volume', 'density', 'mL', 'measurement', 'lab'],
    Preview: VolumeByDisplacementPreview,
  },
  {
    id: 'mass-reading',
    name: 'Mass Reading',
    path: '/mass-reading',
    blurb: 'A triple beam or digital balance showing the mass you type.',
    description:
      'Make printable balance figures for chemistry tests. Type a mass and get a digital, analytical or triple beam balance showing it, for students to read.',
    keywords: ['balance', 'scale', 'digital', 'analytical', 'electronic', 'triple', 'beam', 'mass', 'grams', 'weigh', 'weight', 'marble', 'rock', 'cube', 'object', 'density', 'measurement', 'lab'],
    Preview: MassReadingPreview,
  },
  {
    id: 'temperature-reading',
    name: 'Temperature Reading',
    path: '/temperature-reading',
    blurb: 'A liquid-in-glass or digital thermometer showing the temperature you type.',
    description:
      'Make printable thermometer figures for chemistry tests. Type a temperature in Celsius, Kelvin or Fahrenheit and students read it from a liquid-in-glass thermometer, with a magnified view for the estimated digit, or from a digital probe thermometer.',
    keywords: ['thermometer', 'temperature', 'celsius', 'kelvin', 'fahrenheit', 'degrees', 'digital', 'probe', 'alcohol', 'mercury', 'measurement', 'lab'],
    Preview: TemperatureReadingPreview,
  },
  {
    id: 'ph-reading',
    name: 'pH Reading',
    path: '/ph-reading',
    blurb: 'A digital or analog pH meter, or pH paper, showing the pH you type.',
    description:
      'Make printable pH meter figures for chemistry tests. Type a pH and students read it from a digital pH meter, from an analog meter with a magnified view for the estimated digit, or by matching a strip of pH paper to its color chart.',
    keywords: ['pH', 'meter', 'electrode', 'probe', 'digital', 'analog', 'needle', 'dial', 'paper', 'litmus', 'universal', 'indicator', 'color', 'chart', 'acid', 'base', 'acidic', 'basic', 'neutral', 'measurement', 'lab'],
    Preview: PhReadingPreview,
  },
  {
    id: 'particle-diagram',
    name: 'Particle Diagram',
    path: '/particle-diagram',
    blurb: 'Atoms, ions and molecules scattered in a box or packed in a lattice.',
    description:
      'Make printable particle diagrams for AP Chemistry tests. Pick the atoms, ions and molecules, their sizes, shades and charges, and how many of each, and get them scattered in a box or packed in an ionic or alloy lattice, with a key.',
    keywords: ['particulate', 'particles', 'atom', 'atoms', 'ion', 'ions', 'molecule', 'molecules', 'lattice', 'alloy', 'solid', 'liquid', 'gas', 'solution', 'ionic', 'AP', 'diagram', 'model', 'representation'],
    Preview: ParticleDiagramPreview,
  },
  {
    id: 'bohr-model',
    name: 'Bohr Model',
    path: '/bohr-model',
    blurb: 'An atom’s protons, neutrons and electrons on their shells.',
    description:
      'Make printable Bohr model diagrams for chemistry tests. Set the protons, neutrons and electrons on each shell, or fill the shells for any element, and get the nucleus and rings in your colors, with empty rings or a blank nucleus for students to complete.',
    keywords: ['bohr', 'atom', 'atomic', 'model', 'structure', 'proton', 'protons', 'neutron', 'neutrons', 'electron', 'electrons', 'nucleus', 'shell', 'shells', 'energy', 'level', 'orbit', 'isotope', 'ion', 'diagram'],
    Preview: BohrModelPreview,
  },
  {
    id: 'lewis-structures',
    name: 'Lewis Structures',
    path: '/lewis-structures',
    blurb: 'The Lewis structure of a molecule or ion, correct or with mistakes to find.',
    description:
      'Make printable Lewis structures for chemistry tests. Type a formula like H2O or SO4 2- and get its Lewis dot structure, with formal charges and resonance structures, a structure for students to complete, or a wrong one for students to find the mistakes in.',
    keywords: ['lewis', 'dot', 'electron', 'structure', 'structures', 'diagram', 'lone', 'pair', 'pairs', 'bond', 'bonds', 'bonding', 'covalent', 'molecule', 'polyatomic', 'ion', 'octet', 'formal', 'charge', 'resonance', 'valence', 'VSEPR'],
    Preview: LewisStructuresPreview,
  },
  {
    id: 'orbital-diagram',
    name: 'Orbital Diagram',
    path: '/orbital-diagram',
    blurb: 'Any atom or ion’s electron configuration as arrows in orbital boxes.',
    description:
      'Make printable orbital diagrams for chemistry tests. Pick an element and charge and get its electron configuration drawn as arrows in boxes, following the aufbau principle, Pauli exclusion and Hund’s rule, with exceptions, noble gas cores, blanks for students and deliberate mistakes.',
    keywords: ['electron', 'configuration', 'orbital', 'orbitals', 'notation', 'box', 'boxes', 'arrows', 'spin', 'aufbau', 'hund', 'hunds', 'pauli', 'exclusion', 'sublevel', 'subshell', 'noble', 'gas', 'core', 'shorthand', 'excited', 'ground', 'state', 'ion', 'AP'],
    Preview: OrbitalDiagramPreview,
  },
]

export const findGenerator = (path: string) => GENERATORS.find((g) => g.path === path)

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

/** Generators matching a search. Every word typed must start some word in the
 *  generator's name, blurb or keywords, so "grad cyl" finds Volume Reading. */
export function searchGenerators(query: string) {
  const wanted = words(query)
  if (!wanted.length) return GENERATORS
  return GENERATORS.filter((g) => {
    const have = words([g.name, g.blurb, ...g.keywords].join(' '))
    return wanted.every((w) => have.some((h) => h.startsWith(w)))
  })
}
