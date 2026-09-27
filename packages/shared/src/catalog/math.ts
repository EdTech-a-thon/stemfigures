// Math Figures' generators. See ./index.ts.

import type { CatalogEntry } from './index'

export const MATH: CatalogEntry[] = [
  {
    id: 'coordinate-grid',
    site: 'math',
    alsoOn: ['physics'],
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
  },
  {
    id: 'number-line',
    site: 'math',
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
  },
  {
    id: 'triangle',
    site: 'math',
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
  },
]
