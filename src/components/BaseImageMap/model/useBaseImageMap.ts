import { useUi } from '@composables/base/useUi'
import { UI_IMAGE_MAP } from '@/locales/messages'
import { useImageMapSvg } from './svg/useImageMapSvg'
import { useImageMapPan } from './zoom/useImageMapPan'
import { useMotion } from '@composables/app/useMotion'
import { computed, ref, shallowRef, watch } from 'vue'
import { useImageMapData } from './data/useImageMapData'
import { useImageMapView } from './zoom/useImageMapView'
import { useImageMapObjects } from './useImageMapObjects'
import { useImageMapHours } from './hours/useImageMapHours'
import { useImageMapRoutes } from './routes/useImageMapRoutes'
import { useDirectoryPart } from './directory/useDirectoryPart'
import { useImageMapGestures } from './zoom/useImageMapGestures'
import { useImageMapFocus } from './interaction/useImageMapFocus'
import { useImageMapFilters } from './directory/useImageMapFilters'
import { useImageMapEvents } from './interaction/useImageMapEvents'
import { useImageMapFullscreen } from './zoom/useImageMapFullscreen'
import { useImageMapOverlay } from './interaction/useImageMapOverlay'
import type BaseButton from '@components/BaseButton/ui/BaseButton.vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { areaZoom, useImageMapActions } from './interaction/useImageMapActions'
import type { ResolvedImageMapObject } from '../types/internal/imageMapModel.types'
import type { BaseImageMapEmits, BaseImageMapExpose, ImageMapProps } from '../types/BaseImageMap.types'

const CLASS_KEYS = [
	'root',
	'toolbar',
	'layers',
	'zoom',
	'viewport',
	'stage',
	'object',
	'point',
	'tooltip',
	'popup',
	'directory',
	'filters',
	'legend',
	'route',
]

function useRefs() {
	return {
		rootRef: ref<HTMLElement | null>(null),
		viewportRef: ref<HTMLElement | null>(null),
		stageRef: ref<HTMLElement | null>(null),
		svgContainerRef: ref<HTMLElement | null>(null),
		zoomInRef: ref<InstanceType<typeof BaseButton> | null>(null),
		renderedSvgIds: shallowRef<ReadonlySet<string>>(new Set()),
	}
}

function wheelHint(): string {
	const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
	return isMac ? UI_IMAGE_MAP.WHEEL_HINT_MAC : UI_IMAGE_MAP.WHEEL_HINT
}

export function useMapCore(props: ImageMapProps, emit: BaseImageMapEmits) {
	const refs = useRefs()
	const hours = useImageMapHours(props)
	const filters = useImageMapFilters(props, emit, hours.isOpenNow)
	const data = useImageMapData(props, filters.isShown)
	const zoom = useImageMapView({
		viewportRef: refs.viewportRef,
		getLayer: () => data.currentLayer.value,
		getMaxZoom: () => props.maxZoom,
		getInitArea: () => props.initArea,
	})
	const overlay = useImageMapOverlay({
		...refs,
		findObject: data.findObject,
		hasTooltip: () => props.hasTooltip,
		getSheetBreakpoint: () => props.sheetBreakpoint,
	})
	const actions = useImageMapActions(props, emit, {
		...refs,
		...data,
		openPopup: overlay.openPopup,
		zoomTo: areaZoom(refs.stageRef, zoom.zoomToArea),
	})
	const focus = useImageMapFocus({
		...refs,
		getView: () => data.view.value,
		getActive: () => actions.localActive.value,
		getRenderedSvgIds: () => refs.renderedSvgIds.value,
	})
	const gestures = useImageMapGestures({ ...refs, getWheelMode: () => props.wheelZoom, onInteract: overlay.hideTooltip }, zoom)
	return { refs, hours, filters, data, zoom, overlay, actions, focus, gestures }
}

function usePresentation(props: ImageMapProps, data: ReturnType<typeof useImageMapData>, overlay: ReturnType<typeof useImageMapOverlay>) {
	return {
		layerOptions: computed(() => props.data.layers.map(layer => ({ value: layer.id, label: layer.shortTitle ?? layer.title }))),
		mapLabel: computed(() => props.ariaLabel ?? data.currentLayer.value?.title ?? UI_IMAGE_MAP.LABEL),
		viewportStyle: computed((): Record<string, string> => {
			const layer = data.currentLayer.value
			if (props.height) return { height: props.height }
			return layer ? { aspectRatio: `${layer.width} / ${layer.height}` } : {}
		}),
		tooltipView: computed(() => {
			const tooltip = overlay.tooltip.value
			if (!tooltip) return null
			const { left, top, width, height } = tooltip.box
			return { item: tooltip.item, style: { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` } }
		}),
	}
}

function useObjectsPart(props: ImageMapProps, core: ReturnType<typeof useMapCore>) {
	const { data, overlay, actions, focus } = core
	return useImageMapObjects({
		getView: () => data.view.value,
		getState: (item: ResolvedImageMapObject) => ({
			isTabbable: focus.tabbableId.value === item.object.id,
			isActive: actions.localActive.value === item.object.id,
			isHovered: overlay.hoverId.value === item.object.id,
			describedBy: overlay.tooltipId.value === item.object.id ? overlay.tooltipDomId : undefined,
			isPulsing: props.isPulsing || Boolean(item.object.type === 'point' && item.object.isPulsing),
		}),
	})
}

function useViewportFocus(core: ReturnType<typeof useMapCore>): void {
	const { refs, zoom, focus } = core
	watch(
		() => zoom.isMinZoom.value,
		isMinZoom => {
			if (!isMinZoom || document.activeElement !== refs.viewportRef.value) return
			if (focus.tabbableId.value) focus.focusObject(focus.tabbableId.value)
			else refs.zoomInRef.value?.focus()
		},
	)
}

export function useBaseImageMap(props: ImageMapProps, emit: BaseImageMapEmits) {
	const core = useMapCore(props, emit)
	const { refs, data, zoom, overlay, actions, focus, gestures } = core
	const objects = useObjectsPart(props, core)
	useViewportFocus(core)
	const svg = useImageMapSvg({
		getLayer: () => data.currentLayer.value,
		containerRef: refs.svgContainerRef,
		getBindings: () => objects.svgBindings.value,
		renderedIds: refs.renderedSvgIds,
	})
	const pan = useImageMapPan(zoom, refs.viewportRef)
	const events = useImageMapEvents(emit, { overlay, focus, actions, zoom, pan, consumeDrag: gestures.consumeDrag })
	const directory = useDirectoryPart(props, emit, core)
	const routes = useImageMapRoutes(props, emit, core)

	return {
		...useStandardBaseComponent('base-image-map', props, CLASS_KEYS),
		ui: useUi(props, 'base-image-map'),
		isLayerFadeOff: useMotion(refs.rootRef).isReduced,
		hideLeavingStage: (element: Element) => element.setAttribute('inert', ''),
		...refs,
		...useImageMapFullscreen(refs.rootRef),
		...objects,
		...events,
		...usePresentation(props, data, overlay),
		...directory,
		...routes,
		view: data.view,
		wheelHint: wheelHint(),
		svgMarkup: svg.markup,
		isSvgLoading: svg.isLoading,
		hasSvgError: svg.hasError,
		zoom,
		gestures,
		overlay,
		setLayer: actions.setLayer,
		hoursOf: core.hours.hoursOf,
		exposed: {
			zoomIn: zoom.zoomIn,
			zoomOut: zoom.zoomOut,
			resetZoom: () => zoom.resetZoom(),
			zoomToObject: (id: string) => void actions.zoomToObject(id),
			setLayer: actions.setLayer,
			clearFilters: core.filters.clearFilters,
			...routes.routeExpose,
		} satisfies BaseImageMapExpose,
	}
}
