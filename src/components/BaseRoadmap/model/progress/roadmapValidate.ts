import { warn } from '@/locales/warn'
import { UI_ROADMAP } from '@/locales/messages'
import { buildRoadmapIndex } from './roadmapStatus'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import type { RoadmapData, RoadmapStage } from '../../types/roadmapData.types'
import { ROADMAP_MATERIAL_KINDS, ROADMAP_TOPIC_KINDS } from '../../types/roadmapData.types'
import type {
	RoadmapCycleState,
	RoadmapGraphEdge,
	RoadmapIndex,
	RoadmapIssue,
	RoadmapRequirements,
	RoadmapValidation,
} from '../../types/internal/roadmapInternal.types'

function unique(list: string[] | undefined): string[] {
	return [...new Set(list ?? [])]
}

function edgeKey(owner: string, target: string): string {
	return `${owner}\u0000${target}`
}

function quote(ids: string[]): string {
	return ids.map(id => `«${id}»`).join(' → ')
}

function kindIssue(path: string, value: string | undefined, allowed: readonly string[]): RoadmapIssue[] {
	if (value === undefined || allowed.includes(value)) return []
	return [{ code: 'UNKNOWN_KIND', params: { path, value, expected: allowed.join(' | ') } }]
}

function requireIssues(id: string, requires: string[] | undefined, index: RoadmapIndex): RoadmapIssue[] {
	return unique(requires)
		.filter(target => !index.stages.has(target) && !index.topics.has(target))
		.map(target => ({ code: 'UNKNOWN_REQUIRE', params: { id, target } }))
}

function topicIssues(stage: RoadmapStage, index: RoadmapIndex): RoadmapIssue[] {
	return stage.topics.flatMap(topic => [
		...kindIssue(`topics[«${topic.id}»].kind`, topic.kind, ROADMAP_TOPIC_KINDS),
		...requireIssues(topic.id, topic.requires, index),
		...(topic.hours !== undefined && topic.hours < 0
			? [{ code: 'NEGATIVE_HOURS' as const, params: { id: topic.id, value: topic.hours } }]
			: []),
		...(topic.materials ?? []).flatMap((material, position) =>
			kindIssue(`topics[«${topic.id}»].materials[${position}].kind`, material.kind, ROADMAP_MATERIAL_KINDS),
		),
	])
}

function duplicateIssues(data: RoadmapData): RoadmapIssue[] {
	const seen = new Set<string>()
	const ids = data.stages.flatMap(stage => [stage.id, ...stage.topics.map(topic => topic.id)])
	return ids.filter(id => seen.has(id) || !seen.add(id)).map(id => ({ code: 'DUPLICATE_ID', params: { id } }))
}

function collectDataIssues(data: RoadmapData, index: RoadmapIndex): RoadmapIssue[] {
	return [
		...duplicateIssues(data),
		...data.stages.flatMap(stage => [
			...kindIssue(`stages[«${stage.id}»].kind`, stage.kind, ROADMAP_TOPIC_KINDS),
			...requireIssues(stage.id, stage.requires, index),
			...topicIssues(stage, index),
		]),
	]
}

function explicitEdges(id: string, requires: string[] | undefined, index: RoadmapIndex): RoadmapGraphEdge[] {
	return unique(requires)
		.filter(target => index.topics.has(target) || (index.stages.has(target) && index.stages.get(target)?.kind !== 'optional'))
		.map(target => ({ to: target, key: edgeKey(id, target) }))
}

function buildEdges(data: RoadmapData, index: RoadmapIndex): Map<string, RoadmapGraphEdge[]> {
	const edges = new Map<string, RoadmapGraphEdge[]>()
	const isIndexed = (id: string, stage: RoadmapStage): boolean => index.stages.get(id) === stage
	data.stages
		.filter(stage => isIndexed(stage.id, stage))
		.forEach(stage => {
			const own = explicitEdges(stage.id, stage.requires, index)
			const needed = stage.topics.filter(
				topic => index.topics.get(topic.id)?.topic === topic && topic.kind !== 'optional' && topic.choice === undefined,
			)
			edges.set(stage.id, [...own, ...(stage.kind === 'optional' ? [] : needed.map(topic => ({ to: topic.id, key: null })))])
			stage.topics
				.filter(topic => index.topics.get(topic.id)?.topic === topic)
				.forEach(topic => edges.set(topic.id, [...explicitEdges(topic.id, topic.requires, index), ...own]))
		})
	return edges
}

function closeCycle(state: RoadmapCycleState, edge: RoadmapGraphEdge): void {
	const start = state.nodes.indexOf(edge.to)
	const loop = [...state.path.slice(start), edge]
	const target = edge.key === null ? [...loop].reverse().find(candidate => candidate.key !== null) : edge
	if (target?.key) state.dropped.add(target.key)
	state.issues.push({ code: 'CYCLE', params: { path: quote([...state.nodes.slice(start), edge.to]) } })
}

function visitNode(state: RoadmapCycleState, id: string): void {
	state.marks.set(id, 1)
	state.nodes.push(id)
	for (const edge of state.edges.get(id) ?? []) {
		const mark = state.marks.get(edge.to)
		if ((edge.key !== null && state.dropped.has(edge.key)) || mark === 2) continue
		if (mark === 1) closeCycle(state, edge)
		else {
			state.path.push(edge)
			visitNode(state, edge.to)
			state.path.pop()
		}
	}
	state.nodes.pop()
	state.marks.set(id, 2)
}

function findCycles(data: RoadmapData, index: RoadmapIndex): Pick<RoadmapCycleState, 'dropped' | 'issues'> {
	const state: RoadmapCycleState = {
		edges: buildEdges(data, index),
		marks: new Map(),
		dropped: new Set(),
		issues: [],
		nodes: [],
		path: [],
	}
	state.edges.forEach((_, id) => {
		if (!state.marks.has(id)) visitNode(state, id)
	})
	return state
}

export function validateRoadmap(data: RoadmapData, index: RoadmapIndex = buildRoadmapIndex(data)): RoadmapValidation {
	const { dropped, issues: cycles } = findCycles(data, index)
	const requires: RoadmapRequirements = new Map()
	const keep = (id: string, list: string[] | undefined): void => {
		const targets = unique(list).filter(
			target => (index.stages.has(target) || index.topics.has(target)) && !dropped.has(edgeKey(id, target)),
		)
		requires.set(id, targets)
	}
	index.stages.forEach(stage => keep(stage.id, stage.requires))
	index.topics.forEach(({ topic }) => keep(topic.id, topic.requires))
	return { requires, issues: [...collectDataIssues(data, index), ...cycles] }
}

export function warnRoadmapIssues(issues: RoadmapIssue[]): void {
	if (!isDevelopmentBuild()) return
	issues.forEach(issue => warn(UI_ROADMAP[issue.code], issue.params))
}
