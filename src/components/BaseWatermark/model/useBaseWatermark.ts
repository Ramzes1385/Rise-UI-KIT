import { useUi } from '@composables/base/useUi'
import { computed, ref, type CSSProperties } from 'vue'
import { useWatermarkGuard } from './guard/useWatermarkGuard'
import { useWatermarkTile } from './pattern/useWatermarkTile'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { WatermarkProps, WatermarkTile } from '../types/BaseWatermark.types'

function tileSize(tile: WatermarkTile): string {
	return `${tile.width}px ${tile.height === null ? 'auto' : `${tile.height}px`}`
}

export function useBaseWatermark(props: WatermarkProps) {
	const rootRef = ref<HTMLElement | null>(null)
	const layerRef = ref<HTMLElement | null>(null)
	const { tile } = useWatermarkTile(props, rootRef)
	useWatermarkGuard(rootRef, layerRef, () => props.isProtected)

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'layer'] }),
		ui: useUi(props, 'base-watermark'),
		rootRef,
		layerRef,
		layerStyle: computed((): CSSProperties => {
			const style: CSSProperties = { zIndex: props.zIndex, opacity: props.opacity }
			if (!tile.value) return style
			return {
				...style,
				backgroundImage: `url("${tile.value.url}")`,
				backgroundSize: tileSize(tile.value),
				backgroundRepeat: tile.value.repeat,
			}
		}),
	}
}
