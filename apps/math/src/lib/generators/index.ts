// Every generator on the site. The directory and its search, page titles
// and the sitemap all read this list, so adding a generator means adding its
// folder and one entry here.

import CoordinateGridPreview from './coordinate-grid/Preview.svelte'
import KitePreview from './kite/Preview.svelte'
import NumberLinePreview from './number-line/Preview.svelte'
import ParallelogramPreview from './parallelogram/Preview.svelte'
import RectanglePreview from './rectangle/Preview.svelte'
import TrapezoidPreview from './trapezoid/Preview.svelte'
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
    blurb: 'Number lines with any range, and inequalities graphed on them.',
    description:
      'Make a printable number line for your class. Type the range in decimals, fractions or π and graph an equation or inequality with open and closed circles, then copy it into a worksheet or test.',
    keywords: [
      'number line', 'inequality', 'inequalities', 'graph inequalities', 'compound inequality', 'compound inequalities',
      'and', 'or', 'open circle', 'closed circle', 'interval', 'interval notation', 'solution set', 'integers',
      'negative numbers', 'fractions', 'decimals', 'pi', 'radians', 'real numbers', 'one variable', 'blank number line',
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
    id: 'rectangle',
    name: 'Rectangle Generator',
    path: '/rectangle',
    blurb: 'Rectangles and squares drawn to scale, labeled for students.',
    description:
      'Make a printable rectangle or square drawn to scale for your class. Label its sides with their lengths or with x, add diagonals, congruence marks and right-angle squares, then copy it into a worksheet or test.',
    keywords: [
      'rectangle', 'rectangles', 'square', 'squares', 'quadrilateral', 'quadrilaterals', 'length', 'width', 'side lengths',
      'diagonal', 'diagonals', 'right angles', 'area', 'perimeter', 'to scale', 'diagram', 'geometry', 'congruent',
      'tick marks', 'shapes', 'labels', 'printable',
    ],
    Preview: RectanglePreview,
  },
  {
    id: 'parallelogram',
    name: 'Parallelogram Generator',
    path: '/parallelogram',
    blurb: 'Parallelograms and rhombi drawn to scale, with parallel arrows.',
    description:
      'Make a printable parallelogram or rhombus drawn to scale for your class. Give its sides and angle, label sides and angles with their measures or with x, add parallel arrows, congruence marks, heights and diagonals, then copy it into a worksheet or test.',
    keywords: [
      'parallelogram', 'parallelograms', 'rhombus', 'rhombi', 'rhombuses', 'diamond', 'quadrilateral', 'quadrilaterals',
      'parallel', 'parallel sides', 'parallel arrows', 'opposite sides', 'opposite angles', 'base', 'height', 'altitude',
      'diagonal', 'diagonals', 'area', 'perimeter', 'angles', 'side lengths', 'to scale', 'diagram', 'geometry',
      'congruent', 'tick marks', 'shapes', 'labels', 'printable',
    ],
    Preview: ParallelogramPreview,
  },
  {
    id: 'trapezoid',
    name: 'Trapezoid Generator',
    path: '/trapezoid',
    blurb: 'Trapezoids, including right and isosceles ones, drawn to scale and labeled.',
    description:
      'Make a printable trapezoid drawn to scale for your class: a right, isosceles or scalene trapezoid, from its bases and height. Label sides and angles with their measures or with x, add parallel arrows, congruence marks, heights and diagonals, then copy it into a worksheet or test.',
    keywords: [
      'trapezoid', 'trapezoids', 'trapezium', 'trapeziums', 'right trapezoid', 'isosceles trapezoid', 'scalene trapezoid',
      'irregular trapezoid', 'quadrilateral', 'quadrilaterals', 'bases', 'legs', 'parallel', 'parallel sides',
      'parallel arrows', 'height', 'altitude', 'diagonal', 'diagonals', 'area', 'perimeter', 'angles', 'side lengths',
      'to scale', 'diagram', 'geometry', 'congruent', 'tick marks', 'shapes', 'labels', 'printable',
    ],
    Preview: TrapezoidPreview,
  },
  {
    id: 'kite',
    name: 'Kite Generator',
    path: '/kite',
    blurb: 'Kites drawn to scale, with their equal sides marked and labeled.',
    description:
      'Make a printable kite drawn to scale for your class. Give its short and long sides and top angle, label sides and angles with their measures or with x, add diagonals and congruence marks, then copy it into a worksheet or test.',
    keywords: [
      'kite', 'kites', 'quadrilateral', 'quadrilaterals', 'diagonal', 'diagonals', 'perpendicular diagonals',
      'line of symmetry', 'symmetry', 'adjacent sides', 'area', 'perimeter', 'angles', 'side lengths', 'to scale',
      'diagram', 'geometry', 'congruent', 'tick marks', 'shapes', 'labels', 'printable',
    ],
    Preview: KitePreview,
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
