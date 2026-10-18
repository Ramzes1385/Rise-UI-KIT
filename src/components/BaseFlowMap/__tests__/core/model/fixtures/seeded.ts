import type { FlowChange } from '../../../../types/data/flowReview.types'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode } from '../../../../types/data/flowData.types'

export type Random = () => number

export function createRandom(seed: number): Random {
	let state = seed >>> 0
	return () => {
		state = (state + 0x6d2b79f5) >>> 0
		let value = state
		value = Math.imul(value ^ (value >>> 15), value | 1)
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296
	}
}

export function randomInt(random: Random, max: number): number {
	return Math.floor(random() * max)
}

export function pickOne<T>(random: Random, list: readonly T[]): T {
	return list[randomInt(random, list.length)]
}

const LABELS = ['Заказы', 'Платежи', 'Склад', 'Почта', 'Кэш']
const STATUSES = ['ok', 'warning', 'error', 'down']

function randomNode(random: Random, id: string): FlowNode {
	const node: FlowNode = { id, kind: 'service', label: pickOne(random, LABELS) }
	if (random() < 0.5) node.status = pickOne(random, STATUSES)
	if (random() < 0.4) node.position = { x: randomInt(random, 500), y: randomInt(random, 500) }
	if (random() < 0.3) node.tags = [pickOne(random, LABELS)]
	return node
}

export function randomData(random: Random): FlowMapData {
	const nodeCount = 1 + randomInt(random, 6)
	const nodes = Array.from({ length: nodeCount }, (_, index) => randomNode(random, `n${index}`))
	const edges: FlowEdge[] = Array.from({ length: randomInt(random, 6) }, (_, index) => ({
		id: `e${index}`,
		source: pickOne(random, nodes).id,
		target: pickOne(random, nodes).id,
		...(random() < 0.5 ? { label: pickOne(random, LABELS) } : {}),
	}))
	const groups: FlowGroup[] = Array.from({ length: randomInt(random, 3) }, (_, index) => ({
		id: `g${index}`,
		kind: 'zone',
		label: pickOne(random, LABELS),
	}))
	const data: FlowMapData = { version: 1, nodes, edges }
	if (random() < 0.5) data.title = pickOne(random, LABELS)
	if (random() < 0.5) data.groups = groups
	if (random() < 0.3) data.layout = { direction: 'LR', nodeGap: randomInt(random, 80) }
	return data
}

const COLLECTIONS = { node: 'nodes', edge: 'edges', group: 'groups' } as const

function randomChange(random: Random, data: FlowMapData, serial: number): FlowChange {
	const entity = pickOne(random, ['node', 'edge', 'group'] as const)
	const list = (data[COLLECTIONS[entity as 'node' | 'edge' | 'group']] ?? []) as { id: string }[]
	const kind = pickOne(random, ['add', 'remove', 'update', 'root'] as const)
	if (kind === 'root') {
		return { type: 'root', patch: { title: `T${serial}` }, previous: { title: data.title } }
	}
	if (kind === 'add' || list.length === 0) {
		const id = `${entity}-new-${serial}`
		const values = {
			node: { id, kind: 'service', label: `Новый ${serial}` },
			edge: { id, source: 'n0', target: 'n0' },
			group: { id, kind: 'zone', label: `Группа ${serial}` },
		}
		const value = values[entity] as FlowNode
		return { type: 'add', entity, value, index: random() < 0.5 ? randomInt(random, list.length + 1) : undefined }
	}
	const index = randomInt(random, list.length)
	const target = list[index] as unknown as Record<string, unknown>
	if (kind === 'remove') return { type: 'remove', entity, id: list[index].id, value: list[index] as never, index }
	return {
		type: 'update',
		entity,
		id: list[index].id,
		patch: { label: `L${serial}`, status: undefined },
		previous: { label: target.label, status: target.status },
	}
}

export function randomChanges(random: Random, data: FlowMapData, applyAll: (data: FlowMapData, changes: FlowChange[]) => FlowMapData) {
	const count = 1 + randomInt(random, 6)
	const changes: FlowChange[] = []
	let current = data
	for (let serial = 0; serial < count; serial += 1) {
		const change = randomChange(random, current, serial)
		changes.push(change)
		current = applyAll(current, [change])
	}
	return changes
}

export function mutate(random: Random, base: FlowMapData): FlowMapData {
	const nodes = base.nodes.filter(() => random() > 0.25).map(node => (random() < 0.4 ? { ...node, label: `${node.label}!` } : node))
	const extra = Array.from({ length: randomInt(random, 3) }, (_, index) => randomNode(random, `x${index}`))
	for (const node of extra) nodes.splice(randomInt(random, nodes.length + 1), 0, node)
	const ids = new Set(nodes.map(node => node.id))
	const edges = base.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target) && random() > 0.2)
	const target: FlowMapData = { ...base, nodes, edges }
	if (random() < 0.5) target.title = `Новый ${randomInt(random, 9)}`
	if (random() < 0.3) delete target.layout
	return target
}
