// Every generator's figure, laid out from a page address, pinned as a
// snapshot: any change to what a link draws shows up here. Run
// `npx vitest run -u` after a change that is meant to move the drawing.

import { describe, expect, test } from 'vitest'
import { buildGraph } from './coordinate-grid/graph.js'
import * as grid from './coordinate-grid/settings.js'
import { buildLine } from './number-line/numberline.js'
import * as line from './number-line/settings.js'
import { buildTriangle } from './triangle/layout.js'
import * as triangle from './triangle/settings.js'

const eq = (...rows: string[]) => rows.map((r) => `eq=${encodeURIComponent(r)}`).join('&')

const GRID = [
  '',
  'xFrom=-6&xTo=6&yFrom=-6&yTo=6&xEvery=2&yEvery=2',
  `xFrom=-10&xTo=10&yFrom=-10&yTo=10&${eq('y=2x+1', '2x+3y=6|color=red|line=dashed', 'x=4|arrows=none', 'y=-3|arrows=left|line=dotted')}`,
  `xFrom=-5&xTo=5&yFrom=-5&yTo=5&${eq('y=x^2-4|color=blue', 'y=2^x|arrows=right', 'y=sqrt(x)|color=green', 'y=1/x|color=purple')}`,
  `xFrom=-5&xTo=5&yFrom=-5&yTo=5&${eq('(1, 2), (3, 4)', '(-2, -3)|point=cross|color=orange', '(9, 9)')}`,
  `xFrom=0&xTo=2pi&xStep=pi%2F4&yFrom=-2&yTo=2&yStep=1%2F2&${eq('y=sin(x)')}`,
  'xFrom=0&xTo=1&xStep=1%2F4&yFrom=-1&yTo=1&yStep=0.25',
  'title=Distance%20over%20time&titleMode=text&xTitle=Time%20(hours)&xTitleMode=text&yTitle=Distance%20(km)&yTitleMode=text',
  'titleMode=blank&xTitleMode=blank&yTitleMode=blank&xLabelMode=none&yLabel=distance',
  'xStartCap=circle&xEndCap=line&yStartCap=none&yEndCap=triangle&xEvery=5&yEvery=0',
  'xFrom=-3&xTo=4.5&yFrom=2&yTo=7&yStep=0.5&xEvery=10',
  'xStart=-2&xBlocks=7&yStart=-1&yBlocks=14&yStep=0.5&arrows=0',
  'xFrom=abc&xTo=1&xStep=0&yFrom=5&yTo=1',
  'xFrom=0&xTo=100&xStep=1',
  `${eq('y<2x', 'y=z+1', 'x^2+y^2=4', '0=0', '1=2', 'x^2=4', 'hello')}`,
]

const LINE = [
  '',
  'from=-5&to=5&eq=-2%20%3C%20x%20%3C%3D%203',
  `${eq('x<-1 or x>=3', 'x!=2', 'x=4', 'all real numbers', 'no solution')}`,
  `from=0&to=2pi&step=pi%2F4&${eq('pi/2<x<=3pi/2')}`,
  `from=0&to=2&step=1%2F4&every=2&${eq('x>3/4')}`,
  `from=-3&to=3&points=cross&${eq('-1, 2.5', '0', '1/3')}`,
  `${eq('3', '-1, 2.5, pi/2')}`,
  'every=5&from=-20&to=20',
  'every=0',
  'from=x&to=-20&step=-1',
  'from=0&to=1000&step=1',
  `${eq('x<20', 'y>2 and x<3', '(1, 2)', 'x<y', 'x+')}`,
  'inequality=x%3E%3D2',
]

const TRIANGLE = [
  '',
  'A=60&B=60&C=60&AB=5&ALabel=measure&BLabel=measure&CLabel=measure&ABTicks=1&BCTicks=1&CATicks=1',
  'AB=3&BC=4&CA=5&unit=cm&round=2',
  'A=30&BC=4&CA=6&other=1',
  'A=30&BC=4&CA=6',
  'A=110&AB=7&CA=5&hB=1&hBLabel=measure&hBFoot=D&hC=1&hCStyle=dotted',
  'A=40&B=70&C=&AB=&BCLabel=text&BCText=2y%2B1&hA=1&hAStyle=solid&hALabel=text&hAText=h',
  'nameA=P&nameB=Q&nameC=R&base=BC&flip=1&rotate=45&AArcs=2&BArcs=3&square=0',
  'moved=AB%3A4%2C-6%3BvC%3A0%2C3&rotate=-90',
  'AB=3sqrt(2)&BC=5%2F2&CA=3&ABLabel=measure&BCLabel=measure&round=0',
  'A=100&B=100',
  'AB=1&BC=1&CA=5',
  'A=abc',
  'A=20',
]

const params = (q: string) => new URLSearchParams(q)

describe('coordinate grid', () => {
  test.each(GRID)('%s', (q) => {
    const s = grid.settingsFromParams(params(q))
    expect({ query: grid.settingsToQuery(s), problems: grid.readAxes(s).problems, graph: buildGraph(s) }).toMatchSnapshot()
  })
})

describe('number line', () => {
  test.each(LINE)('%s', (q) => {
    const s = line.settingsFromParams(params(q))
    const { rows } = line.readLine(s)
    expect({ query: line.settingsToQuery(s), rows, line: buildLine(s) }).toMatchSnapshot()
  })
})

describe('triangle', () => {
  test.each(TRIANGLE)('%s', (q) => {
    const s = triangle.settingsFromParams(params(q))
    const read = triangle.readTriangle(s)
    const figure = read.triangle ? buildTriangle(s, read.triangle, read.given) : null
    expect({ query: triangle.settingsToQuery(s), read, figure }).toMatchSnapshot()
  })
})
