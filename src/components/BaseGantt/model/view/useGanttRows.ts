import { computed } from 'vue'
import { getLocale } from '@/locales/state'
import { boxOf, spanOf } from './ganttBoxes'
import { dependencyArrow } from './ganttLayout'
import { dependencyLabel, getDateFormat, taskLabel } from '../calendar/ganttFormat'
import type { GanttContext, GanttRowsState, GanttRowView, GanttRowWindow } from '../../types/BaseGanttModel.types'

function px(value: number): string {
	return `${value}px`
}

function renderedIndexes(window: GanttRowWindow, pinned: number, count: number): number[] {
	const indexes: number[] = []
	for (let index = window.start; index < window.end; index++) indexes.push(index)
	if (pinned >= 0 && pinned < count && !indexes.includes(pinned)) indexes.push(pinned)
	return indexes
}

export function useGanttRows(context: GanttContext, state: GanttRowsState) {
	const namesById = computed(() => new Map(context.items.value.map(other => [other.id, other.name])))

	const rowViews = computed((): GanttRowView[] => {
		const { rows, range, metrics } = context
		const draft = context.draft.value
		const format = getDateFormat(getLocale().intl, context.props.dateFormat)
		return renderedIndexes(state.window.value, state.activeIndex.value, rows.value.length).map(index => {
			const item = rows.value[index]
			const span = spanOf(item, draft)
			const box = boxOf({ span, row: index, isMilestone: item.isMilestone }, range.value, metrics.value)
			return {
				item,
				index,
				top: metrics.value.headerHeight + index * metrics.value.rowHeight,
				isActive: index === state.activeIndex.value,
				isCollapsed: state.collapsed.value.has(item.id),
				isEditing: draft?.id === item.id,
				barStyle: { left: px(box.x), width: px(box.width) },
				progressStyle: { width: `${item.progress}%` },
				label: taskLabel(item, span, format),
				dependencyText: dependencyLabel(item, namesById.value),
			}
		})
	})

	const arrows = computed(() => {
		const { rows, range, metrics } = context
		const indexById = new Map(rows.value.map((item, index) => [item.id, index]))
		const box = (index: number) => {
			const item = rows.value[index]
			return boxOf({ span: spanOf(item, context.draft.value), row: index, isMilestone: item.isMilestone }, range.value, metrics.value)
		}
		const lines: string[] = []
		const heads: string[] = []
		for (const [index, item] of rows.value.entries()) {
			for (const { id, type } of item.dependencies) {
				const from = indexById.get(id)
				if (from === undefined) continue
				const arrow = dependencyArrow(box(from), box(index), { rowHeight: metrics.value.rowHeight, type })
				lines.push(arrow.line)
				heads.push(arrow.head)
			}
		}
		return { line: lines.join(''), head: heads.join('') }
	})

	return { rowViews, arrowLines: computed(() => arrows.value.line), arrowHeads: computed(() => arrows.value.head) }
}
