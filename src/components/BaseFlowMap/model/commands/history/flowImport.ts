import { importCommand } from '../flowLayoutCommands'
import { createCommandEnv } from '../useFlowCommands'
import { migrateFlowData } from '../../data/flowMigrate'
import { validateFlowData } from '../../data/flowValidate'
import { normalizeFlowData } from '../../data/flowNormalize'
import { hookReject, refuse } from '../../execute/flowReject'
import type { FlowDataIssue } from '../../../types/api/flowNotation.types'
import type { FlowImportResult } from '../../../types/api/flowController.types'
import type { FlowCommandParts } from '../../../types/internal/core/flowModelCore.types'

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

export async function importData(parts: FlowCommandParts, input: unknown): Promise<FlowImportResult> {
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
