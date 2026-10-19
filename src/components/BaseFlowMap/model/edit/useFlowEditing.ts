import { formatMessage } from '@/locales/state'
import { computed, type Ref, watch } from 'vue'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { useEditCommands } from './actions/editCommands'
import { useEditActions } from './actions/useEditActions'
import { useEditPointer } from './pointer/useEditPointer'
import { useFlowMapContext } from '../context/flowContext'
import { useEditState, useNotices } from './state/useEditState'
import type { BaseFlowMapProps } from '../../types/BaseFlowMap.types'
import type { FlowMapContext } from '../../types/internal/flowModel.types'
import type { FlowEditEnv } from '../../types/internal/edit/flowEdit.types'
import type { FlowModelInternal } from '../../types/internal/core/flowRenderInternal.types'
import type { FlowEditContext, FlowEditing } from '../../types/internal/edit/flowEditApi.types'

const registry = new WeakMap<object, FlowEditing>()

function wireReject(context: FlowEditContext): void {
	const { model, map, state } = context.env
	model.events.subscribe('reject', ((event: { message?: string }) => {
		if (!state.isActive.value || !event.message) return
		context.notify('warning', formatMessage(UI_FLOW_EDITOR.NOTICE_DENIED, { message: event.message }))
		map.announce(event.message)
	}) as (value: never) => void)
	watch(state.isActive, isActive => {
		if (isActive) return
		state.tool.value = 'select'
		state.label.value = null
		state.link.value = null
		state.menu.value = null
	})
}

export function useFlowEditing(
	model: FlowModelInternal,
	parts: { map: FlowMapContext; element: Readonly<Ref<HTMLElement | null>>; props: Pick<BaseFlowMapProps, 'savedAt'> },
): FlowEditing {
	const { map, element, props } = parts
	const state = useEditState(model, map)
	const env: FlowEditEnv = { model, map, element, state }
	const commands = useEditCommands(model)
	const notify = useNotices(state)
	const actions = useEditActions(env, commands, notify)
	const flags = { isClickSuppressed: false }
	const view = () => ({ viewport: map.viewport.value, box: element.value?.getBoundingClientRect() })
	const context: FlowEditContext = { env, commands, actions, notify, view, flags }
	useEditPointer(context)
	wireReject(context)
	const editing: FlowEditing = {
		context,
		savedAt: () => props.savedAt,
		hasPalette: computed(() => state.isEditing.value && !state.isCompact.value),
	}
	registry.set(model, editing)
	return editing
}

export function getFlowEditing(model: object): FlowEditing {
	const editing = registry.get(model)
	if (!editing) throw new Error('BaseFlowMap: edit state is missing')
	return editing
}

export function useEditContext(): FlowEditContext {
	return getFlowEditing(useFlowMapContext().model).context
}
