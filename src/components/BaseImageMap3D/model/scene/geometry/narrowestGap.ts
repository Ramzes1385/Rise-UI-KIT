import type { Vector2 } from 'three'
import type { PointTree } from '../../../types/internal/imageMap3dInternal.types'

const LEAF_SIZE = 4
const MIN_EDGE = 1e-6
const PROJECTION_SLACK = 1e-9
const MARGIN = 1e-7

export function ringEdges(rings: Vector2[][]): Array<[Vector2, Vector2]> {
	return rings.flatMap(ring =>
		ring
			.map((point, index): [Vector2, Vector2] => [point, ring[(index + 1) % ring.length]])
			.filter(([start, end]) => start.distanceTo(end) > MIN_EDGE),
	)
}

function pointBounds(coords: Float64Array, order: Uint32Array): number[] {
	const box = [Infinity, Infinity, -Infinity, -Infinity]
	for (const point of order) {
		const [x, y] = [coords[point * 2], coords[point * 2 + 1]]
		box[0] = Math.min(box[0], x)
		box[1] = Math.min(box[1], y)
		box[2] = Math.max(box[2], x)
		box[3] = Math.max(box[3], y)
	}
	return box
}

function sortAlongLongerSide(coords: Float64Array, order: Uint32Array, box: number[]): void {
	const axis = box[2] - box[0] >= box[3] - box[1] ? 0 : 1
	order.sort((first, second) => coords[first * 2 + axis] - coords[second * 2 + axis])
}

function addNode(tree: PointTree, order: Uint32Array, start: number): number {
	const id = tree.kids.length / 2
	const box = pointBounds(tree.coords, order)
	tree.box.push(...box)
	tree.span.push(start, start + order.length)
	tree.kids.push(-1, -1)
	if (order.length <= LEAF_SIZE) return id
	sortAlongLongerSide(tree.coords, order, box)
	const middle = order.length >> 1
	tree.kids[id * 2] = addNode(tree, order.subarray(0, middle), start)
	tree.kids[id * 2 + 1] = addNode(tree, order.subarray(middle), start + middle)
	return id
}

function buildPointTree(points: Vector2[]): PointTree {
	const coords = Float64Array.from(points.flatMap(point => [point.x, point.y]))
	const order = Uint32Array.from(points.keys())
	const tree: PointTree = { coords, order, box: [], kids: [], span: [] }
	addNode(tree, order, 0)
	return tree
}

function stripOf([start, end]: [Vector2, Vector2], limit: number): number[] {
	const length = start.distanceTo(end)
	return [start.x, start.y, (end.x - start.x) / length, (end.y - start.y) / length, length, limit, end.x, end.y]
}

function span(low: number, high: number, factor: number): [number, number] {
	return factor >= 0 ? [factor * low, factor * high] : [factor * high, factor * low]
}

function touchesStrip(box: number[], id: number, strip: number[]): boolean {
	const [ax, ay, ux, uy, length, limit] = strip
	const [x0, y0, x1, y1] = [box[id * 4] - ax, box[id * 4 + 1] - ay, box[id * 4 + 2] - ax, box[id * 4 + 3] - ay]
	const [alongX, alongY, acrossX, acrossY] = [span(x0, x1, ux), span(y0, y1, uy), span(y0, y1, ux), span(x0, x1, -uy)]
	const reach = limit + MARGIN
	const half = length / 2 + MARGIN
	const [spreadX, spreadY] = [Math.abs(ux) * half + Math.abs(uy) * reach, Math.abs(uy) * half + Math.abs(ux) * reach]
	const [centreX, centreY] = [ux * (length / 2), uy * (length / 2)]
	return !(
		alongX[1] + alongY[1] < -MARGIN ||
		alongX[0] + alongY[0] > length + MARGIN ||
		acrossX[1] + acrossY[1] < -reach ||
		acrossX[0] + acrossY[0] > reach ||
		x1 < centreX - spreadX ||
		x0 > centreX + spreadX ||
		y1 < centreY - spreadY ||
		y0 > centreY + spreadY
	)
}

function isNearPoint(first: [number, number], second: [number, number]): boolean {
	return Math.sqrt((first[0] - second[0]) ** 2 + (first[1] - second[1]) ** 2) <= MIN_EDGE
}

function pointGap(strip: number[], x: number, y: number): number {
	const [ax, ay, , , , , bx, by] = strip
	if (isNearPoint([x, y], [ax, ay]) || isNearPoint([x, y], [bx, by])) return Infinity
	const [dx, dy] = [bx - ax, by - ay]
	const t = ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)
	return t < -PROJECTION_SLACK || t > 1 + PROJECTION_SLACK ? Infinity : Math.hypot(x - ax - t * dx, y - ay - t * dy)
}

function leafGap(tree: PointTree, id: number, strip: number[]): number {
	let best = strip[5]
	for (let at = tree.span[id * 2]; at < tree.span[id * 2 + 1]; at += 1) {
		const point = tree.order[at]
		best = Math.min(best, pointGap(strip, tree.coords[point * 2], tree.coords[point * 2 + 1]))
	}
	return best
}

function stripGap(tree: PointTree, edge: [Vector2, Vector2], cap: number): number {
	const strip = stripOf(edge, cap)
	const stack = [0]
	while (stack.length) {
		const id = stack.pop() as number
		if (!touchesStrip(tree.box, id, strip)) continue
		if (tree.kids[id * 2] < 0) strip[5] = leafGap(tree, id, strip)
		else stack.push(tree.kids[id * 2], tree.kids[id * 2 + 1])
	}
	return strip[5]
}

export function narrowestGap(edges: Array<[Vector2, Vector2]>, cap: number): number {
	if (!edges.length) return cap
	const tree = buildPointTree(edges.map(([start]) => start))
	return edges.reduce((best, edge) => Math.min(best, stripGap(tree, edge, best)), cap)
}
