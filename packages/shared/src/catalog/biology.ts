// Biology Figures' generators. See ./index.ts.
//
// Each starts turned off (`off: true`) until it is built: the generator's
// own branch deletes the flag, adds its preview and snapshot, and rewrites
// its blurb, description and keywords to match what it draws.

import type { CatalogEntry } from './index'

export const BIOLOGY: CatalogEntry[] = [
  {
    id: 'cell-diagram',
    site: 'biology',
    name: 'Cell Diagram',
    path: '/cell-diagram',
    blurb: 'An animal, plant or bacterial cell, with the organelles you choose.',
    description:
      'Make printable cell diagrams for biology tests. Pick an animal, plant or bacterial cell, choose which organelles to show, and label them, number them or leave them blank.',
    keywords: ['cell', 'organelles', 'animal cell', 'plant cell', 'bacteria', 'prokaryote', 'eukaryote', 'labeling', 'printable'],
    off: true,
  },
  {
    id: 'population-growth',
    site: 'biology',
    name: 'Population Growth',
    path: '/population-growth',
    blurb: 'Exponential and logistic growth curves, as numbers or per capita.',
    description:
      'Make printable population growth graphs for biology tests. Draw exponential or logistic growth with a carrying capacity, as raw numbers or per capita rates.',
    keywords: ['population', 'growth', 'exponential', 'logistic', 'carrying capacity', 'per capita', 'ecology', 'graph', 'printable'],
    off: true,
  },
  {
    id: 'punnett-square',
    site: 'biology',
    name: 'Punnett Square',
    path: '/punnett-square',
    blurb: 'A monohybrid or dihybrid cross, filled in or left for students.',
    description:
      'Make printable Punnett squares for biology tests. Type the parents’ genotypes and show the offspring filled in, partly filled or blank.',
    keywords: ['punnett square', 'genetics', 'cross', 'monohybrid', 'dihybrid', 'genotype', 'phenotype', 'allele', 'dominant', 'recessive', 'printable'],
    off: true,
  },
  {
    id: 'pedigree',
    site: 'biology',
    name: 'Pedigree',
    path: '/pedigree',
    blurb: 'A family pedigree for a trait, affected and carriers shaded.',
    description:
      'Make printable pedigree charts for biology tests. Build a family across generations and shade who has the trait, for dominant, recessive or X-linked inheritance.',
    keywords: ['pedigree', 'family tree', 'genetics', 'inheritance', 'carrier', 'affected', 'autosomal', 'dominant', 'recessive', 'x-linked', 'sex-linked', 'printable'],
    off: true,
  },
  {
    id: 'cell-division',
    site: 'biology',
    name: 'Mitosis & Meiosis',
    path: '/cell-division',
    blurb: 'A cell at any phase of mitosis or meiosis, with its chromosomes.',
    description:
      'Make printable mitosis and meiosis diagrams for biology tests. Pick a phase and a chromosome number and show the cell with its chromosomes at that stage.',
    keywords: ['mitosis', 'meiosis', 'cell division', 'cell cycle', 'phases', 'chromosomes', 'prophase', 'metaphase', 'anaphase', 'telophase', 'diploid', 'haploid', 'printable'],
    off: true,
  },
  {
    id: 'predator-prey',
    site: 'biology',
    name: 'Predator–Prey Cycles',
    path: '/predator-prey',
    blurb: 'Predator and prey populations rising and falling out of step.',
    description:
      'Make printable predator–prey graphs for biology tests. Pick a predator and its prey and graph their populations cycling over time, from the Lotka–Volterra model.',
    keywords: ['predator', 'prey', 'predator-prey', 'lotka-volterra', 'population', 'cycle', 'ecology', 'graph', 'printable'],
    off: true,
  },
  {
    id: 'gel-electrophoresis',
    site: 'biology',
    name: 'Gel Electrophoresis',
    path: '/gel-electrophoresis',
    blurb: 'A gel with a DNA ladder and the bands you type in each lane.',
    description:
      'Make printable gel electrophoresis results for biology tests. Add a DNA ladder and sample lanes, type each band’s size, and the bands move the right distance.',
    keywords: ['gel electrophoresis', 'gel', 'dna', 'bands', 'ladder', 'base pairs', 'dna fingerprinting', 'paternity', 'pcr', 'restriction', 'printable'],
    off: true,
  },
  {
    id: 'micropipette-reading',
    site: 'biology',
    name: 'Micropipette Reading',
    path: '/micropipette-reading',
    blurb: 'A micropipette’s dial showing the volume you type.',
    description:
      'Make printable micropipette figures for biology tests. Pick a P20, P200 or P1000 and type a volume, and students read it from the dial.',
    keywords: ['micropipette', 'pipette', 'pipettor', 'dial', 'microliter', 'volume', 'measurement', 'lab', 'printable'],
    off: true,
  },
  {
    id: 'microscope-field-of-view',
    site: 'biology',
    name: 'Microscope Field of View',
    path: '/microscope-field-of-view',
    blurb: 'The circle seen down a microscope, drawn to scale, for estimating size.',
    description:
      'Make printable microscope field of view figures for biology tests. Pick a magnification and a specimen, from onion cells to the letter e, and students estimate its size, work out the field at high power, or count the cells.',
    keywords: [
      'microscope', 'field of view', 'fov', 'field diameter', 'magnification', 'total magnification', 'objective', 'eyepiece', 'ocular',
      'low power', 'high power', 'specimen', 'cell size', 'estimate', 'micrometers', 'microns', 'onion cells', 'cheek cells',
      'red blood cells', 'paramecium', 'elodea', 'letter e', 'scale bar', 'lab', 'printable',
    ],
  },
]
