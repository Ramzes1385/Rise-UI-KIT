/** Composable: логика выбора цвета (HSV-модель) */
import { computed, ref, watch } from 'vue'
import type { HsvColor } from '@utils/data/colorUtils'
import { clamp, hexToHsv, hsvToHex, normalizeHex } from '@utils/data/colorUtils'
import type { RelativePoint, UseColorPickerOptions, UseColorPickerReturn } from './types/useColorPicker.types'

const MAX_HUE = 360
const MAX_PERCENT = 100
const DEFAULT_HEX = '#000000'

/**
 * Composable для логики выбора цвета (HSV-модель).
 * Хранит HSV-состояние для элементов управления и точный HEX текущего цвета,
 * синхронизируется с внешним HEX, вычисляет позицию маркера в SV-области и цвет текущего тона.
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

	const initialHex = normalizeHex(getValue()) ?? DEFAULT_HEX

	const hsv = ref(hexToHsv(initialHex))

	/**
	 * Точный текущий HEX. HSV хранится в целых градусах/процентах и не переживает обратное
	 * преобразование (#123456 → #123457), поэтому введённый, выбранный из пресетов или
	 * пришедший извне цвет храним как есть; из HSV он пересчитывается, только когда
	 * пользователь меняет сам HSV (тон или SV-область).
	 */
	const exactHex = ref(initialHex)

	const hex = computed(() => exactHex.value)

	const hueColor = computed(() => hsvToHex({ h: hsv.value.h, s: MAX_PERCENT, v: MAX_PERCENT }))

	const markerStyle = computed(() => ({
		left: `${hsv.value.s}%`,
		top: `${MAX_PERCENT - hsv.value.v}%`,
	}))

	function emitChange(): void {
		onChange(exactHex.value)
	}

	/** Применить HSV, изменённый элементами управления, и пересчитать из него HEX */
	function applyHsv(next: HsvColor): void {
		hsv.value = next
		exactHex.value = hsvToHex(next)
		emitChange()
	}

	function setHue(hue: number): void {
		applyHsv({ ...hsv.value, h: clamp(hue, 0, MAX_HUE) })
	}

	function setSaturationValue(point: RelativePoint): void {
		applyHsv({
			...hsv.value,
			s: Math.round(clamp(point.x, 0, 1) * MAX_PERCENT),
			v: Math.round((1 - clamp(point.y, 0, 1)) * MAX_PERCENT),
		})
	}

	/** Установить цвет из строки HEX: наружу уходит нормализованный ввод, а не пересчёт через HSV */
	function setHex(input: string): void {
		const normalized = normalizeHex(input)
		if (!normalized) return
		hsv.value = hexToHsv(normalized)
		exactHex.value = normalized
		emitChange()
	}

	watch(getValue, value => {
		const normalized = normalizeHex(value)
		if (!normalized || normalized === exactHex.value) return
		hsv.value = hexToHsv(normalized)
		exactHex.value = normalized
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
