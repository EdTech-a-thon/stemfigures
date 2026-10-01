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
    blurb: 'Any cross from Tt × Tt to X-linked, filled in or left for students.',
    description:
      'Make printable Punnett squares for biology tests. Type the parents’ genotypes for a monohybrid, dihybrid or X-linked cross, with complete, incomplete or codominance, and show the offspring, gametes and ratios filled in or blank.',
    keywords: [
      'punnett square',
      'genetics',
      'cross',
      'monohybrid',
      'dihybrid',
      'x-linked',
      'sex-linked',
      'incomplete dominance',
      'codominance',
      'blood type',
      'genotype',
      'phenotype',
      'ratio',
      'allele',
      'gamete',
      'dominant',
      'recessive',
      'mendel',
      'printable',
    ],
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
    blurb: 'An agarose gel with a DNA ladder and the band sizes you type.',
    description:
      'Make printable gel electrophoresis results for biology tests. Pick a DNA ladder and gel, type each lane’s band sizes, and every band runs as far as its size takes it.',
    keywords: ['gel electrophoresis', 'agarose', 'gel', 'dna', 'bands', 'ladder', 'marker', 'base pairs', 'dna fingerprinting', 'crime scene', 'forensics', 'paternity', 'pcr', 'restriction digest', 'plasmid', 'standard curve', 'printable'],
  },
  {
    id: 'micropipette-reading',
    site: 'biology',
    name: 'Micropipette Reading',
    path: '/micropipette-reading',
    blurb: 'A micropipette’s volume display, set to the volume you type.',
    description:
      'Make printable micropipette figures for biology tests. Pick a P2 to P1000 and type a volume, and students read it from the three digits in its display, magnified.',
    keywords: ['micropipette', 'pipette', 'pipettor', 'pipetman', 'p20', 'p200', 'p1000', 'dial', 'display', 'microliter', 'volume', 'measurement', 'parts', 'lab', 'printable'],
  },
  {
    id: 'microscope-field-of-view',
    site: 'biology',
    name: 'Microscope Field of View',
    path: '/microscope-field-of-view',
    blurb: 'What you see down a microscope, for estimating size and magnification.',
    description:
      'Make printable microscope field of view figures for biology tests. Pick a magnification and specimen and students estimate its size from the field of view.',
    keywords: ['microscope', 'field of view', 'magnification', 'objective', 'eyepiece', 'specimen', 'cell size', 'micrometers', 'estimate', 'lab', 'printable'],
    off: true,
  },
]
