import { computed, ref } from 'vue'
import { panelsSource } from './detailsView'
import { buildLegendRows } from './legendRows'
import { UI_FLOW_PANELS } from '@/locales/messages'
import { useFlowMapContext } from '../context/flowContext'

export function useFlowLegend() {
	const context = useFlowMapContext()
	const userOpen = ref<boolean | null>(null)

	const rows = computed(() => buildLegendRows(panelsSource(context)))
	const isCompact = context.isCompact
	const isOpen = computed(() => userOpen.value ?? !isCompact.value)
	const nodeRows = computed(() => rows.value.filter(row => row.entity === 'node'))
	const edgeRows = computed(() => rows.value.filter(row => row.entity === 'edge'))
	const statusRows = computed(() => rows.value.filter(row => row.entity === 'status'))

	function toggle(): void {
		userOpen.value = !isOpen.value
	}

	return {
		isCompact,
		isOpen,
		hasRows: computed(() => rows.value.length > 0),
		nodeRows,
		edgeRows,
		statusRows,
		toggle,
		label: computed(() => UI_FLOW_PANELS.LEGEND),
		toggleLabel: computed(() => (isOpen.value ? UI_FLOW_PANELS.LEGEND_HIDE : UI_FLOW_PANELS.LEGEND_SHOW)),
	}
}
