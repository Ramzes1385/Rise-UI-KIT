import type { BaseComponentProps } from '@/types/base.types'

/** Сторона размещения карточки-подсказки относительно подсвеченного элемента */
export const TOUR_PLACEMENTS = ['top', 'bottom', 'left', 'right', 'auto'] as const

/** Сторона размещения карточки-подсказки */
export type TourPlacement = (typeof TOUR_PLACEMENTS)[number]

/** Описание одного шага тура */
export interface TourStep {
	/** CSS-селектор целевого элемента, который нужно подсветить */
	target: string
	/** Заголовок шага */
	title?: string
	/** Текст-описание шага */
	content?: string
	/** Предпочтительная сторона размещения карточки для шага */
	placement?: TourPlacement
}

/** Вычисленные координаты подсветки и карточки */
export interface TourGeometry {
	/** Прямоугольник подсветки целевого элемента */
	spotlight: { top: number; left: number; width: number; height: number }
	/** Координаты карточки-подсказки */
	card: { top: number; left: number }
	/** Итоговая сторона размещения карточки */
	placement: Exclude<TourPlacement, 'auto'>
}

/**
 * Подписи кнопок тура
 */
export interface TourLabels {
	/** Текст кнопки перехода к следующему шагу */
	next?: string
	/** Текст кнопки возврата к предыдущему шагу */
	prev?: string
	/** Текст кнопки завершения на последнем шаге */
	finish?: string
	/** Текст кнопки пропуска тура */
	skip?: string
}

/**
 * Настройки поведения тура
 */
export interface TourBehavior {
	/** Закрывать тур при клике по затемнённому фону */
	closeOnOverlayClick?: boolean
	/** Закрывать тур по клавише Escape */
	closeOnEscape?: boolean
	/** Блокировать прокрутку страницы во время тура */
	lockScroll?: boolean
	/** Прокручивать целевой элемент в зону видимости */
	scrollIntoView?: boolean
}

/**
 * Пропсы компонента BaseTour
 */
export interface BaseTourProps extends BaseComponentProps {
	/** Управление видимостью тура (v-model:isOpen) */
	isOpen?: boolean
	/** Список шагов тура */
	steps: TourStep[]
	/** Индекс активного шага (v-model:step) */
	step?: number
	/** Сторона размещения карточки по умолчанию */
	placement?: TourPlacement
	/** Отступ между подсвеченным элементом и карточкой (px) */
	gap?: number
	/** Внутренний отступ подсветки вокруг элемента (px) */
	padding?: number
	/** Скруление подсветки (px) */
	radius?: number
	/** Группа: подписи кнопок */
	labels?: TourLabels
	/** Группа: настройки поведения */
	behavior?: TourBehavior
	/** Показывать кнопку пропуска */
	showSkip?: boolean
	/** Показывать индикатор прогресса (точки шагов) */
	showProgress?: boolean
	/** @deprecated Используйте behavior.closeOnOverlayClick */
	closeOnOverlayClick?: boolean
	/** @deprecated Используйте behavior.closeOnEscape */
	closeOnEscape?: boolean
	/** @deprecated Используйте behavior.lockScroll */
	lockScroll?: boolean
	/** @deprecated Используйте behavior.scrollIntoView */
	scrollIntoView?: boolean
	/** @deprecated Используйте labels.next */
	nextLabel?: string
	/** @deprecated Используйте labels.prev */
	prevLabel?: string
	/** @deprecated Используйте labels.finish */
	finishLabel?: string
	/** @deprecated Используйте labels.skip */
	skipLabel?: string
}

/** Контекст, передаваемый в default-слот карточки тура */
export interface BaseTourSlotContext {
	/** Текущий шаг */
	step: TourStep
	/** Индекс текущего шага */
	index: number
	/** Общее число шагов */
	total: number
	/** Это первый шаг */
	isFirst: boolean
	/** Это последний шаг */
	isLast: boolean
	/** Перейти к следующему шагу */
	next: () => void
	/** Вернуться к предыдущему шагу */
	prev: () => void
	/** Пропустить тур */
	skip: () => void
	/** Завершить тур */
	finish: () => void
}

/**
 * События компонента BaseTour
 */
export interface BaseTourEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'update:step', value: number): void
	(event: 'next', index: number): void
	(event: 'prev', index: number): void
	(event: 'change', index: number): void
	(event: 'skip'): void
	(event: 'finish'): void
	(event: 'close'): void
}

/**
 * Слоты компонента BaseTour
 */
export interface BaseTourSlots {
	/** Полностью кастомное содержимое карточки. Получает контекст текущего шага */
	default?: (props: BaseTourSlotContext) => unknown
	/** Кастомный заголовок карточки */
	title?: (props: { step: TourStep; index: number }) => unknown
	/** Кастомное тело карточки */
	content?: (props: { step: TourStep; index: number }) => unknown
}
