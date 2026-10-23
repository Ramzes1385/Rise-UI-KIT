import type {
	CrossSettings,
	LayeredGraph,
	LayeredVertex,
	LayerSpan,
	StackPlan,
} from '../../../types/internal/core/layout/flowLayoutInternal.types'

const ITERATIONS = 4
const BAND_PAD = 20
const DUMMY_GAP = 10
const EMPTY_BAND = 48

function gapBetween(left: LayeredVertex, right: LayeredVertex, nodeGap: number): number {
	if (left.band !== right.band) return 0
	return left.isDummy || right.isDummy ? DUMMY_GAP : nodeGap
}

function layerExtent(graph: LayeredGraph, layer: readonly number[], nodeGap: number): Map<number, number> {
	const extent = new Map<number, number>()
	layer.forEach((index, order) => {
		const vertex = graph.vertices[index]
		const previous = order > 0 ? graph.vertices[layer[order - 1]] : undefined
		const gap = previous && previous.band === vertex.band ? gapBetween(previous, vertex, nodeGap) : 0
		extent.set(vertex.band, (extent.get(vertex.band) ?? 0) + vertex.cross + gap)
	})
	return extent
}

function bandStarts(graph: LayeredGraph, settings: CrossSettings): number[] {
	const sizes = new Array<number>(Math.max(settings.bands, 1)).fill(0)
	for (const layer of graph.layers) {
		for (const [band, size] of layerExtent(graph, layer, settings.nodeGap)) sizes[band] = Math.max(sizes[band], size)
	}
	const starts: number[] = []
	let offset = 0
	for (const size of sizes) {
		starts.push(offset)
		offset += size + BAND_PAD * 2
	}
	return starts
}

function stackLayer(graph: LayeredGraph, layer: readonly number[], { starts, nodeGap }: StackPlan): void {
	const cursor = new Map<number, number>()
	layer.forEach((index, order) => {
		const vertex = graph.vertices[index]
		const previous = order > 0 ? graph.vertices[layer[order - 1]] : undefined
		const gap = previous ? gapBetween(previous, vertex, nodeGap) : 0
		const next = cursor.get(vertex.band) ?? starts[vertex.band] + BAND_PAD
		vertex.crossPos = next + (cursor.has(vertex.band) ? gap : 0)
		cursor.set(vertex.band, vertex.crossPos + vertex.cross)
	})
}

function median(values: number[]): number {
	values.sort((left, right) => left - right)
	return values[values.length >> 1]
}

function target(graph: LayeredGraph, index: number): number | null {
	const neighbors = [...graph.up[index], ...graph.down[index]]
	if (neighbors.length === 0) return null
	const centers = neighbors.map(neighbor => graph.vertices[neighbor].crossPos + graph.vertices[neighbor].cross / 2)
	return median(centers) - graph.vertices[index].cross / 2
}

function separate(graph: LayeredGraph, layer: readonly number[], nodeGap: number): void {
	for (let order = 1; order < layer.length; order += 1) {
		const previous = graph.vertices[layer[order - 1]]
		const vertex = graph.vertices[layer[order]]
		const minimum = previous.crossPos + previous.cross + gapBetween(previous, vertex, nodeGap)
		if (vertex.crossPos < minimum) vertex.crossPos = minimum
	}
}

function align(graph: LayeredGraph, layer: readonly number[], nodeGap: number): void {
	for (const index of layer) {
		const wanted = target(graph, index)
		const vertex = graph.vertices[index]
		if (wanted !== null) vertex.crossPos = (vertex.crossPos + wanted) / 2
	}
	separate(graph, layer, nodeGap)
}

function clampToBands(graph: LayeredGraph, starts: readonly number[]): void {
	for (const vertex of graph.vertices) {
		const low = starts[vertex.band] + BAND_PAD
		if (vertex.crossPos < low) vertex.crossPos = low
	}
}

function packBands(graph: LayeredGraph, bands: number): void {
	const per = Array.from({ length: Math.max(bands, 1) }, () => [] as LayeredVertex[])
	for (const vertex of graph.vertices) per[vertex.band].push(vertex)
	let edge = 0
	per.forEach(members => {
		if (members.length === 0) {
			edge += EMPTY_BAND
			return
		}
		const min = Math.min(...members.map(vertex => vertex.crossPos))
		const shift = Math.max(0, edge + BAND_PAD - min)
		for (const vertex of members) vertex.crossPos += shift
		edge = Math.max(...members.map(vertex => vertex.crossPos + vertex.cross)) + BAND_PAD
	})
}

export function assignCross(graph: LayeredGraph, settings: CrossSettings): void {
	const starts = bandStarts(graph, settings)
	for (const layer of graph.layers) stackLayer(graph, layer, { starts, nodeGap: settings.nodeGap })
	for (let round = 0; round < ITERATIONS; round += 1) {
		const order = round % 2 === 0 ? graph.layers : [...graph.layers].reverse()
		for (const layer of order) align(graph, layer, settings.nodeGap)
		clampToBands(graph, starts)
	}
	for (const layer of graph.layers) separate(graph, layer, settings.nodeGap)
	packBands(graph, settings.bands)
}

export function assignMain(graph: LayeredGraph, rankGap: number): { total: number; spans: LayerSpan[] } {
	let offset = 0
	const spans: LayerSpan[] = []
	for (const layer of graph.layers) {
		const size = Math.max(0, ...layer.map(index => graph.vertices[index].main))
		for (const index of layer) {
			const vertex = graph.vertices[index]
			vertex.mainPos = offset + (size - vertex.main) / 2
		}
		spans.push({ start: offset, size })
		offset += size + (size === 0 ? rankGap / 3 : rankGap)
	}
	return { total: Math.max(0, offset - rankGap), spans }
}
