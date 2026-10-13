import { computed, ref, useId } from 'vue'
import { UI_GANTT } from '@/locales/messages'
import { useGanttFocus } from './useGanttFocus'
import { useUi } from '@composables/base/useUi'
import { useGanttRows } from './view/useGanttRows'
import { useGanttStyles } from './view/useGanttStyles'
import { useGanttEditing } from './edit/useGanttEditing'
import { useGanttNavigation } from './useGanttNavigation'
import { useGanttCollapse } from './view/useGanttCollapse'
import { useGanttViewport } from './view/useGanttViewport'
import { normalizeTasks, visibleItems } from './tasks/ganttTasks'
import type { BaseGanttEmits, GanttProps } from '../types/BaseGantt.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { GanttContext, GanttDraft, GanttItem } from '../types/BaseGanttModel.types'
import { useGanttMetrics, useGanttRange, useGanttTimeline } from './view/useGanttTimeline'

const GANTT_ELEMENTS = [
	'root',
	'viewport',
	'header',
	'row',
	'name',
	'timeline',
	'bar',
	'progress',
	'milestone',
	'today',
	'dependencies',
	'status',
]
const SKELETON_ROWS = [58, 76, 44, 68, 52, 72]

export function useBaseGantt(props: GanttProps, emit: BaseGanttEmits) {
	const metrics = useGanttMetrics(props)
	const items = computed(() => normalizeTasks(props.tasks))
	const collapse = useGanttCollapse(props, emit)
	const rows = computed(() => visibleItems(items.value, collapse.collapsed.value))
	const { today, range } = useGanttRange(props, items, metrics)
	const context: GanttContext = { props, emit, items, rows, metrics, range, draft: ref<GanttDraft | null>(null) }
	const viewport = useGanttViewport(context)
	const editing = useGanttEditing(context)
	const focus = useGanttFocus(context, viewport.ensureRowVisible)
	const navigation = useGanttNavigation(context, { collapse, editing, focus })
	const timeline = useGanttTimeline(context, today)
	const rowsState = { window: viewport.window, activeIndex: focus.activeIndex, collapsed: collapse.collapsed }
	const emitClick = (item: GanttItem, event: MouseEvent): void => {
		if (!props.isDisabled) emit('task-click', item.task, event)
	}

	return {
		...useStandardBaseComponent('base-gantt', props, GANTT_ELEMENTS),
		ui: useUi(props, 'base-gantt'),
		items,
		rows,
		hintId: `${useId()}-hint`,
		skeletonRows: SKELETON_ROWS,
		gridLabel: computed((): string => props.ariaLabel || UI_GANTT.LABEL),
		...timeline,
		...useGanttStyles(context, timeline.chartWidth, timeline.bodyHeight),
		...useGanttRows(context, rowsState),
		scroller: viewport.scroller,
		onScroll: viewport.onScroll,
		grid: focus.grid,
		setActive: focus.setActive,
		onKeydown: navigation.onKeydown,
		status: editing.status,
		onPointerDown: editing.onPointerDown,
		onNameClick: emitClick,
		onBarClick(event: MouseEvent, item: GanttItem): void {
			if (!editing.consumeSuppressedClick()) emitClick(item, event)
		},
		toggle(item: GanttItem): void {
			if (!props.isDisabled) collapse.toggle(item.id)
		},
	}
}
