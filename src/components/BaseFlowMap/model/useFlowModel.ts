import { shallowRef, watch } from 'vue'
import { useFlowState } from './state/useFlowState'
import { applyFlowChanges } from './data/flowChanges'
import { createExecutor } from './execute/flowExecute'
import { useFlowLayout } from './layout/useFlowLayout'
import { syncPropHooks } from './execute/flowHookProps'
import { createFlowEvents } from './controller/flowEvents'
import { setupFlowPlugins } from './controller/flowPlugins'
import { useFlowScenario } from './scenario/useFlowScenario'
import { createViewHolder } from './controller/flowViewAdapter'
import { createController } from './controller/useFlowController'
import type { FlowHooks } from '../types/api/flowController.types'
import type { FlowDataIssue } from '../types/api/flowNotation.types'
import type { FlowChange, FlowSuggestion } from '../types/data/flowReview.types'
import type { FlowModel, FlowModelProps } from '../types/internal/flowModel.types'
import type { FlowModelInternal } from '../types/internal/core/flowRenderInternal.types'
import { createHookRunner, useCommandHistory } from '@composables/editor/useCommandHistory'
import { resolveEdgeKind, resolveGroupKind, resolveNodeKind } from './notations/resolveKind'
import type { FlowEventBus, FlowModelBase, FlowModelOptions, FlowState } from '../types/internal/core/flowModelCore.types'

function reportLoad(events: FlowEventBus, issues: FlowDataIssue[]): void {
	for (const issue of issues.filter(item => item.level === 'error')) events.emit('error', { code: issue.code, message: issue.message })
	if (issues.length > 0) events.emit('validate', issues)
}

function createHistory(state: FlowState, events: FlowEventBus) {
	return useCommandHistory<FlowChange>({
		apply(changes, direction) {
			const next = applyFlowChanges(state.data.value, changes)
			state.commit(next)
			events.emit('update:data', next)
			events.emit('change', { changes: [...changes], source: 'history', command: direction, data: next })
		},
	})
}

function kindResolvers(state: FlowState): Pick<FlowModelBase, 'nodeKind' | 'edgeKind' | 'groupKind'> {
	return {
		nodeKind: node => resolveNodeKind(node.kind, state.notation.value, state.registry.value),
		edgeKind: edge => resolveEdgeKind(edge.kind, state.notation.value, state.registry.value),
		groupKind: group => resolveGroupKind(group.kind, state.notation.value, state.registry.value),
	}
}

function wireEvents(model: FlowModel, events: FlowEventBus, props: FlowModelProps): void {
	watch(model.history.state, value => events.emit('history-change', { ...value }))
	watch(model.scenario.state, (value, previous) => {
		if (value.status !== previous.status || value.scenario !== previous.scenario) events.emit('scenario-change', value)
		if (value.stepIndex !== previous.stepIndex) events.emit('scenario-step', value)
	})
	watch(
		() => props.plugins,
		(plugins, _previous, onCleanup) => onCleanup(setupFlowPlugins(model.controller, plugins ?? [])),
		{ immediate: true },
	)
}

function createExecution(props: FlowModelProps, state: FlowState, events: FlowEventBus) {
	const hooks = createHookRunner<FlowHooks>()
	syncPropHooks(props, hooks)
	const history = createHistory(state, events)
	const draft = shallowRef<FlowSuggestion | null>(null)
	const context = { props, state, hooks, history, events, draft }
	return { ...context, execute: createExecutor(context) }
}

export function useFlowModel(props: FlowModelProps, options: FlowModelOptions): FlowModelInternal {
	const events = createFlowEvents(options)
	const state = useFlowState(props, issues => reportLoad(events, issues), options.isCompact)
	const execution = createExecution(props, state, events)
	const { layout, routes } = useFlowLayout(state.scope)
	const { hooks, history, draft, execute } = execution
	const { data, notation, graph, issues, selection, highlighted, live, mode } = state
	const base: FlowModelBase = {
		...{ data, notation, graph, issues, selection, highlighted, live, mode },
		...kindResolvers(state),
		...{ layout, routes, hooks, history, draft, execute },
	}
	const scenario = useFlowScenario(base, props, options.environment)
	const holder = createViewHolder()
	const parts = { ...execution, layout, announce: options.environment.announce, scenario, view: holder.view }
	const model: FlowModelInternal = { ...base, scenario, controller: createController(parts), setView: holder.set, events }
	wireEvents(model, events, props)
	return model
}
