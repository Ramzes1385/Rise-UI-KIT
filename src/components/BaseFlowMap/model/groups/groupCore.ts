import { computed, shallowRef } from 'vue'
import { indexGroups } from './tree/groupTree'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowLevelState } from '../../types/api/flowController.types'
import { collapsedByDepth, depthOfLevel, levelAtZoom } from './tree/semanticLevels'
import type { FlowGroupBase, FlowGroupCore, FlowGroupSource, FlowSemanticEntry } from '../../types/internal/flowGroups.types'

function levelLabels(entries: readonly FlowSemanticEntry[], last: (() => string) | undefined): string[] {
	const fallback = (index: number): string => formatMessage(UI_FLOW_MAP.LEVEL_NAME, { n: index + 1 })
	return [...entries.map((entry, index) => entry.label?.() ?? fallback(index)), last?.() ?? fallback(entries.length)]
}

function collapsedSet(base: FlowGroupBase): ReadonlySet<string> {
	const groups = base.source.data().groups ?? []
	const set = new Set(groups.filter(group => group.isCollapsed).map(group => group.id))
	if (base.entries.value.length > 0) {
		for (const id of collapsedByDepth(groups, depthOfLevel(base.entries.value, base.index.value))) set.add(id)
	}
	for (const [id, value] of base.overrides.value) {
		if (!base.byId.value.has(id)) continue
		if (value) set.add(id)
		else set.delete(id)
	}
	return set
}

function validPath(base: FlowGroupBase, collapsed: ReadonlySet<string>): string[] {
	const valid: string[] = []
	for (const id of base.trail.value) {
		if (!base.byId.value.has(id) || collapsed.has(id)) break
		valid.push(id)
	}
	return valid
}

function levelOf(base: FlowGroupBase, path: string[]): FlowLevelState {
	const { entries, index, source } = base
	const count = entries.value.length === 0 ? 0 : entries.value.length + 1
	const labels = count === 0 ? [] : levelLabels(entries.value, source.notation().semanticZoomLabel)
	return { index: index.value, count, label: labels[index.value] ?? '', labels, path }
}

export function createGroupCore(source: FlowGroupSource): FlowGroupCore {
	const zoom = shallowRef(1)
	const pin = shallowRef<FlowGroupBase['pin']['value']>(null)
	const byId = computed(() => indexGroups(source.data().groups ?? []))
	const entries = computed(() => (source.isEnabled() ? (source.notation().semanticZoom ?? []) : []))
	const index = computed(() => (entries.value.length === 0 ? 0 : (pin.value?.level ?? levelAtZoom(entries.value, zoom.value))))
	const base: FlowGroupBase = {
		...{ source, zoom, pin, byId, entries, index },
		...{ overrides: shallowRef(new Map()), trail: shallowRef([]), isTouched: shallowRef(false) },
	}
	const collapsed = computed(() => collapsedSet(base))
	const path = computed(() => validPath(base, collapsed.value))
	return { ...base, collapsed, path, level: computed(() => levelOf(base, path.value)) }
}
