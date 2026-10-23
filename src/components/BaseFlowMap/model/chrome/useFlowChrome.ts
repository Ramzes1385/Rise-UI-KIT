import { computed, provide, ref } from 'vue'
import { UI_FLOW_MAP } from '@/locales/messages'
import { useFlowLevelBar } from './useFlowLevelBar'
import { FLOW_CHROME_CONTEXT } from '../context/flowContext'
import type { FlowMode } from '../../types/api/flowController.types'
import type { FlowMapContext } from '../../types/internal/flowModel.types'
import type { BaseFlowMapProps, FlowMapPanel } from '../../types/BaseFlowMap.types'
import type {
	FlowCanvasParts,
	FlowChromeContext,
	FlowModeItem,
	FlowModelInternal,
	FlowPickApi,
} from '../../types/internal/core/flowRenderInternal.types'

const DEFAULT_PANELS: FlowMapPanel[] = ['toolbar', 'minimap', 'legend', 'scenario', 'details']
const MAX_RESULTS = 8
const STEP = 1.25

function modeLabel(mode: FlowMode): string {
	if (mode === 'edit') return UI_FLOW_MAP.MODE_EDIT
	return mode === 'review' ? UI_FLOW_MAP.MODE_REVIEW : UI_FLOW_MAP.MODE_VIEW
}

function usePanels(props: Pick<BaseFlowMapProps, 'panels'>) {
	const has = (panel: FlowMapPanel) => computed(() => (props.panels ?? DEFAULT_PANELS).includes(panel))
	return {
		hasToolbar: has('toolbar'),
		hasSearch: has('search'),
		hasList: has('list'),
		hasMinimap: has('minimap'),
		hasLegend: has('legend'),
		hasScenario: has('scenario'),
		hasDetails: has('details'),
	}
}

function useSearch(model: FlowModelInternal, map: FlowMapContext, pick: FlowPickApi) {
	const query = ref('')
	const results = computed(() => {
		const text = query.value.trim().toLowerCase()
		if (!text) return []
		return model.data.value.nodes
			.filter(node => node.label.toLowerCase().includes(text) || node.id.toLowerCase().includes(text))
			.slice(0, MAX_RESULTS)
			.map(node => ({ id: node.id, title: node.label, description: node.subtitle, icon: node.icon }))
	})
	function choose(id: string): void {
		model.controller.focus(id, { isZoomed: true, isAnimated: true })
		pick.pick({ entity: 'node', id })
		map.openDetails({ entity: 'node', id })
	}
	return { query, results, choose }
}

export function useFlowChrome(
	props: Pick<BaseFlowMapProps, 'panels' | 'modes'>,
	parts: Pick<FlowCanvasParts, 'model' | 'map' | 'view' | 'pick' | 'ui'>,
): FlowChromeContext {
	const { model, map, view, pick, ui } = parts
	const title = computed(() => model.data.value.title)
	const modes = computed<FlowModeItem[]>(() =>
		(props.modes ?? []).map(value => ({ value, label: modeLabel(value), isActive: model.mode.value === value })),
	)
	const context: FlowChromeContext = {
		ui,
		controller: model.controller,
		isCompact: map.isCompact,
		...usePanels(props),
		...useSearch(model, map, pick),
		...useFlowLevelBar(model, () => map.isCompact.value),
		title,
		modes,
		hasHeader: computed(() => Boolean(title.value) || modes.value.length > 0),
		setMode: mode => model.events.emit('update:mode', mode),
		percent: view.percent,
		zoomIn: () => view.zoomBy(STEP),
		zoomOut: () => view.zoomBy(1 / STEP),
		fit: () => view.fit(),
		isEmpty: computed(() => model.data.value.nodes.length === 0),
	}
	provide(FLOW_CHROME_CONTEXT, context)
	return context
}
