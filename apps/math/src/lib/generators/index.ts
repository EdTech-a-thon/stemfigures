// Every generator on the site. The directory and its search, page titles
// and the sitemap all read this list, so adding a generator means adding its
// folder and one entry here.

import ConePreview from './cone/Preview.svelte'
import CylinderPreview from './cylinder/Preview.svelte'
import CoordinateGridPreview from './coordinate-grid/Preview.svelte'
import NumberLinePreview from './number-line/Preview.svelte'
import PrismPreview from './prism/Preview.svelte'
import PyramidPreview from './pyramid/Preview.svelte'
import SpherePreview from './sphere/Preview.svelte'
import TrianglePreview from './triangle/Preview.svelte'
import type { Component } from 'svelte'

export type Generator = {
  id: string
  /** page title, e.g. "Coordinate Grid Generator" */
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
    id: 'coordinate-grid',
    name: 'Coordinate Grid Generator',
    path: '/coordinate-grid',
    blurb: 'Square grids with x- and y-axes, for plotting points and lines.',
    description:
      'Make a printable coordinate grid (graph paper) for your class. Graph lines like y = 2x + 1 and plot points, choose the range, titles and axis arrows, then copy it into a worksheet or test.',
    keywords: [
      'graph paper', 'grid paper', 'coordinate plane', 'cartesian plane', 'cartesian coordinate plane',
      'cartesian coordinates', 'rectangular coordinates', 'xy plane', 'x-y grid', 'xy', 'axes', 'x-axis', 'y-axis',
      'quadrant', 'first quadrant', 'four quadrants', 'origin', 'ordered pairs', 'plot points', 'plotting',
      'graphing', 'linear equations', 'slope', 'grid', 'graph', 'blank graph', 'printable',
    ],
    Preview: CoordinateGridPreview,
  },
  {
    id: 'number-line',
    name: 'Number Line Generator',
    path: '/number-line',
    blurb: 'Number lines with any range, with inequalities, points and sequences on them.',
    description:
      'Make a printable number line for your class. Type the range in decimals, fractions or π, graph equations and inequalities with open and closed circles in color, and mark lettered points or the terms of a sequence, then copy it into a worksheet or test.',
    keywords: [
      'number line', 'inequality', 'inequalities', 'graph inequalities', 'compound inequality', 'compound inequalities',
      'and', 'or', 'open circle', 'closed circle', 'interval', 'interval notation', 'solution set', 'integers',
      'negative numbers', 'fractions', 'decimals', 'pi', 'radians', 'real numbers', 'one variable', 'blank number line',
      'points', 'labeled points', 'lettered points', 'plot points', 'sequence', 'sequences', 'terms', 'convergence', 'color',
      'printable',
    ],
    Preview: NumberLinePreview,
  },
  {
    id: 'triangle',
    name: 'Triangle Generator',
    path: '/triangle',
    blurb: 'Triangles drawn to scale from their sides and angles, labeled for students.',
    description:
      'Make a printable triangle drawn to scale for your class. Give any three sides and angles, label sides and angles with their measures or with x, add heights, right-angle squares and congruence marks, then copy it into a worksheet or test.',
    keywords: [
      'triangle', 'triangles', 'right triangle', 'acute', 'obtuse', 'scalene', 'isosceles', 'equilateral', 'angle',
      'angles', 'side lengths', 'to scale', 'scaled', 'diagram', 'geometry', 'trigonometry', 'trig', 'sohcahtoa', 'sine',
      'cosine', 'tangent', 'law of sines', 'law of cosines', 'pythagorean theorem', 'hypotenuse', 'special right triangles',
      '30-60-90', '45-45-90', 'similar triangles', 'congruent', 'tick marks', 'altitude', 'height', 'area', 'sss', 'sas',
      'asa', 'aas', 'ssa', 'ambiguous case', 'labels', 'printable',
    ],
    Preview: TrianglePreview,
  },
  {
    id: 'prism',
    name: 'Prism Generator',
    path: '/prism',
    blurb: 'Rectangular, triangular and other prisms drawn to scale, labeled for students.',
    description:
      'Make a printable prism drawn to scale for your class. Draw rectangular, triangular and regular prisms, standing or lying down, right or oblique, label lengths, widths and heights with their measures or with x, then copy it into a worksheet or test on volume and surface area.',
    keywords: [
      '3d', 'three dimensional', 'solid', 'solids', 'geometric solids', '3d shape', '3d figure', 'volume', 'surface area', 'prism', 'prisms', 'rectangular prism', 'right rectangular prism', 'cuboid', 'box', 'cube', 'triangular prism',
      'pentagonal prism', 'hexagonal prism', 'octagonal prism', 'oblique prism', 'lateral area', 'length', 'width', 'height',
      'apothem', 'hidden edges', 'dashed', 'hypotenuse', 'pythagorean theorem', 'to scale', 'diagram', 'geometry', 'labels', 'printable',
    ],
    Preview: PrismPreview,
  },
  {
    id: 'cylinder',
    name: 'Cylinder Generator',
    path: '/cylinder',
    blurb: 'Right and oblique cylinders drawn to scale, with the radius and height labeled.',
    description:
      'Make a printable cylinder drawn to scale for your class. Give its radius or diameter and height, make it right or oblique, label each with its measure or with x, then copy it into a worksheet or test on volume and surface area.',
    keywords: [
      '3d', 'three dimensional', 'solid', 'solids', 'geometric solids', '3d shape', '3d figure', 'volume', 'surface area', 'cylinder', 'cylinders', 'can', 'oblique cylinder', 'radius', 'diameter', 'height', 'lateral area', 'circle',
      'hidden edges', 'dashed', 'to scale', 'diagram', 'geometry', 'labels', 'printable',
    ],
    Preview: CylinderPreview,
  },
  {
    id: 'pyramid',
    name: 'Pyramid Generator',
    path: '/pyramid',
    blurb: 'Square, rectangular and other pyramids with their height and slant height labeled.',
    description:
      'Make a printable pyramid drawn to scale for your class. Draw square, rectangular, triangular and regular pyramids, right or oblique, label the height and slant height with their measures or with x, then copy it into a worksheet or test on volume and surface area.',
    keywords: [
      '3d', 'three dimensional', 'solid', 'solids', 'geometric solids', '3d shape', '3d figure', 'volume', 'surface area', 'pyramid', 'pyramids', 'square pyramid', 'rectangular pyramid', 'triangular pyramid', 'tetrahedron',
      'hexagonal pyramid', 'oblique pyramid', 'height', 'slant height', 'apothem', 'lateral area', 'hidden edges', 'dashed',
      'pythagorean theorem', 'to scale', 'diagram', 'geometry', 'labels', 'printable',
    ],
    Preview: PyramidPreview,
  },
  {
    id: 'cone',
    name: 'Cone Generator',
    path: '/cone',
    blurb: 'Right and oblique cones with their radius, height and slant height labeled.',
    description:
      'Make a printable cone drawn to scale for your class. Give its radius or diameter and its height or slant height, make it right or oblique, label each with its measure or with x, then copy it into a worksheet or test on volume and surface area.',
    keywords: [
      '3d', 'three dimensional', 'solid', 'solids', 'geometric solids', '3d shape', '3d figure', 'volume', 'surface area', 'cone', 'cones', 'oblique cone', 'radius', 'diameter', 'height', 'slant height', 'lateral area', 'circle',
      'hidden edges', 'dashed', 'pythagorean theorem', 'to scale', 'diagram', 'geometry', 'labels', 'printable',
    ],
    Preview: ConePreview,
  },
  {
    id: 'sphere',
    name: 'Sphere Generator',
    path: '/sphere',
    blurb: 'Spheres and hemispheres with their radius or diameter labeled.',
    description:
      'Make a printable sphere or hemisphere for your class. Give its radius or diameter, label it with its measure or with x, turn a hemisphere into a dome or a bowl, then copy it into a worksheet or test on volume and surface area.',
    keywords: [
      '3d', 'three dimensional', 'solid', 'solids', 'geometric solids', '3d shape', '3d figure', 'volume', 'surface area', 'sphere', 'spheres', 'ball', 'hemisphere', 'hemispheres', 'half sphere', 'dome', 'bowl', 'radius', 'diameter',
      'great circle', 'circle', 'hidden edges', 'dashed', 'diagram', 'geometry', 'labels', 'printable',
    ],
    Preview: SpherePreview,
  },
]

export const findGenerator = (path: string) => GENERATORS.find((g) => g.path === path)

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

/** Generators matching a search. Every word typed must start some word in the
 *  generator's name, blurb or keywords, so "quad" finds the Coordinate Grid. */
export function searchGenerators(query: string): Generator[] {
  const wanted = words(query)
  if (!wanted.length) return GENERATORS
  return GENERATORS.filter((g) => {
    const have = words([g.name, g.blurb, ...g.keywords].join(' '))
    return wanted.every((w) => have.some((h) => h.startsWith(w)))
  })
}
