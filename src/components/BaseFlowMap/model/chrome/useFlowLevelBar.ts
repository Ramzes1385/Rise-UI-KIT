import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowCrumbItem, FlowLevelBarParts, FlowLevelButton } from '../../types/internal/core/flowRenderInternal.types'

function crumbList(parts: FlowLevelBarParts): FlowCrumbItem[] {
	const { path } = parts.level.value
	const root = parts.data.value.title ?? UI_FLOW_MAP.DEFAULT_LABEL
	const names = [root, ...path.map(id => parts.graph.value.groups.get(id)?.label ?? id)]
	return names.map((label, depth) => ({ key: `${depth}`, label, depth, isCurrent: depth === names.length - 1, isEllipsis: false }))
}

function shortCrumbs(list: FlowCrumbItem[]): FlowCrumbItem[] {
	if (list.length <= 2) return list
	return [{ key: 'more', label: '…', depth: 0, isCurrent: false, isEllipsis: true }, ...list.slice(-2)]
}

function levelList(parts: FlowLevelBarParts): FlowLevelButton[] {
	const { labels, index } = parts.level.value
	return labels.map((label, position) => ({
		index: position,
		label,
		text: formatMessage(UI_FLOW_MAP.LEVEL_BUTTON, { n: position + 1, name: label }),
		isActive: position === index,
	}))
}

export function useFlowLevelBar(parts: FlowLevelBarParts, isCompact: () => boolean) {
	const crumbs = computed(() => (isCompact() ? shortCrumbs(crumbList(parts)) : crumbList(parts)))
	const levels = computed(() => levelList(parts))
	return {
		level: parts.level,
		crumbs,
		levels,
		hasLevelBar: computed(() => parts.level.value.count > 0 || parts.level.value.path.length > 0),
		goCrumb: (depth: number) => parts.controller.leaveGroup(depth),
		goLevel: (index: number) => parts.controller.setLevel(index),
	}
}
