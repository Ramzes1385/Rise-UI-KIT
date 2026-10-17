import type { LayeredGraph, LayeredLink, LayeredVertex } from '../../../types/internal/core/flowLayoutInternal.types'

const DUMMY_CROSS = 8

function dummyOf(source: LayeredVertex, layer: number): LayeredVertex {
	return { id: '', isDummy: true, main: 0, cross: DUMMY_CROSS, band: source.band, layer, mainPos: 0, crossPos: 0 }
}

function connect(graph: LayeredGraph, from: number, to: number): void {
	graph.down[from].push(to)
	graph.up[to].push(from)
}

function addVertex(graph: LayeredGraph, vertex: LayeredVertex): number {
	const index = graph.vertices.push(vertex) - 1
	graph.up.push([])
	graph.down.push([])
	return index
}

function chain(graph: LayeredGraph, low: number, high: number): void {
	const { vertices } = graph
	let previous = low
	for (let layer = vertices[low].layer + 1; layer < vertices[high].layer; layer += 1) {
		const dummy = addVertex(graph, dummyOf(vertices[high], layer))
		connect(graph, previous, dummy)
		previous = dummy
	}
	connect(graph, previous, high)
}

export function buildLayeredGraph(real: LayeredVertex[], links: readonly LayeredLink[]): LayeredGraph {
	const graph: LayeredGraph = { vertices: [], layers: [], up: [], down: [], peers: [] }
	for (const vertex of real) addVertex(graph, vertex)
	for (const [source, target] of links) {
		const layerOfSource = graph.vertices[source].layer
		const layerOfTarget = graph.vertices[target].layer
		if (layerOfSource === layerOfTarget) {
			if (source !== target) graph.peers.push([source, target])
			continue
		}
		if (layerOfSource < layerOfTarget) chain(graph, source, target)
		else chain(graph, target, source)
	}
	graph.vertices.forEach((vertex, index) => {
		while (graph.layers.length <= vertex.layer) graph.layers.push([])
		graph.layers[vertex.layer].push(index)
	})
	return graph
}

export function wrapLayers(graph: LayeredGraph, wrap: number, tierLayers: ReadonlySet<number>): [number, number][] {
	const rows: number[][] = []
	const rowsOf: [number, number][] = []
	graph.layers.forEach((layer, index) => {
		const first = rows.length
		if (wrap <= 0 || !tierLayers.has(index) || layer.length <= wrap) rows.push(layer)
		else for (let from = 0; from < layer.length; from += wrap) rows.push(layer.slice(from, from + wrap))
		rowsOf.push([first, rows.length - 1])
	})
	graph.layers = rows
	rows.forEach((row, layer) => {
		for (const index of row) graph.vertices[index].layer = layer
	})
	return rowsOf
}
