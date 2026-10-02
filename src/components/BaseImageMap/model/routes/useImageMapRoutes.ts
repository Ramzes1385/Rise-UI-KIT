import { computed, ref, watch } from 'vue'
import { formatMessage } from '@/locales/state'
import { routeLines, routeMarkers } from './routeView'
import { routeSteps, walkedMeters } from './routeSteps'
import { UI_IMAGE_MAP_ROUTES } from '@/locales/messages'
import type { MapCore } from '../../types/internal/imageMapInternal.types'
import type { BaseImageMapEmits, ImageMapProps } from '../../types/BaseImageMap.types'
import { buildRouteGraph, findRoutePath, isStepFree, objectNodes } from './routeGraph'
import type { ImageMapRouteResult, ImageMapRouteValue, RouteSearch } from '../../types/ImageMapRoutes.types'

const EMPTY_ROUTE: ImageMapRouteValue = { from: null, to: null, isStepFree: false }

function useRouteModel(props: ImageMapProps, emit: BaseImageMapEmits) {
	const localRoute = ref<ImageMapRouteValue>(props.route ?? EMPTY_ROUTE)
	watch(
		() => props.route,
		value => {
			localRoute.value = value ?? EMPTY_ROUTE
		},
	)
	return {
		localRoute,
		setRoute(value: ImageMapRouteValue): void {
			localRoute.value = value
			emit('update:route', value)
		},
	}
}

function useRouteSearch(props: ImageMapProps, core: MapCore, getRoute: () => ImageMapRouteValue) {
	return computed((): RouteSearch | null => {
		const { routes, layers } = props.data
		const { from: fromId, to: toId, isStepFree } = getRoute()
		const from = core.data.findObject(fromId)
		const to = core.data.findObject(toId)
		if (!routes || !from || !to || fromId === toId) return null
		const graph = buildRouteGraph({ routes, layers, isStepFree: Boolean(isStepFree) })
		const sources = objectNodes(graph, from.object, core.data.layerOf(from.object.id) as string)
		const targets = objectNodes(graph, to.object, core.data.layerOf(to.object.id) as string)
		const path = findRoutePath(graph, sources, targets)
		if (!path) return { from: from.object, to: to.object, graph, result: null }
		const metersPerWidth = routes.metersPerWidth
		const steps = routeSteps({ graph, path, from: from.object, to: to.object, layers, metersPerWidth })
		const result: ImageMapRouteResult = {
			from: from.object,
			to: to.object,
			nodes: path.nodes,
			steps,
			meters: walkedMeters(path, metersPerWidth),
		}
		return { from: from.object, to: to.object, graph, path, result }
	})
}

function pathKey(search: RouteSearch | null, route: ImageMapRouteValue): string | undefined {
	if (!search) return undefined
	const nodes = search.result ? search.result.nodes.map(node => node.id).join(',') : '-'
	return `${route.from}>${route.to}:${Boolean(route.isStepFree)}:${nodes}`
}

function resultKey(search: RouteSearch | null): string | undefined {
	if (!search) return undefined
	return search.result ? JSON.stringify(search.result) : '-'
}

function summaryText(search: RouteSearch | null): string {
	if (!search) return ''
	const names = { from: search.from.title, to: search.to.title }
	if (!search.result) return formatMessage(UI_IMAGE_MAP_ROUTES.NOT_FOUND, names)
	const meters = search.result.meters
	if (meters === undefined) return formatMessage(UI_IMAGE_MAP_ROUTES.SUMMARY, names)
	return formatMessage(UI_IMAGE_MAP_ROUTES.SUMMARY_METERS, { ...names, meters })
}

function useRouteOptions(props: ImageMapProps, core: MapCore) {
	return computed(() => {
		const layers = props.data.layers
		const items = core.data.resolved.value.filter(item => !item.isDisabled && !item.object.isHiddenInDirectory)
		return items
			.map(item => {
				const layer = layers.find(entry => entry.id === core.data.layerOf(item.object.id))
				const label =
					layers.length > 1 && layer
						? formatMessage(UI_IMAGE_MAP_ROUTES.OPTION, { name: item.object.title, layer: layer.shortTitle ?? layer.title })
						: item.object.title
				return { value: item.object.id, label }
			})
			.sort((first, second) => first.label.localeCompare(second.label))
	})
}

export function useImageMapRoutes(props: ImageMapProps, emit: BaseImageMapEmits, core: MapCore) {
	const { localRoute, setRoute } = useRouteModel(props, emit)
	const search = useRouteSearch(props, core, () => localRoute.value)

	watch(
		[() => pathKey(search.value, localRoute.value), () => resultKey(search.value)],
		([path], [previousPath]) => {
			if (path === undefined && previousPath === undefined) return
			emit('route-change', search.value?.result ?? null)
			const layer = search.value?.result?.steps[0]?.layer
			if (layer && path !== previousPath) core.actions.setLayer(layer)
		},
		{ immediate: true },
	)

	const currentPath = computed(() => {
		const value = search.value
		const layer = core.data.currentLayer.value
		return value?.path && layer ? { graph: value.graph, path: value.path, layer } : null
	})

	return {
		route: localRoute,
		setRoute,
		routeOptions: useRouteOptions(props, core),
		routeSteps: computed(() => search.value?.result?.steps ?? []),
		routeSummary: computed(() => summaryText(search.value)),
		isRouteUnreachable: computed(() => Boolean(search.value && !search.value.result)),
		hasStepFree: computed(() => {
			const transitions = props.data.routes?.transitions ?? []
			return transitions.some(isStepFree) && !transitions.every(isStepFree)
		}),
		routeLines: computed(() =>
			currentPath.value ? routeLines(currentPath.value.graph, currentPath.value.path, currentPath.value.layer) : [],
		),
		routeMarkers: computed(() =>
			currentPath.value ? routeMarkers(currentPath.value.graph, currentPath.value.path, currentPath.value.layer.id) : [],
		),
		showRouteLayer: (layer: string): void => core.actions.setLayer(layer),
		routeExpose: {
			showRoute: (from: string, to: string): void => setRoute({ ...localRoute.value, from, to }),
			clearRoute: (): void => setRoute({ ...EMPTY_ROUTE, isStepFree: localRoute.value.isStepFree }),
		},
	}
}
