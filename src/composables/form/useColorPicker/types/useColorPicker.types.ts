import type { Ref } from 'vue'
import type { ColorFormat, HslColor, HsvColor, RgbColor } from '@utils/data/colorUtils'

export interface UseColorPickerOptions {
	/** Текущее значение цвета (геттер из внешнего состояния): HEX, `rgb()` / `rgba()` или `hsl()` / `hsla()` */
	getValue: () => string
	/** Callback при изменении цвета: значение в формате `getFormat()` (по умолчанию нормализованный HEX) */
	onChange: (value: string) => void
	/** Формат значения для `onChange`: `hex` (по умолчанию), `rgb` или `hsl` */
	getFormat?: () => ColorFormat
	/** Учитывать прозрачность входного значения (по умолчанию да). Без неё цвет всегда непрозрачный */
	hasAlpha?: () => boolean
}

/** Координата в относительных долях области (0–1) */
export interface RelativePoint {
	x: number
	y: number
}

export interface UseColorPickerReturn {
	/** Текущее HSV-состояние */
	hsv: Ref<HsvColor>
	/** Текущий цвет в нормализованном HEX без прозрачности */
	hex: Ref<string>
	/** Прозрачность 0–1 */
	alpha: Ref<number>
	/** Текущий цвет в RGB */
	rgb: Ref<RgbColor>
	/** Текущий цвет в HSL */
	hsl: Ref<HslColor>
	/** Текущий цвет с прозрачностью в формате `getFormat()` — то, что уходит в `onChange` */
	value: Ref<string>
	/** Чистый цвет текущего тона (для фона SV-области) */
	hueColor: Ref<string>
	/** Позиция маркера в SV-области в процентах { x, y } */
	markerStyle: Ref<{ left: string; top: string }>
	/** Установить тон (hue 0–360) */
	setHue: (hue: number) => void
	/** Установить saturation/value по относительной точке области (0–1) */
	setSaturationValue: (point: RelativePoint) => void
	/** Установить цвет из строки: HEX, `rgb()` или `hsl()` (игнорирует невалидный ввод) */
	setHex: (input: string) => void
	/** Установить прозрачность 0–1 (округляется до сотых) */
	setAlpha: (alpha: number) => void
	/** Изменить каналы RGB (0–255); не переданные каналы остаются прежними */
	setRgb: (rgb: Partial<RgbColor>) => void
	/** Изменить тон, насыщенность или светлоту; не переданные остаются прежними */
	setHsl: (hsl: Partial<HslColor>) => void
}

/** Разобранное значение: точный HEX без прозрачности и прозрачность 0–1 */
export interface ParsedColorValue {
	hex: string
	alpha: number
}

/** Внутреннее состояние выбора цвета */
export interface ColorPickerState {
	hsv: Ref<HsvColor>
	exactHex: Ref<string>
	alpha: Ref<number>
}
