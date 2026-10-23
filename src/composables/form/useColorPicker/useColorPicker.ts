/** Composable: логика выбора цвета (HSV-модель, прозрачность, форматы HEX / RGB / HSL) */
import { computed, ref, watch } from 'vue'
import type { HslColor, HsvColor, RgbColor } from '@utils/data/colorUtils'
import { clamp, formatColor, hexToHsv, hexToRgb, hslToRgb, hsvToHex, parseColor, rgbToHex, rgbToHsl } from '@utils/data/colorUtils'
import type {
	ColorPickerState,
	ParsedColorValue,
	RelativePoint,
	UseColorPickerOptions,
	UseColorPickerReturn,
} from './types/useColorPicker.types'

const MAX_HUE = 360
const MAX_PERCENT = 100
const DEFAULT_HEX = '#000000'

function readValue(value: string, hasAlpha: boolean): ParsedColorValue | null {
	const parsed = parseColor(value)
	if (!parsed) return null
	return { hex: rgbToHex(parsed), alpha: hasAlpha ? parsed.a : 1 }
}

/**
 * Состояние выбора. HSV хранится в целых градусах/процентах и не переживает обратное преобразование
 * (#123456 → #123457), поэтому введённый, выбранный из пресетов или пришедший извне цвет храним как есть
 * в `exactHex`; из HSV он пересчитывается, только когда пользователь меняет сам HSV (тон или SV-область).
 */
function createState(initial: ParsedColorValue): ColorPickerState {
	return { hsv: ref(hexToHsv(initial.hex)), exactHex: ref(initial.hex), alpha: ref(initial.alpha) }
}

function applyParsed(state: ColorPickerState, parsed: ParsedColorValue): void {
	state.hsv.value = hexToHsv(parsed.hex)
	state.exactHex.value = parsed.hex
	state.alpha.value = parsed.alpha
}

function createSetters(state: ColorPickerState, options: { hasAlpha: () => boolean; emitChange: () => void }) {
	const { hsv, exactHex, alpha } = state
	const applyHsv = (next: HsvColor): void => {
		hsv.value = next
		exactHex.value = hsvToHex(next)
		options.emitChange()
	}
	const applyHex = (nextHex: string): void => {
		applyParsed(state, { hex: nextHex, alpha: alpha.value })
		options.emitChange()
	}
	return {
		setHue: (hue: number): void => applyHsv({ ...hsv.value, h: clamp(hue, 0, MAX_HUE) }),
		setSaturationValue: (point: RelativePoint): void =>
			applyHsv({
				...hsv.value,
				s: Math.round(clamp(point.x, 0, 1) * MAX_PERCENT),
				v: Math.round((1 - clamp(point.y, 0, 1)) * MAX_PERCENT),
			}),
		setHex(input: string): void {
			const parsed = readValue(input, options.hasAlpha())
			if (!parsed) return
			alpha.value = parsed.alpha
			applyHex(parsed.hex)
		},
		setAlpha(next: number): void {
			alpha.value = Math.round(clamp(next, 0, 1) * MAX_PERCENT) / MAX_PERCENT
			options.emitChange()
		},
		setRgb: (next: Partial<RgbColor>): void => applyHex(rgbToHex({ ...hexToRgb(exactHex.value), ...next })),
		setHsl: (next: Partial<HslColor>): void => applyHex(rgbToHex(hslToRgb({ ...rgbToHsl(hexToRgb(exactHex.value)), ...next }))),
	}
}

/**
 * Composable для логики выбора цвета (HSV-модель).
 * Хранит HSV-состояние для элементов управления, точный HEX текущего цвета и прозрачность,
 * синхронизируется с внешним значением (HEX, `rgb()`, `hsl()`, с прозрачностью или без),
 * вычисляет позицию маркера в SV-области и цвет текущего тона. Наружу цвет уходит в формате `getFormat()`.
 *
 * @example
 * ```ts
 * const picker = useColorPicker({
 *   getValue: () => props.modelValue,
 *   getFormat: () => 'rgb',
 *   onChange: value => emit('update:modelValue', value),
 * })
 * ```
 */
function useColorPicker(options: UseColorPickerOptions): UseColorPickerReturn {
	const { getValue, onChange, getFormat = () => 'hex', hasAlpha = () => true } = options
	const state = createState(readValue(getValue(), hasAlpha()) ?? { hex: DEFAULT_HEX, alpha: 1 })
	const rgb = computed((): RgbColor => hexToRgb(state.exactHex.value))
	const value = computed(() => formatColor({ ...rgb.value, a: state.alpha.value }, getFormat()))

	watch(getValue, next => {
		const parsed = readValue(next, hasAlpha())
		if (!parsed || (parsed.hex === state.exactHex.value && parsed.alpha === state.alpha.value)) return
		applyParsed(state, parsed)
	})

	return {
		hsv: state.hsv,
		hex: computed(() => state.exactHex.value),
		alpha: state.alpha,
		rgb,
		hsl: computed((): HslColor => rgbToHsl(rgb.value)),
		value,
		hueColor: computed(() => hsvToHex({ h: state.hsv.value.h, s: MAX_PERCENT, v: MAX_PERCENT })),
		markerStyle: computed(() => ({ left: `${state.hsv.value.s}%`, top: `${MAX_PERCENT - state.hsv.value.v}%` })),
		...createSetters(state, { hasAlpha, emitChange: () => onChange(value.value) }),
	}
}

export { useColorPicker }
