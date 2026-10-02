import type { Ref } from 'vue'
import type { ImageMapArea } from '../../types/imageMapData.types'
import type { ImageMapView } from '../../types/imageMapModel.types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Frame, ScreenPoint, ViewOptions } from '../../types/imageMapInternal.types'
import { clampScale, clampView, fitArea, fitStage, scaleForArea, zoomAround } from './viewGeometry'

const ZOOM_STEP = 1.5
const OBJECT_SHARE = 1 / 3
const POINT_ZOOM = 2

function useViewportSize(viewportRef: Ref<HTMLElement | null>) {
	const size = ref({ width: 0, height: 0 })
	let observer: ResizeObserver | null = null
	const measure = (): void => {
		const element = viewportRef.value
		if (element) size.value = { width: element.clientWidth, height: element.clientHeight }
	}
	onMounted(() => {
		measure()
		if (typeof ResizeObserver === 'undefined' || !viewportRef.value) return
		observer = new ResizeObserver(measure)
		observer.observe(viewportRef.value)
	})
	onBeforeUnmount(() => observer?.disconnect())
	return size
}

function useFrame(options: ViewOptions) {
	const viewportSize = useViewportSize(options.viewportRef)
	return computed((): Frame => {
		const layer = options.getLayer()
		const stage = fitStage(viewportSize.value, { width: layer?.width ?? 0, height: layer?.height ?? 0 })
		return {
			viewportWidth: viewportSize.value.width,
			viewportHeight: viewportSize.value.height,
			stageWidth: stage.width,
			stageHeight: stage.height,
		}
	})
}

export function useImageMapView(options: ViewOptions) {
	const frame = useFrame(options)
	const view = ref<ImageMapView>({ scale: 1, x: 0, y: 0 })
	const isAnimated = ref(false)

	function setView(next: ImageMapView, animated: boolean): void {
		isAnimated.value = animated
		view.value = clampView({ ...next, scale: clampScale(next.scale, options.getMaxZoom()) }, frame.value)
	}

	function zoomBy(factor: number, point?: ScreenPoint, animated = true): void {
		const center = point ?? { x: frame.value.viewportWidth / 2, y: frame.value.viewportHeight / 2 }
		setView(zoomAround(view.value, center, clampScale(view.value.scale * factor, options.getMaxZoom())), animated)
	}

	function resetZoom(animated = true): void {
		const area = options.getInitArea()
		if (!area) return setView({ scale: 1, x: 0, y: 0 }, animated)
		setView(fitArea(area, frame.value, clampScale(scaleForArea(area, frame.value, 1), options.getMaxZoom())), animated)
	}

	function zoomToArea(area: ImageMapArea, scale?: number): void {
		const fitted = area.width || area.height ? scaleForArea(area, frame.value, OBJECT_SHARE) : POINT_ZOOM
		setView(fitArea(area, frame.value, clampScale(scale ?? Math.max(fitted, view.value.scale), options.getMaxZoom())), true)
	}

	watch(
		() => [frame.value.viewportWidth, frame.value.viewportHeight, options.getLayer()?.id],
		() => resetZoom(false),
	)

	return {
		view,
		frame,
		isAnimated,
		setView,
		zoomBy,
		zoomIn: (): void => zoomBy(ZOOM_STEP),
		zoomOut: (): void => zoomBy(1 / ZOOM_STEP),
		resetZoom,
		zoomToArea,
		isMinZoom: computed((): boolean => view.value.scale <= 1),
		isMaxZoom: computed((): boolean => view.value.scale >= options.getMaxZoom()),
		stageStyle: computed((): Record<string, string> => ({
			width: `${frame.value.stageWidth}px`,
			height: `${frame.value.stageHeight}px`,
			transform: `translate(${view.value.x}px, ${view.value.y}px) scale(${view.value.scale})`,
			'--im-scale': String(view.value.scale),
		})),
	}
}
