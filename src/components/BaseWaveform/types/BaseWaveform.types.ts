import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты BaseWaveform: default — сыгранная часть цветом primary на приглушённых столбиках,
 * soft — светлее и спокойнее, для пузырей чата и плотных списков
 */
export const WAVEFORM_VARIANTS = ['default', 'soft'] as const

/**
 * Части BaseWaveform для пропа `ui` (БЭМ-элементы `.base-waveform__<часть>`, `root` — вся шкала): bar — столбик волны,
 * selection — подсветка выделенного фрагмента, hint — скрытое описание фрагмента для скринридера.
 */
export const WAVEFORM_PARTS = ['bar', 'selection', 'hint'] as const

export type BaseWaveformPart = (typeof WAVEFORM_PARTS)[number]

/** Фрагмент записи, секунды */
export interface WaveformRange {
	start: number
	end: number
}

/**
 * Пропсы компонента BaseWaveform
 */
export interface BaseWaveformProps extends BaseComponentProps<(typeof WAVEFORM_VARIANTS)[number], 'root' | 'bar' | 'selection'> {
	/** Амплитуды столбиков от 0 до 1: `computeWaveformPeaks`, `decodeWaveformPeaks` из utils или с сервера */
	peaks: number[]
	/** Длительность записи, секунды */
	duration: number
	/** Позиция, секунды (`v-model:current-time`) */
	currentTime?: number
	/** Выделенный фрагмент (`v-model:selection`); null — фрагмента нет */
	selection?: WaveformRange | null
	/** Фрагмент выделяется перетаскиванием по волне и стрелками с Shift; Escape снимает выделение */
	isSelectable?: boolean
	/** Доступное имя шкалы */
	label: string
	/** Шаг стрелок, секунды; PageUp и PageDown — десятая часть записи */
	step?: number
	/** Шкала только показывает позицию: не получает фокус и не меняет позицию */
	isDisabled?: boolean
	/**
	 * Классы частей (`root`, `bar`, `selection`, `hint` — см. `WAVEFORM_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseWaveform.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseWaveform :ui="{ root: 'rounded-none', bar: 'opacity-80' }" />
	 */
	ui?: UiProp<BaseWaveformPart>
}

/**
 * События компонента BaseWaveform
 */
export interface BaseWaveformEmits {
	/** Новая позиция: щелчок, перетаскивание без выделения или клавиши */
	(event: 'update:currentTime', time: number): void
	/** Новый фрагмент или null — выделение снято */
	(event: 'update:selection', range: WaveformRange | null): void
}
