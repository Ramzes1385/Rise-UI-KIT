import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { useEyeDropper } from './useEyeDropper'
import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { useRecentColors } from './useRecentColors'
import { UI_COLOR_PICKER } from '@/locales/messages'
import { useColorPickerArea } from './useColorPickerArea'
import { useColorPickerFields } from './useColorPickerFields'
import { useColorPickerMotion } from './useColorPickerMotion'
import { useFormField } from '@composables/form/useFormField'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useColorPicker } from '@composables/form/useColorPicker'
import type { UseColorPickerReturn } from '@composables/form/useColorPicker'
import type { BaseColorPickerEmits, ColorPickerProps } from '../types/BaseColorPicker.types'
import { formatColor, isCssVarColor, parseColor, resolveCssColor } from '@utils/data/colorUtils'

const CLASS_KEYS = ['root', 'swatch', 'panel', 'fields', 'preset', 'reset']

function useSwatchSelection(
	props: ColorPickerProps,
	parts: { picker: UseColorPickerReturn; emit: BaseColorPickerEmits; isOpen: Ref<boolean> },
) {
	const { picker, emit, isOpen } = parts
	return {
		isSwatchSelected(color: string): boolean {
			if (isCssVarColor(color) || isCssVarColor(props.modelValue)) return color === props.modelValue
			const parsed = parseColor(color)
			return parsed !== null && formatColor(parsed, 'hex') === formatColor({ ...picker.rgb.value, a: picker.alpha.value }, 'hex')
		},
		handleSwatchSelect(color: string): void {
			if (isCssVarColor(color)) {
				emit('update:modelValue', color)
				emit('change', color)
			} else picker.setHex(color)
			isOpen.value = false
		},
		handleReset(): void {
			emit('reset')
			isOpen.value = false
		},
	}
}

function useTriggerAttrs(props: ColorPickerProps, picker: UseColorPickerReturn) {
	return computed(() => {
		const color = isCssVarColor(props.modelValue) ? props.modelValue : picker.value.value
		return {
			...props.triggerAttrs,
			'aria-label': props.ariaLabel
				? formatMessage(UI_COLOR_PICKER.NAMED_TRIGGER, { label: props.ariaLabel, color })
				: `${UI_COLOR_PICKER.SELECTED_COLOR} ${color}`,
		}
	})
}

function useTokenValue(props: ColorPickerProps, picker: UseColorPickerReturn, swatchColor: Ref<string>) {
	const isToken = computed(() => isCssVarColor(props.modelValue))
	return {
		triggerColor: computed((): string => (isToken.value ? props.modelValue : swatchColor.value)),
		tokenText: computed((): string =>
			isToken.value ? formatMessage(UI_COLOR_PICKER.TOKEN_VALUE, { token: props.modelValue.trim(), color: picker.hex.value }) : '',
		),
	}
}

function usePicker(props: ColorPickerProps, emit: BaseColorPickerEmits, scope: Ref<HTMLElement | null>): UseColorPickerReturn {
	return useColorPicker({
		getValue: () => (isCssVarColor(props.modelValue) ? resolveCssColor(props.modelValue, scope.value) : props.modelValue),
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
	const picker = usePicker(props, emit, swatchRef)
	const recent = useRecentColors(props, emit, { isOpen, picker })
	const motion = useColorPickerMotion(picker, swatchRef)
	const fields = useColorPickerFields(props, picker)

	return {
		ui: useUi(props, 'base-color-picker'),
		classes,
		swatchRef,
		isOpen,
		picker,
		triggerAttrs: useTriggerAttrs(props, picker),
		...motion,
		...useColorPickerArea(picker, motion.isDragging),
		...fields,
		...recent,
		hasSwatches: computed(
			(): boolean => !props.isPresetsHidden || (props.palettes?.length ?? 0) > 0 || recent.recentColors.value.length > 0,
		),
		...useEyeDropper(picker),
		...useSwatchSelection(props, { picker, emit, isOpen }),
		...useTokenValue(props, picker, fields.swatchColor),
		exposed: {
			rootRef: swatchRef,
			focus: () => swatchRef.value?.focus(),
			blur: () => swatchRef.value?.blur(),
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}
