// Every generator's figure, laid out from a page address, pinned as a
// snapshot: any change to what a link draws shows up here. Run
// `npx vitest run -u` after a change that is meant to move the drawing.

import { describe, expect, test } from 'vitest'
import { buildPlot } from './box-plot/boxplot.js'
import * as box from './box-plot/settings.js'
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
  `xFrom=-2pi&xTo=2pi&xStep=pi%2F2&yFrom=-3&yTo=3&${eq('y=tan(x)', 'y=2sin(x)|color=red', 'y=sin(x)/x|color=blue')}`,
  `xFrom=0%C2%B0&xTo=360%C2%B0&xStep=90%C2%B0&yFrom=-2&yTo=2&angle=degrees&${eq('y=sin(x)', 'y=cos(2x)|color=blue')}`,
  `xFrom=-2&xTo=8&yFrom=-4&yTo=6&${eq('y=ln(x)', 'y=log_2(x)|color=blue', 'y=e^x|color=red', 'y=|x-3|-2|color=green', 'y=sin')}`,
  `xFrom=-5&xTo=5&yFrom=-5&yTo=5&${eq('y=-x-1, x<0', 'y=x^2, 0≤x≤2|color=blue', 'y=4, x>2|color=red|arrows=right', 'x=-3, -4≤y<-1|color=green', 'y=x, -4≤x≤-2|ends=hidden|line=dashed')}`,
  `xFrom=-6&xTo=6&yFrom=-6&yTo=6&${eq('y=(x^2+1)/(x-1)|asym=shown', 'y=2^x-3|asym=shown|color=blue', 'y=ln(x+4)|asym=shown|color=green', 'y=1/x|color=red')}`,
  'xFrom=0&xTo=4&yFrom=0&yTo=3&minor=5',
  'minor=10',
  `xFrom=-5&xTo=5&yFrom=-5&yTo=5&labelSize=large&titleMode=text&title=Big&${eq('A(1, 2)')}`,
  'labelSize=small',
  'labelSize=huge',
  'xFrom=-2&xTo=2&yFrom=-2&yTo=2&minor=4',
  'minor=3',
  `xFrom=-5&xTo=5&yFrom=-5&yTo=5&${eq("A(1, 2), B'(-3, 4), (0, -1)", 'P(1/2, -2)|names=coords|color=blue')}`,
  `xFrom=0&xTo=2pi&xStep=pi%2F2&yFrom=-2&yTo=2&${eq('Q(pi/2, 1)|names=coords')}`,
  `xFrom=-5&xTo=5&yFrom=-5&yTo=5&${eq('y=(2x+1)/(3x^2-1)', 'y=(x^2-1)/(x-1)|color=blue', 'y=x^(1/3)|color=green', 'y=1/(x+3)^2|color=red')}`,
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
  `${eq('x<2|color=red', 'x>=2|color=blue', 'x>6|color=red', '-5, 0|color=green|point=cross')}`,
  `from=0&to=1&step=1%2F10&${eq('a_n=1/n|last=6')}`,
  `from=0&to=10&${eq('u_n=2n+1|first=0|last=8|color=purple|values=hidden')}`,
  `from=-3&to=3&${eq('A(-2.5), 1, C(1.25)', 'P(0.5)|point=cross|labels=coords|color=red', '-1.5|values=hidden')}`,
  `${eq('a_n=a_{n-1}+3', 'a_n=2k', '1/n|first=4|last=2')}`,
  'points=cross&eq=3&eq=x%3C1',
  `from=0&to=10&${eq('1/3, 1/2, 2/3, Q_1(4.5)')}`,
  `labelSize=large&from=0&to=2&step=1%2F4&${eq('x>3/4')}`,
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
  'labelSize=large',
  'labelSize=small&hB=1&hBLabel=measure&hBFoot=D',
  'AB=1&BC=1&CA=5',
  'A=abc',
  'A=20',
]

const data = (...rows: string[]) => rows.map((r) => `data=${encodeURIComponent(r)}`).join('&')

const BOX = [
  '',
  data('11, 14, 15, 18, 20, 21, 24, 27, 30, 35, 42'),
  data('4, 7, 9, 12, 20'),
  data('55, 60, 62, 70, 71, 75, 80|name=Period 1', '40, 58, 66, 69, 72, 90, 95|name=Period 2'),
  `outliers=1&${data('1, 10, 11, 12, 13, 14, 15, 40')}`,
  `minLabel=measure&q1Label=measure&medianLabel=measure&q3Label=text&q3Text=x&maxLabel=measure&${data('10, 11, 12, 13, 30')}`,
  `title=Test%20scores&titleMode=text&axisTitle=Score&axisTitleMode=text&startCap=none&endCap=circle&${data('70, 75, 80, 85, 90')}`,
  'titleMode=blank&axisTitleMode=blank',
  `from=0&to=1&step=1%2F4&${data('0.1, 0.3, 0.5, 0.6, 0.9')}`,
  `from=0&to=100&step=1&every=10&${data('12, 40, 55, 90')}`,
  `from=abc&step=-1&${data('1, 2, x', '3, 400')}`,
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

describe('box plot', () => {
  test.each(BOX)('%s', (q) => {
    const s = box.settingsFromParams(params(q))
    const { rows, problems } = box.readPlot(s)
    expect({ query: box.settingsToQuery(s), rows, problems, plot: buildPlot(s) }).toMatchSnapshot()
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
