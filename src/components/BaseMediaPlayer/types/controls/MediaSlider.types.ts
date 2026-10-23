import type { MediaTimeRange } from '../playback/MediaCore.types'

/** Отрезок дорожки ползунка */
export interface MediaSliderSegment {
	/** Начало */
	start: number
	/** Конец */
	end: number
	/** Цвет; без цвета — цвет дорожки */
	color?: string
}

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
	/** Отрезки дорожки (главы): каждый со своим цветом и заполнением, отрезок под указателем растёт */
	segments?: MediaSliderSegment[]
	/** Подсказка над дорожкой при наведении; свой вид — слот `tooltip`; без обоих подсказки нет */
	hoverText?: (value: number) => string
	/** Точки на дорожке: рекламные паузы */
	markers?: number[]
	/** Выделенные отрезки: рекламные интеграции */
	highlights?: MediaTimeRange[]
	/** Вертикальный ползунок (громкость во всплывающей панели): значение растёт снизу вверх */
	isVertical?: boolean
}

export interface MediaSliderEmits {
	/** Новое значение: перетаскивание, клик по дорожке или клавиши */
	(event: 'update:modelValue', value: number): void
}

export interface MediaSliderSlots {
	/** Содержимое подсказки над дорожкой: значение под указателем */
	tooltip?: (props: { value: number }) => unknown
}
