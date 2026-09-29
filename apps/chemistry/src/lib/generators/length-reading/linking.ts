// Length Reading's address parameters, for /linking and /llms.txt.

import { describeLinking } from '$lib/linking/define'
import { figureTextDocs, spanDoc } from '$lib/linking/common'
import { OBJECT_NAMES } from '../volume-by-displacement/objects'
import { METRIC_MARK_NAMES, READ_NAMES } from './ruler'
import { lengthSettings } from './settings'

export const lengthLinking = describeLinking(lengthSettings, {
  id: 'length-reading',
  summary:
    'A metric (cm) or imperial (inch) ruler with an object lying along its top edge. length is the object’s length and start is where its left end sits, both in the ruler’s unit; start=0 lines it up with the 0 mark.',
  notes: [
    'cm, metricMarks and read apply only when system=metric; inches and imperialMarks only when system=imperial.',
    '5 cm and 10 cm marks (metricMarks=five or ten) are only for the 50 and 100 cm rulers; on a shorter ruler they become 1 cm marks.',
    'length and start are rounded to what the ruler reads: with read=estimate, one digit past the smallest mark (1 mm marks to 0.01 cm; 1 cm and 0.5 cm marks to 0.1 cm; 5 and 10 cm marks to 1 cm); with read=mark, to the nearest mark. Imperial lengths always land on a mark: write them as decimals (3.375 for 3 3/8 in).',
    'length is at least 0.5 cm (or 0.25 in, or one reading step if bigger) and start is kept so the object stays on the ruler.',
  ],
  params: {
    system: { what: 'Which kind of ruler.', values: 'metric: centimeters; imperial: inches' },
    cm: { what: 'The metric ruler’s length in cm (100 is a meter stick).', when: 'system=metric' },
    inches: { what: 'The imperial ruler’s length in inches.', when: 'system=imperial' },
    metricMarks: {
      what: 'The metric ruler’s smallest marks.',
      when: 'system=metric',
      values: Object.entries(METRIC_MARK_NAMES).map(([id, name]) => `${id}: ${name}`).join('; '),
    },
    imperialMarks: { what: 'Marks per inch on the imperial ruler (16 is sixteenths).', when: 'system=imperial' },
    read: {
      what: 'How far a metric reading goes.',
      when: 'system=metric',
      values: Object.entries(READ_NAMES).map(([id, name]) => `${id}: ${name.toLowerCase()}`).join('; '),
    },
    object: {
      what: 'The object lying along the ruler.',
      values: Object.entries(OBJECT_NAMES).map(([id, name]) => `${id}: ${name.toLowerCase()}`).join('; '),
    },
    marbles: { what: 'How many marbles, in a row. Rounded to a whole number.', when: 'object=marbles' },
    guides: { what: 'Dashed lines from the object’s ends down to the ruler, for round objects whose ends are above where they touch it.' },
    length: { what: 'The object’s length, in cm or inches.', values: 'Rounded to what the ruler reads (see notes)' },
    start: { what: 'Where the object’s left end sits on the ruler, in cm or inches; 0 lines it up with the 0 mark.' },
    view: { what: 'Whether magnified circles are drawn at the object’s ends: one on its right end, and one on its left end when that isn’t at 0.', values: 'both: ruler and magnifiers; whole: ruler only' },
    span: spanDoc('view=both'),
    ...figureTextDocs('Length: 4.37 cm'),
  },
  examples: [
    { shows: 'A metal cylinder 6.42 cm long on a 15 cm ruler marked in mm, starting at 0, with the answer key.', settings: { length: 6.42, answerKey: true } },
    { shows: 'A rock from 2.3 cm to 8.1 cm on a 30 cm ruler marked every 1 cm, so students subtract the ends.', settings: { cm: '30', metricMarks: 'cm', object: 'rock', length: 5.8, start: 2.3, guides: true } },
    { shows: 'A cube 2 3/8 in long on a 6 in ruler marked in eighths, with no magnifiers.', settings: { system: 'imperial', imperialMarks: '8', object: 'cube', length: 2.375, view: 'whole' } },
  ],
})
