import { formatMessage } from '@/locales/state'
import { normalizeLayout } from './dashboardLayout'
import { UI_DASHBOARD_GRID } from '@/locales/messages'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { breakpointFor, colsFor, createMetrics, pickLayout, resolveBreakpoints } from './dashboardGeometry'
import type {
	BaseDashboardGridEmits,
	DashboardAnnouncement,
	DashboardChangeAction,
	DashboardGridProps,
	DashboardGridState,
	DashboardLayout,
	DashboardLayoutItem,
	DashboardLayoutRules,
} from '../../types/BaseDashboardGrid.types'

function useDashboardGridSize(props: DashboardGridProps) {
	const rootRef = ref<HTMLElement | null>(null)
	const width = ref(0)
	const observers: ResizeObserver[] = []
	const breakpoint = computed(() => (props.layouts ? breakpointFor(width.value, resolveBreakpoints(props.breakpoints)) : 'lg'))
	const cols = computed(() => colsFor(props.cols, breakpoint.value))
	const metrics = computed(() => {
		const unit = props.sizeScale / 100
		return createMetrics(width.value, cols.value, { rowHeight: props.rowHeight * unit, gap: props.gap * unit })
	})

	function measure(): void {
		width.value = (rootRef.value as HTMLElement).clientWidth
	}

	onMounted(() => {
		measure()
		observers.push(new ResizeObserver(measure))
		observers[0].observe(rootRef.value as HTMLElement)
	})
	onBeforeUnmount(() => observers.forEach(observer => observer.disconnect()))

	return { rootRef, breakpoint, cols, metrics }
}

export function useDashboardGridState(props: DashboardGridProps, emit: BaseDashboardGridEmits) {
	const { rootRef, breakpoint, cols, metrics } = useDashboardGridSize(props)
	const rules = (): DashboardLayoutRules => ({ cols: cols.value, compactType: props.compactType })
	const source = computed(() => (props.layouts ? pickLayout(props.layouts, breakpoint.value) : props.layout) ?? [])
	const layout = shallowRef<DashboardLayout>(normalizeLayout(source.value, rules()))
	const draft = shallowRef<DashboardLayout | null>(null)
	const announcement = ref('')
	const isInteractive = computed(() => props.isEditable && !props.isDisabled)

	function itemName(item: DashboardLayoutItem): string {
		const index = layout.value.findIndex(other => other.id === item.id)
		return item.label ?? formatMessage(UI_DASHBOARD_GRID.ITEM, { n: index + 1 })
	}

	function announce(message: DashboardAnnouncement, item: DashboardLayoutItem): void {
		const params = { item: itemName(item), x: item.x + 1, y: item.y + 1, w: item.w, h: item.h }
		announcement.value = formatMessage(UI_DASHBOARD_GRID[message], params)
	}

	function commit(next: DashboardLayout, id: string, action: DashboardChangeAction): void {
		layout.value = next
		draft.value = null
		const layouts = props.layouts ? { ...props.layouts, [breakpoint.value]: next } : undefined
		emit('update:layout', next)
		if (layouts) emit('update:layouts', layouts)
		emit('change', { layout: next, layouts, breakpoint: breakpoint.value, id, action })
	}

	watch([source, cols, () => props.compactType], () => {
		layout.value = normalizeLayout(source.value, rules())
		draft.value = null
	})

	const state: DashboardGridState = { rootRef, layout, draft, metrics, isInteractive, rules, announce, commit }
	return { state, announcement, itemName }
}
