import { UI_FLOW_BPMN } from '@/locales/messages'
import { activityMarkers, eventMarkers, gatewayMarkers } from './bpmnMarkers'
import { compensationProp, loopProp, taskTypeProp, throwingProp, triggerProp } from './bpmnLabels'
import type { FlowEdgeKindDef, FlowGroupKindDef, FlowNodeKindDef } from '../../../types/api/flowNotation.types'
import { BPMN_LOOP_TYPES, BPMN_TASK_TYPES, BPMN_TRIGGERS_BY_KIND } from '../../../types/notations/process/bpmn.types'

const EVENT_SIZE = { width: 36, height: 36 }
const GATEWAY_SIZE = { width: 52, height: 52 }
const TASK_SIZE = { width: 144, height: 56 }

const EVENTS = 'events'
const ACTIVITIES = 'activities'
const GATEWAYS = 'gateways'
const DATA = 'data'

function event(
	options: Pick<FlowNodeKindDef, 'label' | 'props'> & { id: 'start' | 'intermediate' | 'end' | 'boundary'; stroke: string },
): FlowNodeKindDef {
	const ring = { start: 'single', intermediate: 'double', end: 'thick', boundary: 'double' } as const
	return {
		label: options.label,
		render: 'svg',
		shape: {
			shape: 'circle',
			ring: ring[options.id],
			fill: 'var(--rise-bg)',
			stroke: options.stroke,
			markers: eventMarkers(options.id),
		},
		size: EVENT_SIZE,
		labelPlacement: 'below',
		props: options.props,
		paletteGroup: EVENTS,
	}
}

function gateway(id: keyof ReturnType<typeof gatewayLabels>): FlowNodeKindDef {
	return {
		label: gatewayLabels()[id],
		render: 'svg',
		shape: {
			shape: 'diamond',
			ring: id === 'event-based' ? 'double' : 'single',
			fill: 'var(--rise-bg)',
			stroke: 'var(--rise-warning)',
			markers: gatewayMarkers(id),
		},
		size: GATEWAY_SIZE,
		labelPlacement: 'below',
		paletteGroup: GATEWAYS,
	}
}

function gatewayLabels() {
	return {
		exclusive: () => UI_FLOW_BPMN.NODE_EXCLUSIVE,
		inclusive: () => UI_FLOW_BPMN.NODE_INCLUSIVE,
		parallel: () => UI_FLOW_BPMN.NODE_PARALLEL,
		'event-based': () => UI_FLOW_BPMN.NODE_EVENT_BASED,
		complex: () => UI_FLOW_BPMN.NODE_COMPLEX,
	}
}

function activity(options: {
	label: () => string
	ring?: 'single' | 'double' | 'thick'
	size: FlowNodeKindDef['size']
	isTask?: boolean
	isContainer?: boolean
}): FlowNodeKindDef {
	return {
		label: options.label,
		render: 'svg',
		shape: {
			shape: 'round-rect',
			ring: options.ring ?? 'single',
			fill: 'var(--rise-bg)',
			stroke: 'var(--rise-border-accented)',
			markers: activityMarkers({ isTask: options.isTask === true, isExpandable: options.isTask !== true }),
		},
		size: options.size,
		labelPlacement: 'inside',
		isContainer: options.isContainer,
		props: {
			...(options.isTask ? { taskType: taskTypeProp(BPMN_TASK_TYPES) } : {}),
			loop: loopProp(BPMN_LOOP_TYPES),
			isCompensation: compensationProp(),
		},
		paletteGroup: ACTIVITIES,
	}
}

export const BPMN_NODE_KINDS: Record<string, FlowNodeKindDef> = {
	start: event({
		id: 'start',
		label: () => UI_FLOW_BPMN.NODE_START,
		stroke: 'var(--rise-success)',
		props: { trigger: triggerProp(BPMN_TRIGGERS_BY_KIND.start, 'none') },
	}),
	intermediate: event({
		id: 'intermediate',
		label: () => UI_FLOW_BPMN.NODE_INTERMEDIATE,
		stroke: 'var(--rise-info)',
		props: { trigger: triggerProp(BPMN_TRIGGERS_BY_KIND['intermediate-catch'], 'none'), isThrowing: throwingProp() },
	}),
	end: event({
		id: 'end',
		label: () => UI_FLOW_BPMN.NODE_END,
		stroke: 'var(--rise-text)',
		props: { trigger: triggerProp(BPMN_TRIGGERS_BY_KIND.end, 'none') },
	}),
	boundary: event({
		id: 'boundary',
		label: () => UI_FLOW_BPMN.NODE_BOUNDARY,
		stroke: 'var(--rise-info)',
		props: { trigger: triggerProp(BPMN_TRIGGERS_BY_KIND.boundary, 'message') },
	}),
	task: activity({ label: () => UI_FLOW_BPMN.NODE_TASK, size: TASK_SIZE, isTask: true }),
	subprocess: activity({ label: () => UI_FLOW_BPMN.NODE_SUBPROCESS, size: { width: 168, height: 96 }, isContainer: true }),
	'call-activity': activity({ label: () => UI_FLOW_BPMN.NODE_CALL_ACTIVITY, ring: 'thick', size: TASK_SIZE }),
	transaction: activity({
		label: () => UI_FLOW_BPMN.NODE_TRANSACTION,
		ring: 'double',
		size: { width: 168, height: 96 },
		isContainer: true,
	}),
	exclusive: gateway('exclusive'),
	inclusive: gateway('inclusive'),
	parallel: gateway('parallel'),
	'event-based': gateway('event-based'),
	complex: gateway('complex'),
	'data-object': {
		label: () => UI_FLOW_BPMN.NODE_DATA_OBJECT,
		render: 'svg',
		shape: { shape: 'document', fill: 'var(--rise-bg)', stroke: 'var(--rise-border-accented)' },
		size: { width: 36, height: 48 },
		labelPlacement: 'below',
		paletteGroup: DATA,
	},
	'data-store': {
		label: () => UI_FLOW_BPMN.NODE_DATA_STORE,
		render: 'svg',
		shape: { shape: 'cylinder', fill: 'var(--rise-bg)', stroke: 'var(--rise-border-accented)' },
		size: { width: 48, height: 44 },
		labelPlacement: 'below',
		paletteGroup: DATA,
	},
	annotation: {
		label: () => UI_FLOW_BPMN.NODE_ANNOTATION,
		render: 'svg',
		shape: { shape: 'open-rect', stroke: 'var(--rise-border-accented)' },
		size: { width: 128, height: 48 },
		labelPlacement: 'inside',
		paletteGroup: DATA,
	},
}

export const BPMN_EDGE_KINDS: Record<string, FlowEdgeKindDef> = {
	sequence: {
		label: () => UI_FLOW_BPMN.EDGE_SEQUENCE,
		stroke: 'solid',
		startMarker: 'none',
		endMarker: 'arrow',
		routing: 'orthogonal',
		effect: 'travel',
	},
	message: {
		label: () => UI_FLOW_BPMN.EDGE_MESSAGE,
		stroke: 'dashed',
		startMarker: 'circle',
		endMarker: 'open-arrow',
		routing: 'orthogonal',
		effect: 'travel',
	},
	association: {
		label: () => UI_FLOW_BPMN.EDGE_ASSOCIATION,
		stroke: 'dotted',
		startMarker: 'none',
		endMarker: 'none',
		routing: 'straight',
		effect: 'draw',
	},
	'data-association': {
		label: () => UI_FLOW_BPMN.EDGE_DATA_ASSOCIATION,
		stroke: 'dotted',
		startMarker: 'none',
		endMarker: 'open-arrow',
		routing: 'orthogonal',
		effect: 'draw',
	},
}

export const BPMN_GROUP_KINDS: Record<string, FlowGroupKindDef> = {
	pool: { label: () => UI_FLOW_BPMN.GROUP_POOL, layout: 'band', header: 'start', border: 'solid' },
	lane: { label: () => UI_FLOW_BPMN.GROUP_LANE, layout: 'band', header: 'start', border: 'solid' },
	group: { label: () => UI_FLOW_BPMN.GROUP_GROUP, layout: 'box', header: 'top', border: 'dashed' },
}
