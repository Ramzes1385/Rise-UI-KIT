import type { ComputedRef, Ref } from 'vue'
import type { ImageMapArea } from '../../types/imageMapData.types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ImageMapView } from '../../types/internal/imageMapModel.types'
import { clampScale, clampView, fitArea, fitStage, retargetView, scaleForArea, zoomAround } from './viewGeometry'
import type { Frame, ScreenPoint, ViewKeeperActions, ViewOptions } from '../../types/internal/imageMapInternal.types'

export const ZOOM_STEP = 1.5
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

function isSameFrame(frame: Frame, other: Frame): boolean {
	return (
		frame.viewportWidth === other.viewportWidth &&
		frame.viewportHeight === other.viewportHeight &&
		frame.stageWidth === other.stageWidth &&
		frame.stageHeight === other.stageHeight
	)
}

function useViewKeeper(options: ViewOptions, frame: ComputedRef<Frame>, view: ViewKeeperActions): void {
	let previous = frame.value
	let previousLayer = options.getLayer()?.id
	watch(
		() => [frame.value, options.getLayer()?.id] as const,
		([next, layerId]) => {
			if (layerId === previousLayer && isSameFrame(previous, next)) return
			const from = previous
			const isOtherStage = layerId !== previousLayer && (from.stageWidth !== next.stageWidth || from.stageHeight !== next.stageHeight)
			previous = next
			previousLayer = layerId
			if (isOtherStage || !from.viewportWidth || !from.viewportHeight) view.reset()
			else view.apply(retargetView(view.current(), from, next))
		},
	)
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

	useViewKeeper(options, frame, {
		reset: () => resetZoom(false),
		current: () => view.value,
		apply: next => setView(next, false),
	})

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
		limitScale: (scale: number): number => clampScale(scale, options.getMaxZoom()),
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
