import { depthOf } from './groupTree'
import type { FlowGroup } from '../../../types/data/flowData.types'
import type { FlowSemanticEntry } from '../../../types/internal/flowGroups.types'

export function levelAtZoom(entries: readonly FlowSemanticEntry[], zoom: number): number {
	const index = entries.findIndex(entry => entry.minZoom > zoom)
	return index < 0 ? entries.length : index
}

export function depthOfLevel(entries: readonly FlowSemanticEntry[], level: number): number {
	return entries[level]?.depth ?? Number.POSITIVE_INFINITY
}

export function levelForDepth(entries: readonly FlowSemanticEntry[], depth: number): number {
	const index = entries.findIndex(entry => entry.depth > depth)
	return index < 0 ? entries.length : index
}

export function collapsedByDepth(groups: readonly FlowGroup[], depth: number): string[] {
	if (!Number.isFinite(depth)) return []
	const byId = new Map(groups.map(group => [group.id, group]))
	return groups.filter(group => depthOf(group.id, byId) >= depth).map(group => group.id)
}

export function levelZoom(entries: readonly FlowSemanticEntry[], level: number, limits: { min: number; max: number }): number {
	const low = level === 0 ? limits.min : entries[level - 1].minZoom
	const wanted = level >= entries.length ? Math.max(low * 1.2, 1) : Math.sqrt(low * entries[level].minZoom)
	return Math.min(Math.max(wanted, limits.min), limits.max)
}
