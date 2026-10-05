import type { Ref } from 'vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import type { ColorPickerMarkerStyle } from '../types/BaseColorPicker.types'
import type { UseColorPickerReturn } from '@composables/form/useColorPicker'

const PERCENT = 100
const HUE_MAX = 360
const MOTION_SCOPE = '[data-rise-motion]'

export function useColorPickerMotion(picker: UseColorPickerReturn, anchor: Ref<HTMLElement | null>) {
	const motion = useMotion(anchor)
	const isDragging = ref(false)
	const stopDrag = (): void => {
		isDragging.value = false
		window.removeEventListener('pointerup', stopDrag)
		window.removeEventListener('pointercancel', stopDrag)
	}

	onBeforeUnmount(stopDrag)

	return {
		isDragging,
		isMotionInstant: computed((): boolean => isDragging.value || motion.isReduced.value),
		motionScope: computed((): string | undefined => {
			const preset = motion.preset.value
			return anchor.value?.closest(MOTION_SCOPE) ? preset : undefined
		}),
		markerStyle: computed((): ColorPickerMarkerStyle => ({
			'--picker-marker-x': String(picker.hsv.value.s),
			'--picker-marker-y': String(PERCENT - picker.hsv.value.v),
			backgroundColor: picker.hex.value,
		})),
		hueThumbStyle: computed(() => ({ '--picker-thumb-x': String(picker.hsv.value.h / HUE_MAX) })),
		alphaThumbStyle: computed(() => ({ '--picker-thumb-x': String(picker.alpha.value) })),
		handleSliderPointerDown(): void {
			isDragging.value = true
			window.addEventListener('pointerup', stopDrag)
			window.addEventListener('pointercancel', stopDrag)
		},
	}
}
