import { watch } from 'vue'
import { Vector3 } from 'three'
import { cellPixels, isDetailShown } from '../scene/sceneQuality'
import type { FlowMap3DDetailOptions } from '../../types/internal/flowMap3dMotion.types'

export function useDetailLod(options: FlowMap3DDetailOptions) {
	let shown: boolean | null = null
	const center = new Vector3()
	watch(options.content, () => (shown = null))
	return function update(): void {
		const content = options.content.value
		const size = options.getSize()
		if (!content || size.width <= 0) return
		const pixels = cellPixels(options.getCamera(), size, { at: content.bounds.getCenter(center), cell: options.getCell() })
		const next = isDetailShown(options.getQuality(), pixels)
		if (next === shown) return
		shown = next
		content.nodes.registry.setDetail(next)
		options.invalidate()
	}
}
