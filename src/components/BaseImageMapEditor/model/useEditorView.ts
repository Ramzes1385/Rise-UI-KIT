import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { computed, nextTick, onMounted, ref } from 'vue'
import { IMAGE_MAP_EDITOR_TOOLS } from '../types/BaseImageMapEditor.types'
import type { EditorAnnouncer } from '../types/imageMapEditorInternal.types'
import type { ImageMapLayer } from '@components/BaseImageMap/types/imageMapData.types'
import type { BaseImageMapEditorEmits, ImageMapEditorProps, ImageMapEditorTool } from '../types/BaseImageMapEditor.types'

const ZOOM_STEP = 1.25
const MAX_ZOOM = 4

export function useEditorAnnouncer(emit: BaseImageMapEditorEmits) {
	const status = ref('')
	const importError = ref('')
	let isMounted = false
	onMounted(() => {
		isMounted = true
	})
	return {
		status,
		importError,
		announce(message: string): void {
			importError.value = ''
			if (!isMounted) return
			status.value = ''
			void nextTick(() => {
				status.value = message
			})
		},
		fail(message: string): void {
			importError.value = message
			emit('import-error', message)
		},
	} satisfies EditorAnnouncer & Record<string, unknown>
}

export function useEditorZoom(getLayer: () => ImageMapLayer | undefined) {
	const zoom = ref(1)
	return {
		zoom,
		isMinZoom: computed(() => zoom.value <= 1),
		isMaxZoom: computed(() => zoom.value >= MAX_ZOOM),
		zoomIn(): void {
			zoom.value = Math.min(MAX_ZOOM, zoom.value * ZOOM_STEP)
		},
		zoomOut(): void {
			zoom.value = Math.max(1, zoom.value / ZOOM_STEP)
		},
		resetZoom(): void {
			zoom.value = 1
		},
		stageStyle: computed((): Record<string, string> => {
			const layer = getLayer()
			return layer ? { width: `${zoom.value * 100}%`, aspectRatio: `${layer.width} / ${layer.height}` } : {}
		}),
	}
}

export function toolOptions() {
	const labels: Record<ImageMapEditorTool, string> = {
		select: UI_IMAGE_MAP_EDITOR.TOOL_SELECT,
		point: UI_IMAGE_MAP_EDITOR.TOOL_POINT,
		rect: UI_IMAGE_MAP_EDITOR.TOOL_RECT,
		ellipse: UI_IMAGE_MAP_EDITOR.TOOL_ELLIPSE,
		polygon: UI_IMAGE_MAP_EDITOR.TOOL_POLYGON,
	}
	return IMAGE_MAP_EDITOR_TOOLS.map(tool => ({ value: tool, label: labels[tool] }))
}

export function canvasHelp(props: ImageMapEditorProps, tool: ImageMapEditorTool): string {
	if (props.isDisabled) return UI_IMAGE_MAP_EDITOR.HELP_DISABLED
	const help: Record<ImageMapEditorTool, string> = {
		select: UI_IMAGE_MAP_EDITOR.HELP_SELECT,
		point: UI_IMAGE_MAP_EDITOR.HELP_POINT,
		rect: UI_IMAGE_MAP_EDITOR.HELP_SHAPE,
		ellipse: UI_IMAGE_MAP_EDITOR.HELP_SHAPE,
		polygon: UI_IMAGE_MAP_EDITOR.HELP_POLYGON,
	}
	return help[tool]
}
