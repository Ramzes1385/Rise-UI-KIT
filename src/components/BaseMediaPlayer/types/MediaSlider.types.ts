import type { MediaTimeRange } from './MediaCore.types'

export interface MediaSliderProps {
	/** Значение */
	modelValue: number
	/** Максимум; NaN — пока неизвестен (длительность до загрузки), ползунок отключён */
	max: number
	/** Шаг стрелок */
	step: number
	/** Шаг PageUp/PageDown */
	largeStep: number
	/** Доступное имя ползунка */
	label: string
	/** Значение для скринридера: «1:23 из 4:56», «50 %» */
	valueText: string
	/** Загруженные отрезки на дорожке */
	buffered?: MediaTimeRange[]
	/** Границы отрезков (главы): разрывы на дорожке */
	marks?: number[]
	/** Подсказка над дорожкой при наведении: время и название главы; без неё подсказки нет */
	hoverText?: (value: number) => string
}

export interface MediaSliderEmits {
	/** Новое значение: перетаскивание, клик по дорожке или клавиши */
	(event: 'update:modelValue', value: number): void
}
