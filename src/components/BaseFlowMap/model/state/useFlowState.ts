import { warn } from '@/locales/warn'
import type { ComputedRef } from 'vue'
import { pluralize } from '@/locales/state'
import { buildFlowGraph } from '../data/flowGraph'
import { flowServices } from '../notations/services'
import { migrateFlowData } from '../data/flowMigrate'
import { computed, ref, shallowRef, watch } from 'vue'
import { validateFlowData } from '../data/flowValidate'
import { normalizeFlowData } from '../data/flowNormalize'
import { createLayoutRegistry } from '../layout/registry'
import { createRouterRegistry } from '../routing/registry'
import { UI_FLOW_MAP, UI_PLURAL } from '@/locales/messages'
import { collapseFlowData } from '../groups/tree/collapseData'
import { createNotationRegistry } from '../notations/registry'
import { useFlowGroupState } from '../groups/useFlowGroupState'
import type { FlowMapData } from '../../types/data/flowData.types'
import type { FlowModelProps } from '../../types/internal/flowModel.types'
import type { FlowState } from '../../types/internal/core/flowModelCore.types'
import { applyNotationStyle, withCollapsedKind } from '../notations/resolveKind'
import type { FlowDataIssue, FlowNotation } from '../../types/api/flowNotation.types'

function pickNotation(registry: ReadonlyMap<string, FlowNotation>, id: string | undefined): FlowNotation {
	return registry.get(id ?? flowServices.id) ?? flowServices
}

function loadFlowData(raw: unknown, registry: ReadonlyMap<string, FlowNotation>): { data: FlowMapData; issues: FlowDataIssue[] } {
	const migrated = migrateFlowData(raw)
	const id = migrated.data.notation
	if (id !== undefined && !registry.has(id)) warn(UI_FLOW_MAP.WARN_UNKNOWN_NOTATION, { id, fallback: flowServices.id })
	const notation = pickNotation(registry, id)
	return { data: normalizeFlowData(migrated.data, notation, registry), issues: migrated.issues }
}

function useRegistries(props: FlowModelProps) {
	const plugins = computed(() => props.plugins ?? [])
	const registry = computed(() =>
		createNotationRegistry(flowServices, [...(props.notations ?? []), ...plugins.value.flatMap(plugin => plugin.notations ?? [])]),
	)
	const layouts = computed(() =>
		createLayoutRegistry([
			...[...registry.value.values()].flatMap(notation => notation.layouts ?? []),
			...plugins.value.flatMap(plugin => plugin.layouts ?? []),
		]),
	)
	const routers = computed(() => createRouterRegistry(plugins.value.flatMap(plugin => plugin.routers ?? [])))
	return { plugins, registry, layouts, routers }
}

function useOverlay(props: FlowModelProps) {
	const selection = ref<string[]>([...(props.selection ?? [])])
	watch(
		() => props.selection,
		value => (selection.value = [...(value ?? [])]),
	)
	const live = shallowRef(props.live ?? {})
	watch(
		() => props.live,
		value => (live.value = value ?? {}),
	)
	return { selection, live, highlighted: shallowRef<ReadonlySet<string>>(new Set()), mode: computed(() => props.mode ?? 'view') }
}

function useLoadedData(props: FlowModelProps, registry: ComputedRef<Map<string, FlowNotation>>, onLoad: (issues: FlowDataIssue[]) => void) {
	const first = loadFlowData(props.data, registry.value)
	const data = shallowRef(first.data)
	let committed: FlowMapData | null = null
	watch(
		() => [props.data, registry.value],
		() => {
			if (props.data === committed) return
			const loaded = loadFlowData(props.data, registry.value)
			data.value = loaded.data
			onLoad(loaded.issues)
		},
		{ flush: 'sync' },
	)
	onLoad(first.issues)
	const commit = (next: FlowMapData): void => {
		committed = next
		data.value = next
	}
	return { data, commit }
}

export function useFlowState(props: FlowModelProps, onLoad: (issues: FlowDataIssue[]) => void, isCompact?: () => boolean): FlowState {
	const { plugins, registry, layouts, routers } = useRegistries(props)
	const { data, commit } = useLoadedData(props, registry, onLoad)
	const notation = computed(() =>
		withCollapsedKind(applyNotationStyle(pickNotation(registry.value, data.value.notation), data.value.layout?.options?.style)),
	)
	const texts = {
		items: (count: number) => pluralize(UI_PLURAL.FLOW_ITEMS, count),
		links: (count: number) => pluralize(UI_PLURAL.FLOW_LINKS, count),
	}
	const groups = useFlowGroupState({
		data: () => data.value,
		notation: () => notation.value,
		isEnabled: () => props.isSemanticZoom !== false,
		texts,
	})
	const shown = computed(() => collapseFlowData(data.value, groups.collapsed.value, texts))
	const graph = computed(() => buildFlowGraph(data.value))
	const issues = computed(() => [
		...validateFlowData(data.value, notation.value, registry.value),
		...plugins.value.flatMap(plugin => (plugin.validators ?? []).flatMap(validate => validate(data.value, graph.value))),
	])
	const scope = computed(() => ({
		data: shown.value,
		notation: notation.value,
		registry: registry.value,
		layouts: layouts.value,
		routers: routers.value,
		overrides: props.layout,
		isCompact: isCompact?.() ?? false,
	}))
	return { data, shown, groups, registry, notation, graph, issues, scope, ...useOverlay(props), commit }
}
