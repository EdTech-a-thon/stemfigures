// Physics Figures' generators. See ./index.ts.

import type { CatalogEntry } from './index'

export const PHYSICS: CatalogEntry[] = [
  {
    id: 'free-body-diagram',
    site: 'physics',
    name: 'Free Body Diagram Generator',
    path: '/free-body-diagram',
    blurb: 'A dot or block with every force on it, and nothing else.',
    description:
      'Make a printable free body diagram for your class: a dot or block with up to eight forces at any angle, with equal forces drawn equal, angles and components marked, and every label written or left blank, then copy it into a worksheet or test.',
    keywords: [
      'free body diagram', 'fbd', 'force diagram', 'forces', 'force', 'gravity', 'weight', 'normal force', 'friction',
      'tension', 'applied force', 'spring', 'air resistance', 'drag', 'net force', 'equilibrium', 'balanced',
      'unbalanced', 'components', 'newton', "newton's laws", 'dot', 'particle', 'mechanics', 'printable',
    ],
  },
  {
    id: 'vector-diagram',
    site: 'physics',
    alsoOn: ['math'],
    name: 'Vector Diagram Generator',
    path: '/vector-diagram',
    blurb: 'Up to three vectors head to tail on a grid, with their resultant.',
    description:
      'Make a printable vector diagram for your class: up to three vectors drawn to scale head to tail, on a grid or not, with the resultant, angles and components each drawn, dashed or left off for students, then copy it into a worksheet or test.',
    keywords: [
      'vector', 'vectors', 'vector diagram', 'vector addition', 'adding vectors', 'head to tail', 'tip to tail',
      'resultant', 'sum', 'components', 'resolve', 'resolving', 'x component', 'y component', 'magnitude', 'direction',
      'displacement', 'velocity', 'force', 'net force', 'grid', 'graph paper', 'axes', 'scale drawing', 'trigonometry',
      'mechanics', 'printable',
    ],
  },
  {
    id: 'inclined-plane',
    site: 'physics',
    name: 'Inclined Plane Generator',
    path: '/inclined-plane',
    blurb: 'A block, ball or cart on a ramp, with its angle and forces.',
    description:
      'Make a printable inclined plane figure for your class: a block, ball or cart on a ramp at any angle, with the angle, length and height labeled or left blank, then copy it into a worksheet or test.',
    keywords: [
      'incline', 'inclined plane', 'ramp', 'slope', 'wedge', 'block', 'ball', 'cart', 'angle', 'theta', 'friction',
      'rough', 'smooth', 'free body diagram', 'fbd', 'forces', 'normal force', 'gravity', 'newton', "newton's laws", 'sliding',
      'rolling', 'mechanics', 'printable',
    ],
  },
  {
    id: 'pulley',
    site: 'physics',
    name: 'Pulley Generator',
    path: '/pulley',
    blurb: 'Objects on strings over pulleys, from an Atwood machine up.',
    description:
      'Make a printable pulley figure for your class: an Atwood machine, a block on a table or ramp tied over a pulley to a hanging mass, or a block and tackle, with the masses labeled or left blank, then copy it into a worksheet or test.',
    keywords: [
      'pulley', 'pulleys', 'atwood', 'atwood machine', 'string', 'rope', 'tension', 'hanging mass', 'block', 'table',
      'ramp', 'block and tackle', 'mechanical advantage', 'strands', 'free body diagram', 'fbd', 'forces', 'newton',
      "newton's laws", 'mechanics', 'printable',
    ],
  },
  {
    id: 'projectile-motion',
    site: 'physics',
    name: 'Projectile Motion Generator',
    path: '/projectile-motion',
    blurb: 'A ball launched from the ground or a cliff, with its path.',
    description:
      'Make a printable projectile motion figure for your class: a ball launched at any angle from level ground or off a cliff, with its path, launch velocity and components, maximum height and range labeled or left blank, then copy it into a worksheet or test.',
    keywords: [
      'projectile', 'projectile motion', 'trajectory', 'parabola', 'path', 'launch', 'launch angle', 'thrown', 'kicked',
      'cannon', 'cliff', 'horizontal launch', 'range', 'maximum height', 'time of flight', 'velocity', 'components',
      'gravity', 'free fall', 'kinematics', '2d motion', 'two dimensional motion', 'mechanics', 'printable',
    ],
  },
]
