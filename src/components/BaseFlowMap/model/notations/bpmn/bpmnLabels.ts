import { UI_FLOW_BPMN } from '@/locales/messages'
import type { FlowPropDef } from '../../../types/api/flowNotation.types'
import type { BpmnEventTrigger, BpmnLoopType, BpmnTaskType } from '../../../types/notations/process/bpmn.types'

const TRIGGER_LABELS: Record<BpmnEventTrigger, () => string> = {
	none: () => UI_FLOW_BPMN.TRIGGER_NONE,
	message: () => UI_FLOW_BPMN.TRIGGER_MESSAGE,
	timer: () => UI_FLOW_BPMN.TRIGGER_TIMER,
	error: () => UI_FLOW_BPMN.TRIGGER_ERROR,
	escalation: () => UI_FLOW_BPMN.TRIGGER_ESCALATION,
	cancel: () => UI_FLOW_BPMN.TRIGGER_CANCEL,
	compensation: () => UI_FLOW_BPMN.TRIGGER_COMPENSATION,
	conditional: () => UI_FLOW_BPMN.TRIGGER_CONDITIONAL,
	link: () => UI_FLOW_BPMN.TRIGGER_LINK,
	signal: () => UI_FLOW_BPMN.TRIGGER_SIGNAL,
	terminate: () => UI_FLOW_BPMN.TRIGGER_TERMINATE,
	multiple: () => UI_FLOW_BPMN.TRIGGER_MULTIPLE,
	'parallel-multiple': () => UI_FLOW_BPMN.TRIGGER_PARALLEL_MULTIPLE,
}

const TASK_TYPE_LABELS: Record<BpmnTaskType, () => string> = {
	none: () => UI_FLOW_BPMN.TASK_TYPE_NONE,
	user: () => UI_FLOW_BPMN.TASK_TYPE_USER,
	service: () => UI_FLOW_BPMN.TASK_TYPE_SERVICE,
	script: () => UI_FLOW_BPMN.TASK_TYPE_SCRIPT,
	send: () => UI_FLOW_BPMN.TASK_TYPE_SEND,
	receive: () => UI_FLOW_BPMN.TASK_TYPE_RECEIVE,
	manual: () => UI_FLOW_BPMN.TASK_TYPE_MANUAL,
	'business-rule': () => UI_FLOW_BPMN.TASK_TYPE_BUSINESS_RULE,
}

const LOOP_LABELS: Record<BpmnLoopType, () => string> = {
	none: () => UI_FLOW_BPMN.LOOP_NONE,
	standard: () => UI_FLOW_BPMN.LOOP_STANDARD,
	'multi-parallel': () => UI_FLOW_BPMN.LOOP_MULTI_PARALLEL,
	'multi-sequential': () => UI_FLOW_BPMN.LOOP_MULTI_SEQUENTIAL,
}

export function triggerLabel(trigger: BpmnEventTrigger): string {
	return TRIGGER_LABELS[trigger]()
}

function options<T extends string>(values: readonly T[], labels: Record<T, () => string>): NonNullable<FlowPropDef['options']> {
	return values.map(value => ({ value, label: labels[value] }))
}

export function triggerProp(values: readonly BpmnEventTrigger[], fallback: BpmnEventTrigger): FlowPropDef {
	return { label: () => UI_FLOW_BPMN.PROP_TRIGGER, type: 'select', options: options(values, TRIGGER_LABELS), default: fallback }
}

export function throwingProp(): FlowPropDef {
	return { label: () => UI_FLOW_BPMN.PROP_THROWING, type: 'boolean', default: false }
}

export function taskTypeProp(values: readonly BpmnTaskType[]): FlowPropDef {
	return { label: () => UI_FLOW_BPMN.PROP_TASK_TYPE, type: 'select', options: options(values, TASK_TYPE_LABELS), default: 'none' }
}

export function loopProp(values: readonly BpmnLoopType[]): FlowPropDef {
	return { label: () => UI_FLOW_BPMN.PROP_LOOP, type: 'select', options: options(values, LOOP_LABELS), default: 'none' }
}

export function compensationProp(): FlowPropDef {
	return { label: () => UI_FLOW_BPMN.PROP_COMPENSATION, type: 'boolean', default: false }
}
