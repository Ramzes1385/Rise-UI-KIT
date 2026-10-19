import { createReviewApi } from './flowReviewApi'
import { createStateApi } from '../state/flowStateApi'
import { createGroupsApi } from '../groups/flowGroupsApi'
import { FLOW_HOOK_NAMES } from '../execute/flowHookProps'
import { createEditApi } from '../commands/useFlowCommands'
import { listBindings, toggleBinding } from './flowBindings'
import { createHistoryApi } from '../commands/useFlowHistoryApi'
import type { FlowControllerParts } from '../../types/internal/core/flowModelCore.types'
import type { FlowHookName, FlowMapController, FlowOn } from '../../types/api/flowController.types'

function createOn(parts: FlowControllerParts): FlowOn {
	const on = (name: string, handler: unknown, options?: { priority?: number }): (() => void) => {
		if (FLOW_HOOK_NAMES.includes(name as FlowHookName)) {
			return (parts.hooks.on as (hook: string, fn: unknown, opts?: { priority?: number }) => () => void)(name, handler, options)
		}
		return parts.events.subscribe(name, handler as (value: never) => void)
	}
	return on as FlowOn
}

function createScenarioApi(parts: FlowControllerParts) {
	const { scenario } = parts
	return {
		play: (id?: string) => scenario.play(id),
		pause: () => scenario.pause(),
		stop: () => scenario.stop(),
		seek: (to: Parameters<FlowMapController['seek']>[0]) => scenario.seek(to),
		step: (direction: 1 | -1) => scenario.step(direction),
		setSpeed: (speed: number) => scenario.setSpeed(speed),
		getScenarioState: () => scenario.state.value,
	}
}

export function createController(parts: FlowControllerParts): FlowMapController {
	const { view } = parts
	return {
		...createStateApi(parts.state, parts.events),
		...createEditApi(parts),
		...createHistoryApi(parts),
		...createReviewApi(parts),
		...createScenarioApi(parts),
		...createGroupsApi(parts),
		fitView: options => view.fitView(options),
		focus(id, options) {
			parts.state.groups.reveal([id])
			view.focus(id, options)
		},
		zoom: to => view.zoom(to),
		getViewport: () => view.getViewport(),
		setViewport: (viewport, options) => view.setViewport(viewport, options),
		exportSvg: options => view.exportSvg(options),
		exportPng: options => view.exportPng(options),
		on: createOn(parts),
		getBindings: () => listBindings(parts),
		setBindingEnabled: (id, isEnabled) => toggleBinding(parts, id, isEnabled),
	}
}
