import type { Ref } from 'vue'
import { warn3dData } from './validate3d'
import { hasWebGL } from './webglSupport'
import { formatMessage } from '@/locales/state'
import { useImageMap3DMap } from './useImageMap3DMap'
import { UI_IMAGE_MAP, UI_IMAGE_MAP_3D } from '@/locales/messages'
import { useImageMap3DStage, useStageInput } from './useImageMap3DStage'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { computed, onMounted, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import type { ImageMap2DBindings, ImageMap3DStage, Map3DParts } from '../types/internal/imageMap3dInternal.types'
import type {
	BaseImageMap3DEmits,
	BaseImageMap3DExpose,
	ImageMap3DFallbackReason,
	ImageMap3DProps,
	ImageMap3DView,
} from '../types/BaseImageMap3D.types'

const OWN_PROPS = new Set(['view', 'rendererFactory', 'customClass', 'camera', 'layerMode', 'hasOrbit', 'configureLoader', 'has2dToggle'])

const CLASS_KEYS = [
	'root',
	'views',
	'toolbar',
	'layers',
	'camera',
	'viewport',
	'canvas',
	'point',
	'tooltip',
	'popup',
	'directory',
	'filters',
	'route',
	'status',
]

function useMapBindings(props: ImageMap3DProps, emit: BaseImageMap3DEmits, map: ReturnType<typeof useImageMap3DMap>) {
	const listeners = {
		'onUpdate:active': (id: string | null) => map.actions.setActive(id),
		'onUpdate:layer': (id: string) => map.actions.setLayer(id),
		'onUpdate:search': (value: string) => map.filters.setSearch(value),
		'onUpdate:filters': map.filters.setFilters,
		'onUpdate:route': map.routes.setRoute,
		onSelect: (...args: unknown[]) => (emit as (event: string, ...rest: unknown[]) => void)('select', ...args),
		onHover: (...args: unknown[]) => (emit as (event: string, ...rest: unknown[]) => void)('hover', ...args),
	}
	return computed<ImageMap2DBindings>(() => ({
		...Object.fromEntries(Object.entries(props).filter(([key]) => !OWN_PROPS.has(key))),
		...listeners,
		data: props.data,
		active: map.actions.localActive.value,
		layer: map.data.currentLayer.value?.id,
		search: map.filters.search.value,
		filters: map.filters.values.value,
		route: map.routes.route.value,
		hasDeepLinking: false,
	}))
}

function useFallback(emit: BaseImageMap3DEmits, getView: () => ImageMap3DView) {
	const isSupported = shallowRef<boolean | null>(null)
	const hasRenderError = ref(false)

	const reason = computed<ImageMap3DFallbackReason | null>(() => {
		if (getView() === '2d') return null
		if (isSupported.value === false) return 'unsupported'
		return hasRenderError.value ? 'error' : null
	})

	const statusText = computed(() => {
		if (!reason.value) return ''
		return reason.value === 'unsupported' ? UI_IMAGE_MAP_3D.FALLBACK_UNSUPPORTED : UI_IMAGE_MAP_3D.FALLBACK_ERROR
	})

	onMounted(() => {
		isSupported.value = hasWebGL()
	})

	watch(reason, value => {
		if (value) emit('fallback', value)
	})

	return { isSupported, hasRenderError, reason, statusText }
}

function useViewModel(props: ImageMap3DProps, emit: BaseImageMap3DEmits) {
	const view = ref<ImageMap3DView>(props.view)
	const fallback = useFallback(emit, () => view.value)

	watch(
		() => props.view,
		value => {
			view.value = value
		},
	)
	watch(view, value => {
		if (value === '3d') fallback.hasRenderError.value = false
	})

	function setView(value: ImageMap3DView): void {
		if (value === '3d') fallback.hasRenderError.value = false
		if (view.value === value) return
		view.value = value
		emit('update:view', value)
	}

	const shownView = computed<ImageMap3DView>(() => (view.value === '2d' || fallback.reason.value ? '2d' : '3d'))
	return { fallback, setView, shownView }
}

function useLiveRegion(props: ImageMap3DProps, map: Map3DParts) {
	const liveText = ref('')
	const layerTitle = (id: string | undefined) => {
		const layer = props.data.layers.find(entry => entry.id === id)
		return layer?.title ?? ''
	}

	watch(
		() => map.data.currentLayer.value?.id,
		id => {
			liveText.value = formatMessage(UI_IMAGE_MAP_3D.LAYER_LIVE, { layer: layerTitle(id) })
		},
	)

	return {
		liveText,
		announce(id: string | null): void {
			const item = map.data.findObject(id)
			liveText.value = item
				? formatMessage(UI_IMAGE_MAP_3D.OBJECT_LIVE, {
						name: item.object.title,
						layer: layerTitle(map.data.layerOf(item.object.id)),
					})
				: ''
		},
	}
}

function usePresentation(
	props: ImageMap3DProps,
	map: ReturnType<typeof useImageMap3DMap>,
	classes: Readonly<Ref<Record<string, string | undefined>>>,
) {
	return {
		mapLabel: computed(() => props.ariaLabel ?? map.data.currentLayer.value?.title ?? UI_IMAGE_MAP.LABEL),
		viewportStyle: computed(() => {
			const layer = map.data.currentLayer.value
			if (props.height) return { height: props.height }
			return layer ? { aspectRatio: `${layer.width} / ${layer.height}` } : {}
		}),
		layerOptions: computed(() => props.data.layers.map(layer => ({ value: layer.id, label: layer.shortTitle ?? layer.title }))),
		viewOptions: [
			{ value: '3d', label: UI_IMAGE_MAP_3D.VIEW_3D },
			{ value: '2d', label: UI_IMAGE_MAP_3D.VIEW_2D },
		],
		directoryClasses: computed(() => ({
			directory: ['base-image-map-3d__directory', classes.value.directory].filter(Boolean).join(' '),
			filters: classes.value.filters,
		})),
	}
}

function createExpose(map: Map3DParts, stage: ImageMap3DStage, setView: (view: ImageMap3DView) => void): BaseImageMap3DExpose {
	return {
		invalidate: stage.viewport.invalidate,
		setView,
		setLayer: map.actions.setLayer,
		resetCamera: stage.camera.resetCamera,
		rotate: stage.camera.rotate,
		zoomIn: stage.camera.zoomIn,
		zoomOut: stage.camera.zoomOut,
		zoomToObject: (id: string) => void map.actions.zoomToObject(id),
		clearFilters: map.filters.clearFilters,
		...map.routes.routeExpose,
	}
}

export function useBaseImageMap3D(props: ImageMap3DProps, emit: BaseImageMap3DEmits) {
	const base = useStandardBaseComponent('base-image-map-3d', props, CLASS_KEYS)
	const rootRef = useTemplateRef<HTMLElement>('rootRef')
	const viewportRef = useTemplateRef<HTMLElement>('viewportRef')
	const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
	const cardRef = useTemplateRef<HTMLElement>('cardRef')
	const { fallback, setView, shownView } = useViewModel(props, emit)
	const map = useImageMap3DMap(props, emit, { rootRef, zoomTo: id => stage.camera.zoomToObject(id) })
	const stageOptions = {
		props,
		map,
		canvasRef,
		cardRef,
		hostRef: viewportRef,
		onError: () => {
			fallback.hasRenderError.value = true
		},
	}
	const stage = useImageMap3DStage(stageOptions)
	const live = useLiveRegion(props, map)
	const input = useStageInput(stageOptions, stage, live.announce)

	watch(() => props.data, warn3dData, { immediate: true })

	return {
		...base,
		...usePresentation(props, map, base.classes),
		...input,
		map,
		shownView,
		setView,
		hasCanvas: computed(() => shownView.value === '3d' && fallback.isSupported.value === true),
		hasViewSwitch: computed(() => props.has2dToggle && fallback.isSupported.value !== false),
		statusText: fallback.statusText,
		liveText: live.liveText,
		mapBindings: useMapBindings(props, emit, map),
		camera: stage.camera,
		card: stage.overlay.card,
		cardItem: stage.state.cardItem,
		points: stage.overlay.points,
		hintId: `${useId()}-hint`,
		exposed: createExpose(map, stage, setView),
	}
}
