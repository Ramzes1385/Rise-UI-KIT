import type { CycleWalk, LayeredLink, RankAdjacency, RankInput } from '../../../types/internal/core/flowLayoutInternal.types'

function buildAdjacency({ count, links }: RankInput): RankAdjacency {
	const out: number[][] = Array.from({ length: count }, () => [])
	const degree = new Array<number>(count).fill(0)
	for (const [source, target] of links) {
		out[source].push(target)
		degree[target] += 1
	}
	return { out, degree }
}

function longestPath(input: RankInput, { out, degree }: RankAdjacency): number[] {
	const ranks = input.fixed.map(layer => layer ?? 0)
	const queue: number[] = []
	const left = [...degree]
	for (let index = 0; index < input.count; index += 1) {
		if (left[index] === 0) queue.push(index)
	}
	for (let head = 0; head < queue.length; head += 1) {
		const vertex = queue[head]
		for (const target of out[vertex]) {
			if (input.fixed[target] === undefined) ranks[target] = Math.max(ranks[target], ranks[vertex] + 1)
			left[target] -= 1
			if (left[target] === 0) queue.push(target)
		}
	}
	return ranks
}

function pullSources(input: RankInput, { out, degree }: RankAdjacency, ranks: number[]): void {
	for (let index = 0; index < input.count; index += 1) {
		if (degree[index] !== 0 || input.fixed[index] !== undefined || out[index].length === 0) continue
		const nearest = Math.min(...out[index].map(target => ranks[target]))
		ranks[index] = Math.max(ranks[index], nearest - 1)
	}
}

export function assignRanks(input: RankInput): number[] {
	const adjacency = buildAdjacency(input)
	const ranks = longestPath(input, adjacency)
	pullSources(input, adjacency, ranks)
	return ranks
}

function bucketBySource(count: number, links: readonly LayeredLink[]): number[][] {
	const adjacency: number[][] = Array.from({ length: count }, () => [])
	links.forEach(([source], index) => adjacency[source].push(index))
	return adjacency
}

function step(vertex: number, cursor: number, walk: CycleWalk): number | null {
	const link = walk.adjacency[vertex][cursor]
	const target = walk.links[link][1]
	if (walk.state[target] === 1) walk.reversed[link] = true
	return walk.state[target] === 0 ? target : null
}

function visit(root: number, walk: CycleWalk): void {
	const { adjacency, state } = walk
	const stack: [number, number][] = [[root, 0]]
	state[root] = 1
	while (stack.length > 0) {
		const top = stack[stack.length - 1]
		const [vertex, cursor] = top
		if (cursor >= adjacency[vertex].length) {
			state[vertex] = 2
			stack.pop()
			continue
		}
		top[1] += 1
		const next = step(vertex, cursor, walk)
		if (next === null) continue
		state[next] = 1
		stack.push([next, 0])
	}
}

export function findReversedLinks(count: number, links: readonly LayeredLink[]): boolean[] {
	const walk: CycleWalk = {
		links,
		adjacency: bucketBySource(count, links),
		state: new Uint8Array(count),
		reversed: new Array<boolean>(links.length).fill(false),
	}
	for (let root = 0; root < count; root += 1) {
		if (walk.state[root] === 0) visit(root, walk)
	}
	return walk.reversed
}

export function orientLinks(links: readonly LayeredLink[], reversed: readonly boolean[]): LayeredLink[] {
	return links.flatMap(([source, target], index): LayeredLink[] => {
		if (source === target) return []
		return [reversed[index] ? [target, source] : [source, target]]
	})
}
