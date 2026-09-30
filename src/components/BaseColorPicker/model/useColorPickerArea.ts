import { onBeforeUnmount, ref } from 'vue'
import type { UseColorPickerReturn } from '@composables/form/useColorPicker'

const AREA_STEP = 0.01
const AREA_STEP_LARGE = 0.1

export function useColorPickerArea(picker: UseColorPickerReturn) {
	const areaRef = ref<HTMLElement | null>(null)
	let stopAreaDrag: (() => void) | null = null

	const applyAreaPoint = (clientX: number, clientY: number): void => {
		const area = areaRef.value
		if (!area) return
		const rect = area.getBoundingClientRect()
		picker.setSaturationValue({ x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height })
	}

	onBeforeUnmount(() => stopAreaDrag?.())

	return {
		areaRef,
		handleAreaPointerDown(event: PointerEvent): void {
			applyAreaPoint(event.clientX, event.clientY)
			const handlePointerMove = (moveEvent: PointerEvent): void => applyAreaPoint(moveEvent.clientX, moveEvent.clientY)
			const handlePointerUp = (): void => stopAreaDrag?.()
			stopAreaDrag = (): void => {
				window.removeEventListener('pointermove', handlePointerMove)
				window.removeEventListener('pointerup', handlePointerUp)
				stopAreaDrag = null
			}
			window.addEventListener('pointermove', handlePointerMove)
			window.addEventListener('pointerup', handlePointerUp)
		},
		handleAreaKeydown(event: KeyboardEvent): void {
			const step = event.shiftKey ? AREA_STEP_LARGE : AREA_STEP
			const offsets: Record<string, [number, number]> = {
				ArrowLeft: [-step, 0],
				ArrowRight: [step, 0],
				ArrowUp: [0, -step],
				ArrowDown: [0, step],
			}
			const offset = offsets[event.key]
			if (!offset) return
			event.preventDefault()
			const { s, v } = picker.hsv.value
			picker.setSaturationValue({ x: s / 100 + offset[0], y: 1 - v / 100 + offset[1] })
		},
	}
}
