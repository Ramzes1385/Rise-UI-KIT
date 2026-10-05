import { warn3dData } from './validate3d'
import { hasWebGL } from './webglSupport'
import { useImageMap3DStage } from './useImageMap3DStage'
import { UI_IMAGE_MAP, UI_IMAGE_MAP_3D } from '@/locales/messages'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { ImageMap2DBindings } from '../types/internal/imageMap3dInternal.types'
import { computed, onMounted, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import type {
	BaseImageMap3DEmits,
	BaseImageMap3DExpose,
	ImageMap3DFallbackReason,
	ImageMap3DProps,
	ImageMap3DView,
} from '../types/BaseImageMap3D.types'

const OWN_PROPS = new Set(['view', 'rendererFactory', 'customClass', 'camera', 'layerMode', 'hasOrbit', 'configureLoader'])

const FORWARDED_EVENTS = [
	'update:active',
	'update:layer',
	'select',
	'hover',
	'layer-change',
	'update:search',
	'update:filters',
	'update:route',
	'route-change',
] as const

function toListenerName(event: string): string {
	return `on${event.charAt(0).toUpperCase()}${event.slice(1)}`
}

function useMapBindings(props: ImageMap3DProps, emit: BaseImageMap3DEmits) {
	const forward = emit as (event: string, ...args: unknown[]) => void
	const listeners = Object.fromEntries(
		FORWARDED_EVENTS.map(event => [toListenerName(event), (...args: unknown[]) => forward(event, ...args)]),
	)
	return computed<ImageMap2DBindings>(() => ({
		...Object.fromEntries(Object.entries(props).filter(([key]) => !OWN_PROPS.has(key))),
		...listeners,
		data: props.data,
	}))
}

function useFallback(emit: BaseImageMap3DEmits) {
	const isSupported = shallowRef<boolean | null>(null)
	const hasRenderError = ref(false)

	const reason = computed<ImageMap3DFallbackReason | null>(() => {
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

	watch(
		() => props.view,
		value => {
			view.value = value
		},
	)

	function setView(value: ImageMap3DView): void {
		view.value = value
		emit('update:view', value)
	}

	return { view, setView }
}

function useViewportView(props: ImageMap3DProps) {
	const firstLayer = computed(() => props.data.layers[0])
	return {
		mapLabel: computed(() => props.ariaLabel ?? firstLayer.value?.title ?? UI_IMAGE_MAP.LABEL),
		viewportStyle: computed(() => {
			if (props.height) return { height: props.height }
			return firstLayer.value ? { aspectRatio: `${firstLayer.value.width} / ${firstLayer.value.height}` } : {}
		}),
	}
}

export function useBaseImageMap3D(props: ImageMap3DProps, emit: BaseImageMap3DEmits) {
	const base = useStandardBaseComponent('base-image-map-3d', props, [
		'root',
		'toolbar',
		'layers',
		'camera',
		'viewport',
		'canvas',
		'status',
	])
	const viewportRef = useTemplateRef<HTMLElement>('viewportRef')
	const canvasRef = useTemplateRef<HTMLCanvasElement>('canvasRef')
	const fallback = useFallback(emit)
	const { view, setView } = useViewModel(props, emit)

	const shownView = computed<ImageMap3DView>(() => (view.value === '2d' || fallback.reason.value ? '2d' : '3d'))
	const hasCanvas = computed(() => shownView.value === '3d' && fallback.isSupported.value === true)
	const { mapLabel, viewportStyle } = useViewportView(props)

	const stage = useImageMap3DStage({
		props,
		emit,
		canvasRef,
		hostRef: viewportRef,
		onError: () => {
			fallback.hasRenderError.value = true
		},
	})
	const { camera, layers } = stage

	watch(() => props.data, warn3dData, { immediate: true })

	const exposed: BaseImageMap3DExpose = { ...stage.exposed, setView }

	return {
		...base,
		shownView,
		hasCanvas,
		mapLabel,
		viewportStyle,
		statusText: fallback.statusText,
		mapBindings: useMapBindings(props, emit),
		layerOptions: layers.layerOptions,
		activeLayer: layers.activeLayer,
		setLayer: layers.setLayer,
		camera,
		onKeydown: stage.onKeydown,
		onWheel: stage.onWheel,
		hintId: `${useId()}-hint`,
		exposed,
	}
}
