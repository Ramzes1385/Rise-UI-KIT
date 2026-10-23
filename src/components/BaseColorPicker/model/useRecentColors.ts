import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import type { UseColorPickerReturn } from '@composables/form/useColorPicker'
import type { BaseColorPickerEmits, ColorPickerProps } from '../types/BaseColorPicker.types'

export function useRecentColors(
	props: ColorPickerProps,
	emit: BaseColorPickerEmits,
	state: { isOpen: Ref<boolean>; picker: UseColorPickerReturn },
) {
	const { isOpen, picker } = state
	const innerColors = ref<string[]>([])
	const colors = computed((): readonly string[] => props.recentColors ?? innerColors.value)
	let valueAtOpen = picker.value.value

	watch(isOpen, open => {
		const current = picker.value.value
		if (open || current === valueAtOpen) {
			valueAtOpen = current
			return
		}
		valueAtOpen = current
		const next = [current, ...colors.value.filter(color => color !== current)].slice(0, Math.max(0, props.maxRecentColors))
		innerColors.value = next
		emit('update:recentColors', next)
	})

	return {
		recentColors: computed((): readonly string[] => (props.isRecentHidden ? [] : colors.value)),
	}
}
