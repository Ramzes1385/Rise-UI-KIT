import type { FlowNode } from '../../../types/data/flowData.types'
import type { FlowShapeMarker } from '../../../types/api/flowNotation.types'
import type {
	BpmnActivityProps,
	BpmnEventKind,
	BpmnEventProps,
	BpmnEventTrigger,
	BpmnGatewayKind,
	BpmnLoopType,
	BpmnTaskType,
} from '../../../types/notations/process/bpmn.types'

const TRIGGER_PATHS: Record<BpmnEventTrigger, string> = {
	none: '',
	message: 'M4 7h16v10H4z M4 7l8 6 8-6',
	timer: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 8v4l3 2',
	error: 'M7 18l3-8 3 4 4-8-2 12-4-4z',
	escalation: 'M12 4l6 15-6-4-6 4z',
	cancel: 'M6 6l12 12M18 6L6 18',
	compensation: 'M12 7v10l-7-5z M19 7v10l-7-5z',
	conditional: 'M6 4h12v16H6z M9 8h6M9 12h6M9 16h6',
	link: 'M4 9h9V5l7 7-7 7v-4H4z',
	signal: 'M12 5l8 14H4z',
	terminate: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z',
	multiple: 'M12 4l7 5-3 9H8L5 9z',
	'parallel-multiple': 'M12 5v14M5 12h14',
}

const TASK_PATHS: Record<BpmnTaskType, string> = {
	none: '',
	user: 'M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M6 19c.6-3.5 3-5.5 6-5.5s5.4 2 6 5.5',
	service:
		'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4',
	script: 'M7 4h10v16H7z M9.5 8h5M9.5 12h5M9.5 16h3',
	send: 'M4 7h16v10H4z M4 7l8 6 8-6',
	receive: 'M4 7h16v10H4z M4 7l8 6 8-6',
	manual: 'M7 12V7.5a1 1 0 0 1 2 0V12 M9 11V5.5a1 1 0 0 1 2 0V11 M11 11V6.5a1 1 0 0 1 2 0V12 M13 11V8a1 1 0 0 1 2 0v6c0 3-2 5-5 5-2.5 0-4-1.5-5-3.5l-1-2',
	'business-rule': 'M4 6h16v12H4z M4 10h16M4 14h16M10 6v12',
}

const LOOP_PATHS: Record<BpmnLoopType, string> = {
	none: '',
	standard: 'M17 12a5 5 0 1 1-1.5-3.5 M17 6v3h-3',
	'multi-parallel': 'M9 6v12M12 6v12M15 6v12',
	'multi-sequential': 'M6 9h12M6 12h12M6 15h12',
}

const COMPENSATION_PATH = 'M12 7v10l-7-5z M19 7v10l-7-5z'
const EXPAND_PATH = 'M5 5h14v14H5z M12 8v8M8 12h8'

const GATEWAY_PATHS: Record<BpmnGatewayKind, string> = {
	exclusive: 'M8 8l8 8M16 8l-8 8',
	inclusive: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
	parallel: 'M12 6v12M6 12h12',
	'event-based': 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M12 9l3 2.2-1.1 3.5h-3.8L9 11.2z',
	complex: 'M12 6v12M6 12h12M8 8l8 8M16 8l-8 8',
}

export function gatewayMarkers(kind: BpmnGatewayKind): () => FlowShapeMarker[] {
	return () => [{ path: GATEWAY_PATHS[kind], placement: 'center' }]
}

function isThrowing(node: FlowNode, eventKind: string): boolean {
	const props = (node.props ?? {}) as BpmnEventProps
	if (eventKind === 'end') {
		return true
	}
	return eventKind === 'intermediate' && props.isThrowing === true
}

export function eventMarkers(eventKind: BpmnEventKind): (node: FlowNode) => FlowShapeMarker[] {
	return node => {
		const props = (node.props ?? {}) as BpmnEventProps
		const trigger = props.trigger ?? (eventKind === 'boundary' ? 'message' : 'none')
		const path = TRIGGER_PATHS[trigger]
		if (!path) {
			return []
		}
		const isFilled = trigger === 'terminate' || isThrowing(node, eventKind)
		return [{ path, placement: 'center', isFilled }]
	}
}

function taskMarker(taskType: BpmnTaskType | undefined): FlowShapeMarker[] {
	const path = TASK_PATHS[taskType ?? 'none']
	return path ? [{ path, placement: 'top-start', isFilled: taskType === 'send' }] : []
}

export function activityMarkers(options: { isTask: boolean; isExpandable: boolean }): (node: FlowNode) => FlowShapeMarker[] {
	return node => {
		const props = (node.props ?? {}) as BpmnActivityProps
		const markers = options.isTask ? taskMarker(props.taskType) : []
		const loop = LOOP_PATHS[props.loop ?? 'none']
		if (options.isExpandable) {
			markers.push({ path: EXPAND_PATH, placement: 'bottom-center' })
		}
		if (loop) {
			markers.push({ path: loop, placement: 'bottom-start' })
		}
		if (props.isCompensation) {
			markers.push({ path: COMPENSATION_PATH, placement: 'bottom-end' })
		}
		return markers
	}
}
