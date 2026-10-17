import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowMapData } from '../../types/data/flowData.types'
import { FLOW_DATA_VERSION } from '../../types/data/flowData.types'
import type { FlowDataIssue } from '../../types/api/flowNotation.types'
import type { FlowMigration } from '../../types/internal/core/flowCore.types'

export const FLOW_MIGRATIONS: Record<number, FlowMigration> = {}

function emptyData(): FlowMapData {
	return { version: FLOW_DATA_VERSION, nodes: [], edges: [] }
}

function ensureCollections(source: Record<string, unknown>, issues: FlowDataIssue[]): Record<string, unknown> {
	const result = { ...source }
	for (const name of ['nodes', 'edges']) {
		if (Array.isArray(result[name])) continue
		result[name] = []
		const message = formatMessage(UI_FLOW_MAP.ISSUE_COLLECTION_MISSING, { name })
		issues.push({ level: 'warning', code: 'collection-missing', message })
	}
	return result
}

function runMigrations(source: Record<string, unknown>, from: number): Record<string, unknown> {
	let current = source
	for (let version = from; version < FLOW_DATA_VERSION; version += 1) {
		current = { ...(FLOW_MIGRATIONS[version]?.(current) ?? current), version: version + 1 }
	}
	return current
}

function readVersion(source: Record<string, unknown>, issues: FlowDataIssue[]): number {
	const version = source.version
	if (typeof version === 'number' && Number.isFinite(version)) return version
	const message = formatMessage(UI_FLOW_MAP.ISSUE_VERSION_MISSING, { version: FLOW_DATA_VERSION })
	issues.push({ level: 'warning', code: 'version-missing', message })
	return FLOW_DATA_VERSION
}

export function migrateFlowData(input: unknown): { data: FlowMapData; issues: FlowDataIssue[] } {
	const issues: FlowDataIssue[] = []
	if (typeof input !== 'object' || input === null || Array.isArray(input)) {
		issues.push({ level: 'error', code: 'invalid-data', message: UI_FLOW_MAP.ISSUE_INVALID_DATA })
		return { data: emptyData(), issues }
	}
	const source = ensureCollections(input as Record<string, unknown>, issues)
	const version = readVersion(source, issues)
	if (version > FLOW_DATA_VERSION) {
		const message = formatMessage(UI_FLOW_MAP.ISSUE_VERSION_UNSUPPORTED, { found: version, supported: FLOW_DATA_VERSION })
		issues.push({ level: 'error', code: 'version-unsupported', message })
		return { data: source as unknown as FlowMapData, issues }
	}
	return { data: runMigrations({ ...source, version }, version) as unknown as FlowMapData, issues }
}
