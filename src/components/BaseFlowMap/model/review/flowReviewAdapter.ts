import { diffFields, isReviewEqual } from './reviewDiff'
import type { FlowMapData } from '../../types/data/flowData.types'
import type { FlowAuthor, FlowChange, FlowEntity } from '../../types/data/flowReview.types'
import type { ReviewAdapter, ReviewChangeInfo, ReviewChangeKind, ReviewField } from '../../types/internal/review/reviewCore.types'

const LISTS: Record<FlowEntity, 'nodes' | 'edges' | 'groups' | 'scenarios'> = {
	node: 'nodes',
	edge: 'edges',
	group: 'groups',
	scenario: 'scenarios',
}

function updateKind(fields: readonly ReviewField[]): ReviewChangeKind {
	const names = fields.map(item => item.field)
	if (names.length > 0 && names.every(name => name === 'position')) return 'move'
	if (names.length > 0 && names.every(name => name === 'label')) return 'rename'
	return 'update'
}

function describeUpdate(change: Extract<FlowChange, { type: 'update' }>): ReviewChangeInfo {
	const fields = diffFields(change.patch, change.previous)
	return { kind: updateKind(fields), entity: change.entity, id: change.id, fields }
}

function endsOf(value: object): string[] | undefined {
	const { source, target } = value as { source?: string; target?: string }
	return source && target ? [source, target] : undefined
}

function describeFlowChange(change: FlowChange): ReviewChangeInfo | null {
	if (change.type === 'root') return null
	if (change.type === 'update') return describeUpdate(change)
	const id = change.type === 'add' ? change.value.id : change.id
	return { kind: change.type, entity: change.entity, id, fields: [], value: change.value, refs: endsOf(change.value) }
}

function findItem(data: FlowMapData, entity: FlowEntity, id: string): Record<string, unknown> | undefined {
	const list = (data[LISTS[entity]] ?? []) as readonly { id: string }[]
	return list.find(item => item.id === id) as Record<string, unknown> | undefined
}

function isFlowChangeApplicable(data: FlowMapData, change: FlowChange): boolean {
	if (change.type === 'root') return true
	if (change.type === 'add') return findItem(data, change.entity, change.value.id) === undefined
	const found = findItem(data, change.entity, change.id)
	if (!found) return false
	if (change.type === 'remove') return true
	return Object.entries(change.previous).every(([field, value]) => isReviewEqual(found[field], value))
}

export const flowReviewAdapter: ReviewAdapter<FlowChange, FlowMapData> = {
	describe: describeFlowChange,
	isApplicable: isFlowChangeApplicable,
}

export function flowAuthor(user: FlowAuthor | undefined): FlowAuthor {
	return user ?? { name: '' }
}
