import type { Ref } from 'vue'
import { normalizeHex } from '@utils/colorUtils'
import { toHTMLInputElement } from '@utils/domUtils'
/** Composable: логика BaseColorPicker — SV-область, оттенок, HEX и пресеты */
import { computed, onBeforeUnmount, ref } from 'vue'
import { useFormField } from '@composables/useFormField'
import { useColorPicker } from '@composables/useColorPicker'
import { useCustomClass } from '@composables/useCustomClass'
import type { BaseColorPickerEmits, BaseColorPickerProps } from '../types/BaseColorPicker.types'

/** Шаг стрелок в SV-области: 1% насыщенности или яркости, с Shift — 10% */
const AREA_STEP = 0.01
const AREA_STEP_LARGE = 0.1

/** SV-область: выбор указателем с захватом перемещения и стрелками (влево/вправо — насыщенность, вверх/вниз — яркость) */
function useSaturationArea(picker: ReturnType<typeof useColorPicker>) {
	const areaRef = ref<HTMLElement | null>(null)
	let stopAreaDrag: (() => void) | null = null

	const applyAreaPoint = (clientX: number, clientY: number): void => {
		const area = areaRef.value
		/* istanbul ignore next -- defensive: pointerdown невозможен без смонтированного areaRef */
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

/** Оттенок и HEX из полей; пресет и сброс завершают выбор — панель закрывается */
function useColorInputs(picker: ReturnType<typeof useColorPicker>, emit: BaseColorPickerEmits, isOpen: Ref<boolean>) {
	return {
		handleHueInput(event: Event): void {
			const target = toHTMLInputElement(event.target)
			if (!target) return
			picker.setHue(Number(target.value))
		},
		handleHexChange(event: Event): void {
			const target = toHTMLInputElement(event.target)
			if (!target) return
			picker.setHex(target.value)
		},
		handlePresetClick(preset: string): void {
			picker.setHex(preset)
			isOpen.value = false
		},
		handleReset(): void {
			emit('reset')
			isOpen.value = false
		},
	}
}

export function useBaseColorPicker(props: BaseColorPickerProps, emit: BaseColorPickerEmits) {
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'swatch', 'panel', 'preset', 'reset'] })
	const swatchRef = ref<HTMLElement | null>(null)
	const isOpen = ref(false)
	const formField = useFormField({ value: () => props.modelValue })
	const picker = useColorPicker({
		getValue: () => props.modelValue,
		onChange: hex => {
			emit('update:modelValue', hex)
			emit('change', hex)
		},
	})
	// Цвет swatch и поля HEX — нормализованное значение модели (источник истины)
	const swatchColor = computed(() => normalizeHex(props.modelValue) ?? picker.hex.value)

	return {
		classes,
		swatchRef,
		isOpen,
		picker,
		swatchColor,
		...useSaturationArea(picker),
		/** Пресет совпадает с текущим цветом (сравнение нормализованных HEX: #FFF и #ffffff — один цвет) */
		isPresetSelected: (preset: string): boolean => normalizeHex(preset) === swatchColor.value,
		...useColorInputs(picker, emit, isOpen),
		exposed: {
			rootRef: swatchRef,
			focus: () => swatchRef.value?.focus(),
			blur: () => swatchRef.value?.blur(),
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}
