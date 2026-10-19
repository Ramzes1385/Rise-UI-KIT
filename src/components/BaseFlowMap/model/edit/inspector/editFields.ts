import { UI_FLOW_EDITOR } from '@/locales/messages'
import type { FlowEditable } from '../../../types/internal/core/flowCommandInternal.types'
import type { FlowEdge, FlowGroup, FlowNode, FlowValue } from '../../../types/data/flowData.types'
import { FLOW_DIRECTIONS, FLOW_EDGE_ROUTINGS, FLOW_STATUSES } from '../../../types/data/flowData.types'
import type { FlowEditContext, FlowEditFieldDef, FlowEditFieldOption } from '../../../types/internal/edit/flowEditApi.types'

const NONE = ''

const DIRECTION_LABELS: Record<string, () => string> = {
	TB: () => UI_FLOW_EDITOR.DIRECTION_TB,
	LR: () => UI_FLOW_EDITOR.DIRECTION_LR,
	BT: () => UI_FLOW_EDITOR.DIRECTION_BT,
	RL: () => UI_FLOW_EDITOR.DIRECTION_RL,
}

const ROUTING_LABELS: Record<string, () => string> = {
	curved: () => UI_FLOW_EDITOR.ROUTING_CURVED,
	orthogonal: () => UI_FLOW_EDITOR.ROUTING_ORTHOGONAL,
	straight: () => UI_FLOW_EDITOR.ROUTING_STRAIGHT,
}

const STATUS_LABELS = (status: string): string => (UI_FLOW_EDITOR as Record<string, string>)[`STATE_${status.toUpperCase()}`]

export function writer(context: FlowEditContext, entity: FlowEditable, id: string) {
	return (patch: Record<string, unknown>) => void context.commands.update({ entity, id }, patch)
}

function kindOptions(table: Record<string, { label: () => string }> | undefined): FlowEditFieldOption[] {
	return Object.entries(table ?? {}).map(([value, def]) => ({ value, label: def.label() }))
}

function statusOptions(): FlowEditFieldOption[] {
	return [{ value: NONE, label: UI_FLOW_EDITOR.NO_STATUS }, ...FLOW_STATUSES.map(value => ({ value, label: STATUS_LABELS(value) }))]
}

function groupOptions(context: FlowEditContext): FlowEditFieldOption[] {
	const groups = context.env.model.data.value.groups ?? []
	return [{ value: NONE, label: UI_FLOW_EDITOR.NO_GROUP }, ...groups.map(group => ({ value: group.id, label: group.label }))]
}

function propFields(context: FlowEditContext, node: FlowNode): FlowEditFieldDef[] {
	const def = context.env.model.nodeKind(node)
	const write = writer(context, 'node', node.id)
	return Object.entries(def.props ?? {}).map(([key, prop]) => {
		const current = node.props?.[key] ?? prop.default
		const type = ({ text: 'text', number: 'number', boolean: 'switch', select: 'select', color: 'text' } as const)[prop.type]
		const options = prop.options?.map(option => ({ value: option.value, label: option.label() }))
		return {
			id: `prop-${key}`,
			type,
			label: prop.label(),
			value: current as FlowEditFieldDef['value'],
			options,
			commit: value => write({ props: { ...node.props, [key]: value as FlowValue } }),
		}
	})
}

export function nodeFields(context: FlowEditContext, node: FlowNode): FlowEditFieldDef[] {
	const write = writer(context, 'node', node.id)
	const { notation } = context.env.model
	return [
		{ id: 'label', type: 'text', label: UI_FLOW_EDITOR.FIELD_NAME, value: node.label, commit: value => write({ label: value }) },
		{
			id: 'kind',
			type: 'select',
			label: UI_FLOW_EDITOR.FIELD_KIND,
			value: node.kind,
			options: kindOptions(notation.value.nodeKinds),
			commit: value => write({ kind: value }),
		},
		{
			id: 'group',
			type: 'select',
			label: UI_FLOW_EDITOR.FIELD_GROUP,
			value: node.group ?? NONE,
			options: groupOptions(context),
			commit: value => write({ group: value || undefined }),
		},
		{
			id: 'status',
			type: 'select',
			label: UI_FLOW_EDITOR.FIELD_STATUS,
			value: node.status ?? NONE,
			options: statusOptions(),
			commit: value => write({ status: value || undefined }),
		},
		{
			id: 'description',
			type: 'area',
			label: UI_FLOW_EDITOR.FIELD_DESCRIPTION,
			value: node.description ?? '',
			commit: value => write({ description: value || undefined }),
		},
		...propFields(context, node),
	]
}

export function edgeFields(context: FlowEditContext, edge: FlowEdge): FlowEditFieldDef[] {
	const write = writer(context, 'edge', edge.id)
	const routing = FLOW_EDGE_ROUTINGS.map(value => ({ value, label: ROUTING_LABELS[value]() }))
	return [
		{
			id: 'routing',
			type: 'segmented',
			label: UI_FLOW_EDITOR.FIELD_ROUTING,
			value: edge.routing ?? 'curved',
			options: routing,
			commit: value => write({ routing: value }),
		},
		{
			id: 'kind',
			type: 'select',
			label: UI_FLOW_EDITOR.FIELD_KIND,
			value: edge.kind ?? context.env.model.notation.value.defaultEdgeKind,
			options: kindOptions(context.env.model.notation.value.edgeKinds),
			commit: value => write({ kind: value }),
		},
		{
			id: 'label',
			type: 'text',
			label: UI_FLOW_EDITOR.FIELD_LABEL,
			value: edge.label ?? '',
			commit: value => write({ label: value || undefined }),
		},
		{
			id: 'condition',
			type: 'text',
			label: UI_FLOW_EDITOR.FIELD_CONDITION,
			value: edge.condition ?? '',
			commit: value => write({ condition: value || undefined }),
		},
		{
			id: 'default',
			type: 'switch',
			label: UI_FLOW_EDITOR.FIELD_DEFAULT,
			value: Boolean(edge.isDefault),
			commit: value => write({ isDefault: value === true }),
		},
	]
}

export function groupFields(context: FlowEditContext, group: FlowGroup): FlowEditFieldDef[] {
	const write = writer(context, 'group', group.id)
	const kinds = context.env.model.notation.value.groupKinds
	return [
		{ id: 'label', type: 'text', label: UI_FLOW_EDITOR.FIELD_NAME, value: group.label, commit: value => write({ label: value }) },
		{
			id: 'kind',
			type: 'select',
			label: UI_FLOW_EDITOR.FIELD_KIND,
			value: group.kind,
			options: kindOptions(kinds),
			commit: value => write({ kind: value }),
		},
		{
			id: 'description',
			type: 'area',
			label: UI_FLOW_EDITOR.FIELD_DESCRIPTION,
			value: group.description ?? '',
			commit: value => write({ description: value || undefined }),
		},
	]
}

export function mapFields(context: FlowEditContext): FlowEditFieldDef[] {
	const { model } = context.env
	const layout = model.data.value.layout
	const direction = FLOW_DIRECTIONS.map(value => ({ value, label: DIRECTION_LABELS[value]() }))
	return [
		{
			id: 'title',
			type: 'text',
			label: UI_FLOW_EDITOR.FIELD_MAP_NAME,
			value: model.data.value.title ?? '',
			commit: value => void context.commands.updateMap({ title: value || undefined }),
		},
		{
			id: 'notation',
			type: 'text',
			label: UI_FLOW_EDITOR.FIELD_NOTATION,
			value: model.notation.value.label(),
			isDisabled: true,
			commit: () => undefined,
		},
		{
			id: 'direction',
			type: 'segmented',
			label: UI_FLOW_EDITOR.FIELD_DIRECTION,
			value: layout?.direction ?? model.notation.value.layout?.direction ?? 'LR',
			options: direction,
			commit: value => void context.commands.updateMap({ layout: { ...layout, direction: value as 'TB' } }),
		},
	]
}

export function manyFields(context: FlowEditContext, ids: readonly string[]): FlowEditFieldDef[] {
	const nodes = ids.filter(id => context.env.model.graph.value.nodes.has(id))
	const all = (patch: Record<string, unknown>) =>
		void context.env.model.controller.transact(UI_FLOW_EDITOR.MULTI_TITLE, async () => {
			for (const id of nodes) await context.commands.update({ entity: 'node', id }, patch)
		})
	return [
		{
			id: 'group',
			type: 'select',
			label: UI_FLOW_EDITOR.FIELD_GROUP,
			value: NONE,
			options: groupOptions(context),
			commit: value => all({ group: value || undefined }),
		},
		{
			id: 'status',
			type: 'select',
			label: UI_FLOW_EDITOR.FIELD_STATUS,
			value: NONE,
			options: statusOptions(),
			commit: value => all({ status: value || undefined }),
		},
	]
}
