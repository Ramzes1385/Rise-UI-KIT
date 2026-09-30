import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { useEyeDropper } from './useEyeDropper'
import { useRecentColors } from './useRecentColors'
import { useColorPickerArea } from './useColorPickerArea'
import { useColorPickerFields } from './useColorPickerFields'
import { useFormField } from '@composables/form/useFormField'
import { formatColor, parseColor } from '@utils/data/colorUtils'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useColorPicker } from '@composables/form/useColorPicker'
import type { UseColorPickerReturn } from '@composables/form/useColorPicker'
import type { BaseColorPickerEmits, ColorPickerProps } from '../types/BaseColorPicker.types'

const CLASS_KEYS = ['root', 'swatch', 'panel', 'fields', 'preset', 'reset']

function useSwatchSelection(picker: UseColorPickerReturn, emit: BaseColorPickerEmits, isOpen: Ref<boolean>) {
	return {
		isSwatchSelected(color: string): boolean {
			const parsed = parseColor(color)
			return parsed !== null && formatColor(parsed, 'hex') === formatColor({ ...picker.rgb.value, a: picker.alpha.value }, 'hex')
		},
		handleSwatchSelect(color: string): void {
			picker.setHex(color)
			isOpen.value = false
		},
		handleReset(): void {
			emit('reset')
			isOpen.value = false
		},
	}
}

function usePicker(props: ColorPickerProps, emit: BaseColorPickerEmits): UseColorPickerReturn {
	return useColorPicker({
		getValue: () => props.modelValue,
		getFormat: () => props.format,
		hasAlpha: () => props.hasAlpha,
		onChange: value => {
			emit('update:modelValue', value)
			emit('change', value)
		},
	})
}

export function useBaseColorPicker(props: ColorPickerProps, emit: BaseColorPickerEmits) {
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: CLASS_KEYS })
	const swatchRef = ref<HTMLElement | null>(null)
	const isOpen = ref(false)
	const formField = useFormField({ value: () => props.modelValue })
	const picker = usePicker(props, emit)
	const recent = useRecentColors(props, emit, { isOpen, picker })

	return {
		classes,
		swatchRef,
		isOpen,
		picker,
		...useColorPickerArea(picker),
		...useColorPickerFields(props, picker),
		...recent,
		hasSwatches: computed(
			(): boolean => !props.isPresetsHidden || (props.palettes?.length ?? 0) > 0 || recent.recentColors.value.length > 0,
		),
		...useEyeDropper(picker),
		...useSwatchSelection(picker, emit, isOpen),
		exposed: {
			rootRef: swatchRef,
			focus: () => swatchRef.value?.focus(),
			blur: () => swatchRef.value?.blur(),
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}
