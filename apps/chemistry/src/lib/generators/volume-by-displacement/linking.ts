// Volume by Displacement's address parameters, for /linking and /llms.txt.

import { describeLinking } from '$lib/linking/define'
import { figureTextDocs, spanDoc } from '$lib/linking/common'
import { OBJECT_NAMES } from './objects'
import { DISPLACEMENT_SIZES, cylinderScale, displacementSettings } from './settings'

const places = DISPLACEMENT_SIZES.map((size) => {
  const d = cylinderScale(size).decimals
  return `${size} mL to ${d} decimal place${d === 1 ? '' : 's'}`
}).join(', ')

export const displacementLinking = describeLinking(displacementSettings, {
  id: 'volume-by-displacement',
  summary:
    'Two graduated cylinders side by side: before, with water at the before reading, and after, with the object in and water at the after reading. The object’s volume is after minus before.',
  notes: [
    `before and after are in mL, rounded to the cylinder’s estimated digit (${places}) and kept within its capacity.`,
    'after is always higher than before: an after reading that isn’t is raised to one step above before.',
    'marbles sets how many marbles only when object=marbles.',
  ],
  params: {
    size: { what: 'Both cylinders’ capacity, in mL.' },
    before: { what: 'The water level before the object goes in, in mL.' },
    after: { what: 'The water level with the object in, in mL.', values: 'Always above before' },
    tint: { what: 'The water’s color. Gray photocopies best.' },
    object: {
      what: 'The object dropped into the second cylinder.',
      values: Object.entries(OBJECT_NAMES).map(([id, name]) => `${id}: ${name.toLowerCase()}`).join('; '),
    },
    marbles: { what: 'How many marbles. Rounded to a whole number.', when: 'object=marbles' },
    view: { what: 'Whether a magnified circle of the scale is drawn beside each cylinder.', values: 'whole: cylinders only; both: cylinders and magnifiers' },
    span: spanDoc('view=both'),
    beforeCaption: { what: 'The caption under the first cylinder.' },
    afterCaption: { what: 'The caption under the second cylinder.' },
    ...figureTextDocs('Before: 4.00 mL · After: 6.00 mL · Object: 2.00 mL'),
  },
  examples: [
    { shows: 'A rock raising the water in a 100 mL cylinder from 52.0 to 67.5 mL (a 15.5 mL rock), with the answer key.', settings: { size: '100', before: 52, after: 67.5, object: 'rock', answerKey: true } },
    { shows: 'Three marbles in a 25 mL cylinder, 12.50 to 15.75 mL, with magnifiers.', settings: { size: '25', before: 12.5, after: 15.75, object: 'marbles', marbles: 3, view: 'both' } },
    { shows: 'A metal cylinder in a 50 mL cylinder, 20.0 to 27.0 mL, captioned “Initial” and “Final”.', settings: { size: '50', before: 20, after: 27, object: 'cylinder', beforeCaption: 'Initial', afterCaption: 'Final' } },
  ],
})
