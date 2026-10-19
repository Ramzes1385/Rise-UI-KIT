import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import { importCommand } from './flowLayoutCommands'
import { createCommandEnv } from './useFlowCommands'
import { migrateFlowData } from '../data/flowMigrate'
import { applyFlowChanges } from '../data/flowChanges'
import { validateFlowData } from '../data/flowValidate'
import { normalizeFlowData } from '../data/flowNormalize'
import { hookReject, refuse } from '../execute/flowReject'
import type { FlowChange } from '../../types/data/flowReview.types'
import type { FlowDataIssue } from '../../types/api/flowNotation.types'
import type { FlowImportResult } from '../../types/api/flowController.types'
import type { FlowCommandParts, FlowHistoryApi } from '../../types/internal/core/flowModelCore.types'

function parse(json: string): unknown {
	try {
		return JSON.parse(json)
	} catch {
		return null
	}
}

function failed(parts: FlowCommandParts, issues: FlowDataIssue[]): FlowImportResult {
	for (const { code, message } of issues.filter(issue => issue.level === 'error').slice(0, 1))
		parts.events.emit('error', { code, message })
	return { isApplied: false, changes: [], issues }
}

async function importData(parts: FlowCommandParts, input: unknown): Promise<FlowImportResult> {
	const migrated = migrateFlowData(typeof input === 'string' ? parse(input) : input)
	const { notation, registry } = parts.state
	const normalized = normalizeFlowData(migrated.data, registry.value.get(migrated.data.notation ?? '') ?? notation.value, registry.value)
	const issues = [
		...migrated.issues,
		...validateFlowData(normalized, registry.value.get(normalized.notation ?? '') ?? notation.value, registry.value),
	]
	if (issues.some(issue => issue.level === 'error')) return failed(parts, issues)
	const command = importCommand(normalized, createCommandEnv(parts, 'api'))
	const outcome = await parts.hooks.run('beforeImport', { data: normalized, issues }, normalized)
	if (outcome.isCancelled) return { ...refuse(parts.events, hookReject(command, 'beforeImport')), issues }
	const result = await parts.execute(importCommand(outcome.value, createCommandEnv(parts, 'api')))
	return { ...result, issues }
}

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
		importJson: input => importData(parts, input),
	}
}
