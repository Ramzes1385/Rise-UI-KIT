import type { Ref } from 'vue'

export interface UseZoomMinimapOptions {
	currentScale: Ref<number>
	translateX: Ref<number>
	translateY: Ref<number>
	rotation: Ref<number>
	zoomContentW: Ref<number>
	zoomContentH: Ref<number>
	mmContentWidth: Ref<number>
	mmContentHeight: Ref<number>
	mmContentOffsetX: Ref<number>
	mmContentOffsetY: Ref<number>
	clampPosition: () => void
}
