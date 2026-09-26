# Math Figures

Math Figures (mathfigures.com) is a directory of generators that make clean,
printable math figures for teachers to paste into tests, worksheets and
slides. It is a teacher.dev project.

## Language

### The directory

**Figure**:
A finished math picture a teacher puts in front of students, such as a coordinate grid or a number line.
_Avoid_: Graphic, image, visual, resource

**Generator**:
A page that makes one kind of figure from a teacher's settings, named "<Figure> Generator".
_Avoid_: Maker, tool, builder, app

**Directory**:
The home page, which lists every generator with a live preview of its figure.
_Avoid_: Catalog, gallery, index

**Label size**:
How big a figure's text is compared to its lines: small, medium or large, one setting on every generator, set beside the export buttons. Medium is how figures have always looked; large keeps labels readable once a figure is shrunk to fit a worksheet.
_Avoid_: Font size, text size, zoom, scale

**Generator request**:
A teacher asking for a kind of figure that no generator makes yet.
_Avoid_: Feature request, suggestion

### Coordinate grids

**Coordinate Grid**:
A figure of square blocks with an x-axis and a y-axis, for plotting points and lines. Its generator is the Coordinate Grid Generator.
_Avoid_: Graph, graph paper, coordinate plane (fine as search words, not as the name)

**Chart title**:
The title across the top of a figure.
_Avoid_: Title (alone), heading

**Axis title**:
Text that runs along an axis to say what it measures, such as "Time (hours)". It can be written text or a blank line for students.
_Avoid_: Axis label, axis name

**Axis label**:
The short name at an axis's arrow tip, such as x or y.
_Avoid_: Axis title, variable

**End cap**:
How one end of an axis finishes: a triangle arrow, a line arrow, a circle or nothing.
_Avoid_: Arrow (alone), arrowhead, tip

**Preset**:
A named set of settings for one generator, saved by the teacher in their browser. None are built in.
_Avoid_: Template, favorite

**Range**:
The stretch of numbers an axis covers, set as From, To and Step (such as −2 to 5 by 1). Both the Coordinate Grid and the Number Line use it.
_Avoid_: Domain, interval, window, start and blocks

**Numbering**:
How the numbers under the ticks are written: decimals, fractions, multiples of π or degrees. It isn't a setting; it follows how the teacher typed the range, so a range typed with π is numbered in π and one typed with ° is numbered in degrees.
_Avoid_: Format, label style

**Minor gridline**:
A thin, faint, unnumbered line that splits each block of a coordinate grid into 2, 4 or 5 parts. A grid has none unless the teacher picks a number.
_Avoid_: Subdivision, fine grid, minor tick

**Angle unit**:
Whether a coordinate grid's trig functions read x in radians or degrees. It's one setting for the whole figure, radians unless the teacher picks degrees.
_Avoid_: Angle mode, trig mode

### Number lines

**Number Line**:
A figure of one horizontal axis with evenly spaced ticks, for placing numbers and graphing equations and inequalities in one variable. Its generator is the Number Line Generator.
_Avoid_: Line graph, ruler

**Equation**:
What the teacher types to graph, one per row. On a number line it's an inequality or equation in one letter, such as −2 < x ≤ 5, x < −1 or x ≥ 3, or x = 2, or a list of points, each one number, such as 3 or −1, 2.5, π/2; every row is drawn over the same line, and a number line with no equation is blank. On a coordinate grid it's a line or curve that can be written as y = …, such as y = 2x + 1, 2x + 3y = 6, x = 4 or y = x² − 4, or a list of points, such as (1, 2), (3, 4). Points aren't equations, but they're typed in the same rows and called the same thing. (Both generators' rows are `eq` in the page address; the number line's reading code still calls an equation `inequality`, and older number line links with `inequality=` still open.)
_Avoid_: Solution set, interval, expression

**Tick**:
A short mark across a number line at every step of its range. Numbered ticks are drawn longer than the ticks between them.
_Avoid_: Notch, hash mark, gridline

**Equation graph**:
The thick line, arrows and endpoints drawn over a number line to show which numbers make its equation true. Where it runs off an end it has its own arrow, just inside the number line's arrow.
_Avoid_: Shading, solution, plot

**Graphed line**:
A straight line or curve drawn across a coordinate grid from an equation, with an arrowhead where it leaves the grid. A curve is anything that can be solved for y, such as a parabola or 2^x; sideways curves, circles and shaded inequalities aren't drawn yet.
_Avoid_: Plot, function, curve

**Row style**:
How one equation is drawn, set from the button before it, which shows a miniature of how the row is drawn: a color, a line style (solid, dashed or dotted) and which ends have arrows (both, neither, left or right; for an up-and-down line, left means the bottom), whether endpoints show, and whether asymptotes show. Points take the color and a point mark: a dot, or a cross as French classrooms use.
_Avoid_: Format, appearance, theme

**Point mark**:
How points are drawn: a dot or a cross. On a coordinate grid it's part of each points row's row style; on a number line it's one setting for every point on the line. It never changes an endpoint, whose open or closed circle has a meaning.
_Avoid_: Marker, symbol, dot style

**Endpoint**:
Where an equation's graph or a graphed line stops at a number, drawn as an open circle (not included) or a closed circle (included). On a coordinate grid, a graphed line's endpoints are at the ends of its domain, and a row style can hide them so the line simply stops.
_Avoid_: Dot, point, boundary

**Domain**:
The stretch of x-values a graphed line is drawn over (y-values, for an up-and-down line), typed after its equation as an inequality, such as y = 3x, −5 ≤ x < 7. Using ≤ or < picks a closed or open endpoint. A piecewise function is several rows, each with its own domain. A graphed line with no domain runs across the whole grid. An end cut off by its domain inside the grid never has an arrowhead; an end whose domain runs past the grid's edge follows the row style's arrows.
_Avoid_: Restriction, bounds, interval, range (an axis's range is different)

**Hole**:
A single x-value where a graphed line is undefined but the curve continues on both sides, such as x = 1 in y = (x² − 1)/(x − 1). It's found automatically and drawn as an open circle.
_Avoid_: Gap, removable discontinuity (fine in teaching, not as the name), missing point

**Asymptote**:
A line that a graphed line approaches but never reaches: vertical, horizontal or slant. Where a graphed line meets a vertical asymptote, the curve breaks and each side runs to the grid's edge with an arrowhead. Asymptotes are found for the whole row and, when its row style shows them, drawn as thin dotted lines in the row's color, without their equations; they're hidden unless the teacher shows them.
_Avoid_: Discontinuity, break, limit line

**Point name**:
The letter written beside a point on a coordinate grid, typed in textbook notation such as A(1, 2), primes allowed (A′). A points row shows just the names, or the names with their coordinates.
_Avoid_: Point label, vertex name (that's a triangle's), tag

### Triangles

**Triangle**:
A figure of one triangle, drawn to scale from the measures the teacher gives and labeled for students. Its generator is the Triangle Generator.
_Avoid_: Shape, polygon, diagram, drawing

**Part**:
Any vertex, side, angle or extra line of a triangle: something that can carry a label or a marking.
_Avoid_: Element, component, piece

**Vertex name**:
The letter at a corner, such as A, B or C. Each can be renamed or left blank, and the triangle's measures are named after them (∠B, AB).
_Avoid_: Point, corner label

**Measure**:
A side's length or an angle's size, in degrees. A **given** measure is one the teacher types; any three that make a triangle are enough. A **solved** measure is worked out from the givens. Drawing to scale means proportional, not true size on paper.
_Avoid_: Value, dimension, size

**Part label**:
What's written at a part: nothing, its measure (such as 12 or 24°, with the figure's unit on lengths), or text the teacher types, such as x or 2y + 1. It replaces the text boxes teachers otherwise lay over a drawing.
_Avoid_: Text box, caption, annotation, label (alone; axes have their own labels)

**Unit**:
One optional unit for the whole triangle, such as cm or ft, added to every length shown as its measure.
_Avoid_: Scale

**Extra line**:
A line drawn onto a triangle that isn't one of its sides. For now the only one is a height: dropped from a vertex to the opposite side, which is extended when the height lands outside the triangle. The point where it lands can be given a name, such as D. It can be solid, dashed or dotted, like a graphed line.
_Avoid_: Auxiliary line, segment, construction

**Marking**:
A standard geometry symbol on a part: congruence ticks on sides, congruence arcs on angles, or a right-angle square. The teacher sets congruence marks by hand, never from equal measures, so they don't give answers away. An angle gets an arc only when it has a label or congruence arcs. A right-angle square appears on its own at every 90° angle, including where a height meets a side, and can be turned off.
_Avoid_: Symbol, annotation, tick (a number line's tick is different)

**Base side**:
The side that sits flat along the bottom before any flip or rotation, AB unless the teacher picks another.
_Avoid_: Bottom, base (alone; a height's base is the side it meets)

**Other triangle**:
The second triangle two sides and a non-included angle can make (the ambiguous case). The generator draws the one whose unknown angle is acute unless the teacher switches to the other.
_Avoid_: Second solution, alternate
