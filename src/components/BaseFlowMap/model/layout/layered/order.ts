import type { LayeredGraph, OrderState } from '../../../types/internal/core/flowLayoutInternal.types'

const SWEEPS = 4
const TRANSPOSE_PASSES = 2

function positions(graph: LayeredGraph): number[] {
	const pos = new Array<number>(graph.vertices.length).fill(0)
	for (const layer of graph.layers) layer.forEach((vertex, index) => (pos[vertex] = index))
	return pos
}

function barycenter(neighbors: readonly number[], pos: readonly number[], fallback: number): number {
	if (neighbors.length === 0) return fallback
	let sum = 0
	for (const neighbor of neighbors) sum += pos[neighbor]
	return sum / neighbors.length
}

function sortLayer({ graph, pos }: OrderState, layer: number[], isDown: boolean): void {
	const links = isDown ? graph.up : graph.down
	const key = new Map(layer.map(vertex => [vertex, barycenter(links[vertex], pos, pos[vertex])]))
	const band = (vertex: number): number => graph.vertices[vertex].band
	layer.sort(
		(left, right) => band(left) - band(right) || (key.get(left) as number) - (key.get(right) as number) || pos[left] - pos[right],
	)
	layer.forEach((vertex, index) => (pos[vertex] = index))
}

function sweep(state: OrderState, isDown: boolean): void {
	const order = isDown ? state.graph.layers : [...state.graph.layers].reverse()
	for (const layer of order) sortLayer(state, layer, isDown)
}

function crossings(first: readonly number[], second: readonly number[], pos: readonly number[]): number {
	let count = 0
	for (const left of first) {
		for (const right of second) {
			if (pos[left] > pos[right]) count += 1
		}
	}
	return count
}

function pairCost({ graph, pos }: OrderState, left: number, right: number): number {
	return crossings(graph.up[left], graph.up[right], pos) + crossings(graph.down[left], graph.down[right], pos)
}

function transposeLayer(state: OrderState, layer: number[]): boolean {
	const { graph, pos } = state
	let isChanged = false
	for (let index = 0; index < layer.length - 1; index += 1) {
		const [left, right] = [layer[index], layer[index + 1]]
		if (graph.vertices[left].band !== graph.vertices[right].band) continue
		if (pairCost(state, right, left) >= pairCost(state, left, right)) continue
		;[layer[index], layer[index + 1]] = [right, left]
		;[pos[left], pos[right]] = [pos[right], pos[left]]
		isChanged = true
	}
	return isChanged
}

function adjoinPeers(graph: LayeredGraph): void {
	for (const [source, target] of graph.peers) {
		const layer = graph.layers[graph.vertices[source].layer]
		if (graph.vertices[source].band !== graph.vertices[target].band) continue
		layer.splice(layer.indexOf(target), 1)
		layer.splice(layer.indexOf(source) + 1, 0, target)
	}
}

export function orderLayers(graph: LayeredGraph): void {
	const state: OrderState = { graph, pos: positions(graph) }
	const { pos } = state
	for (const layer of graph.layers) layer.sort((left, right) => graph.vertices[left].band - graph.vertices[right].band || left - right)
	graph.layers.forEach(layer => layer.forEach((vertex, index) => (pos[vertex] = index)))
	for (let round = 0; round < SWEEPS; round += 1) sweep(state, round % 2 === 0)
	for (let pass = 0; pass < TRANSPOSE_PASSES; pass += 1) {
		const changed = graph.layers.map(layer => transposeLayer(state, layer))
		if (!changed.some(Boolean)) break
	}
	adjoinPeers(graph)
}
