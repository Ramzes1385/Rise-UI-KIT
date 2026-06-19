/** Composable: логика выбора цвета (HSV-модель) */
import { computed, ref, watch } from 'vue'
import { clamp, hexToHsv, hsvToHex, isValidHex, normalizeHex } from '@utils/colorUtils'
import type { RelativePoint, UseColorPickerOptions, UseColorPickerReturn } from './useColorPicker.types'

const MAX_HUE = 360
const MAX_PERCENT = 100
const DEFAULT_HEX = '#000000'

/**
 * Composable для логики выбора цвета (HSV-модель).
 * Хранит каноническое HSV-состояние, синхронизируется с внешним HEX,
 * вычисляет позицию маркера в SV-области и цвет текущего тона.
 *
 * @example
 * ```ts
 * const picker = useColorPicker({
 *   getValue: () => props.modelValue,
 *   onChange: (hex) => emit('update:modelValue', hex),
 * })
 * ```
 */
function useColorPicker(options: UseColorPickerOptions): UseColorPickerReturn {
	const { getValue, onChange } = options

	const hsv = ref(hexToHsv(normalizeHex(getValue()) ?? DEFAULT_HEX))

	const hex = computed(() => hsvToHex(hsv.value))

	const hueColor = computed(() => hsvToHex({ h: hsv.value.h, s: MAX_PERCENT, v: MAX_PERCENT }))

	const markerStyle = computed(() => ({
		left: `${hsv.value.s}%`,
		top: `${MAX_PERCENT - hsv.value.v}%`,
	}))

	/** Передать текущий HEX наружу */
	function emitChange(): void {
		onChange(hex.value)
	}

	/** Установить тон */
	function setHue(hue: number): void {
		hsv.value = { ...hsv.value, h: clamp(hue, 0, MAX_HUE) }
		emitChange()
	}

	/** Установить saturation/value по относительной точке области */
	function setSaturationValue(point: RelativePoint): void {
		hsv.value = {
			...hsv.value,
			s: Math.round(clamp(point.x, 0, 1) * MAX_PERCENT),
			v: Math.round((1 - clamp(point.y, 0, 1)) * MAX_PERCENT),
		}
		emitChange()
	}

	/** Установить цвет из строки HEX */
	function setHex(input: string): void {
		if (!isValidHex(input)) return
		hsv.value = hexToHsv(input)
		emitChange()
	}

	watch(getValue, value => {
		const normalized = normalizeHex(value)
		if (!normalized || normalized === hex.value) return
		hsv.value = hexToHsv(normalized)
	})

	return {
		hsv,
		hex,
		hueColor,
		markerStyle,
		setHue,
		setSaturationValue,
		setHex,
	}
}

export { useColorPicker }
