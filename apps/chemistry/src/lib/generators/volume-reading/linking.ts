// Volume Reading's address parameters, for /linking and /llms.txt.

import { describeLinking } from '$lib/linking/define'
import { MAGNIFIER_VIEW_WORDS, figureTextDocs, spanDoc } from '$lib/linking/common'
import { BEAKER_SIZES, CYLINDER_SIZES, volumeScale, type VolumeInstrument } from './scale'
import { volumeSettings } from './settings'

const scaleWords = (choice: Omit<VolumeInstrument, 'beaker' | 'size'> & Partial<VolumeInstrument>) => {
  const scale = volumeScale({ size: '100', beaker: 'medium', ...choice })
  const places = scale.decimals === 0 ? 'whole mL' : `${scale.decimals} decimal place${scale.decimals === 1 ? '' : 's'}`
  return `${scale.lowest ? `${scale.lowest}–` : '0–'}${scale.capacity} mL to ${places}`
}

const readingRanges = [
  ...CYLINDER_SIZES.map((size) => `cylinder ${size}: ${scaleWords({ instrument: 'cylinder', size })}`),
  `buret: ${scaleWords({ instrument: 'buret' })}`,
  ...BEAKER_SIZES.map((beaker) => `beaker ${beaker}: ${scaleWords({ instrument: 'beaker', beaker })}`),
].join('; ')

export const volumeLinking = describeLinking(volumeSettings, {
  id: 'volume-reading',
  summary:
    'Pick the instrument with instrument (and its size with size or beaker), and the volume it shows with reading, in mL. The reading is rounded to one digit past the smallest mark and kept on the scale.',
  notes: [
    'size applies only to the graduated cylinder and beaker only to the beaker; a buret is always 50 mL and reads from 0 at the top.',
    `reading is rounded and clamped to the chosen instrument: ${readingRanges}.`,
    'The magnifier is set with view for a cylinder or buret and with beakerView for a beaker (off by default, since beaker marks are coarse).',
  ],
  params: {
    instrument: { what: 'The volume instrument drawn.', values: 'cylinder: graduated cylinder; buret: 50 mL buret; beaker: beaker' },
    size: { what: 'The graduated cylinder’s capacity in mL.', when: 'instrument=cylinder' },
    beaker: { what: 'The beaker’s size.', when: 'instrument=beaker', values: 'small 50 mL, medium 250 mL, large 600 mL' },
    reading: { what: 'The volume the liquid shows, in mL, read at the bottom of the meniscus.', values: 'Rounded and kept within the instrument’s scale (see notes)' },
    view: { what: 'What the figure shows for a cylinder or buret.', when: 'instrument is cylinder or buret', values: MAGNIFIER_VIEW_WORDS },
    beakerView: { what: 'What the figure shows for a beaker.', when: 'instrument=beaker', values: MAGNIFIER_VIEW_WORDS },
    span: spanDoc(),
    tint: { what: 'The liquid’s color. Gray photocopies best.' },
    ...figureTextDocs('Reading: 43.6 mL'),
  },
  examples: [
    { shows: 'A 50 mL buret reading 23.47 mL, with a magnifier and the answer key.', settings: { instrument: 'buret', reading: 23.47, answerKey: true } },
    { shows: 'A 10 mL graduated cylinder reading 6.54 mL, with no magnifier.', settings: { instrument: 'cylinder', size: '10', reading: 6.54, view: 'whole' } },
    { shows: 'A 250 mL (medium) beaker of blue liquid at 175 mL, titled “Read the volume”.', settings: { instrument: 'beaker', beaker: 'medium', reading: 175, tint: 'blue', titleMode: 'text', title: 'Read the volume' } },
  ],
})
