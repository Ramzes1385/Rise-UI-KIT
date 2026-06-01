import type { Ref } from 'vue'

import type { HsvColor } from '@utils/colorUtils'

/** Опции composable useColorPicker */
export interface UseColorPickerOptions {
	/** Текущее значение цвета в формате HEX (геттер из внешнего состояния) */
	getValue: () => string
	/** Callback при изменении цвета (нормализованный HEX) */
	onChange: (hex: string) => void
}

/** Координата в относительных долях области (0–1) */
export interface RelativePoint {
	x: number
	y: number
}

/** Возвращаемое значение composable useColorPicker */
export interface UseColorPickerReturn {
	/** Текущее HSV-состояние */
	hsv: Ref<HsvColor>
	/** Текущий цвет в нормализованном HEX */
	hex: Ref<string>
	/** Чистый цвет текущего тона (для фона SV-области) */
	hueColor: Ref<string>
	/** Позиция маркера в SV-области в процентах { x, y } */
	markerStyle: Ref<{ left: string; top: string }>
	/** Установить тон (hue 0–360) */
	setHue: (hue: number) => void
	/** Установить saturation/value по относительной точке области (0–1) */
	setSaturationValue: (point: RelativePoint) => void
	/** Установить цвет из строки HEX (игнорирует невалидный ввод) */
	setHex: (input: string) => void
}
