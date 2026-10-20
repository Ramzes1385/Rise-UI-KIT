import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import { applyFlowChanges } from '../data/flowChanges'
import type { FlowChange } from '../../types/data/flowReview.types'
import type { FlowCommandParts, FlowHistoryApi } from '../../types/internal/core/flowModelCore.types'

function applyRemote(parts: FlowCommandParts, changes: FlowChange[]): void {
	const next = applyFlowChanges(parts.state.data.value, changes)
	parts.state.commit(next)
	parts.events.emit('update:data', next)
	parts.events.emit('change', { changes, source: 'remote', command: 'remote', data: next })
}

async function transact(parts: FlowCommandParts, label: string, run: () => Promise<void> | void) {
	const collected: FlowChange[] = []
	const off = parts.events.subscribe('change', ((event: { changes: FlowChange[] }) => collected.push(...event.changes)) as (
		value: never,
	) => void)
	try {
		await parts.history.transact(label, run)
	} finally {
		off()
	}
	return { isApplied: collected.length > 0, changes: collected }
}

export function createHistoryApi(parts: FlowCommandParts): FlowHistoryApi {
	const step = (direction: 'undo' | 'redo'): void => {
		const state = parts.history.state.value
		const label = direction === 'undo' ? state.undoLabel : state.redoLabel
		const isDone = parts.history[direction]()
		if (!isDone || !label) return
		const text = direction === 'undo' ? UI_FLOW_MAP.ANNOUNCE_UNDO : UI_FLOW_MAP.ANNOUNCE_REDO
		parts.announce(formatMessage(text, { label }))
	}
	return {
		transact: (label, run) => transact(parts, label, run),
		applyRemote: changes => applyRemote(parts, changes),
		undo: () => step('undo'),
		redo: () => step('redo'),
		getHistory: () => ({ ...parts.history.state.value }),
		clearHistory: () => parts.history.clear(),
		importJson: input => import('./flowImport').then(({ importData }) => importData(parts, input)),
	}
}
