import { shallowRef, watch } from 'vue'
import { UI_FLOW_MAP } from '@/locales/messages'
import { createFlowId } from '../../data/flowIds'
import { diffFlowData } from '../../data/flowDiff'
import { normalizeFlowData } from '../../data/flowNormalize'
import { hookReject, refuse } from '../../execute/flowReject'
import type { FlowMapData } from '../../../types/data/flowData.types'
import type { FlowSuggestion } from '../../../types/data/flowReview.types'
import type { FlowCommandResult } from '../../../types/api/flowController.types'
import type { FlowReviewApi, FlowReviewParts, FlowSuggestionStore } from '../../../types/internal/core/flowModelCore.types'

function createStore(parts: FlowReviewParts): FlowSuggestionStore {
	const { props, events } = parts
	const list = shallowRef<FlowSuggestion[]>([...(props.suggestions ?? [])])
	watch(
		() => props.suggestions,
		value => (list.value = [...(value ?? [])]),
	)
	return {
		list,
		update(id, patch) {
			const found = list.value.find(item => item.id === id)
			if (!found) return undefined
			const next = { ...found, ...patch }
			list.value = list.value.map(item => (item.id === id ? next : item))
			events.emit('update:suggestions', list.value)
			return next
		},
	}
}

async function acceptSuggestion(parts: FlowReviewParts, store: FlowSuggestionStore, found: FlowSuggestion): Promise<FlowCommandResult> {
	const { acceptCommand } = await import('../../commands/flowLayoutCommands')
	const outcome = await parts.hooks.run('beforeAccept', { suggestion: found }, found)
	const command = acceptCommand(outcome.value)
	if (outcome.isCancelled) return refuse(parts.events, hookReject(command, 'beforeAccept'))
	const result = await parts.execute(command)
	const accepted = result.isApplied ? store.update(found.id, { status: 'accepted' }) : undefined
	if (accepted) parts.events.emit('accept', accepted)
	return result
}

function loadVersion(parts: FlowReviewParts, data: FlowMapData): FlowMapData {
	const { notation, registry } = parts.state
	return normalizeFlowData(data, registry.value.get(data.notation ?? '') ?? notation.value, registry.value)
}

export function createReviewApi(parts: FlowReviewParts): FlowReviewApi {
	const { props, state, events, draft } = parts
	const store = createStore(parts)
	return {
		suggest(changes, label) {
			if (changes.length === 0 || !props.currentUser) return null
			const id = createFlowId('s', new Set(store.list.value.map(item => item.id)))
			const suggestion: FlowSuggestion = {
				id,
				author: props.currentUser,
				date: Date.now(),
				label: label ?? UI_FLOW_MAP.SUGGESTION_DEFAULT,
				changes,
				status: 'open',
			}
			store.list.value = [...store.list.value, suggestion]
			if (draft.value?.changes === changes) draft.value = null
			events.emit('update:suggestions', store.list.value)
			return suggestion
		},
		async accept(id) {
			const found = store.list.value.find(item => item.id === id && item.status === 'open')
			return found ? acceptSuggestion(parts, store, found) : { isApplied: false, changes: [] }
		},
		decline(id) {
			const declined = store.update(id, { status: 'declined' })
			if (declined) events.emit('decline', declined)
		},
		compare(base, target) {
			if (base === null) return []
			const versions = props.versions ?? []
			const before = versions.find(item => item.id === base)?.data
			const after = target === undefined ? state.data.value : versions.find(item => item.id === target)?.data
			return before && after ? diffFlowData(loadVersion(parts, before), loadVersion(parts, after)) : []
		},
	}
}
