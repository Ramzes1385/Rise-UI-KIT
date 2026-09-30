import type { Ref } from 'vue'
import type { TourGeometry } from '@components/BaseTour/types/BaseTour.types'

/** Край карточки тура, на котором стоит стрелка: он обращён к подсвеченному элементу */
export type TourArrowSide = 'top' | 'bottom' | 'left' | 'right'

export interface UseTourArrowOptions {
	/** Карточка тура: её размер и место внизу экрана на мобильном */
	cardRef: Ref<HTMLElement | null>
	/** Геометрия шага: подсветка, точка карточки и сторона */
	geometry: Ref<TourGeometry | null>
	/** Мобильная раскладка: карточка прижата к низу экрана */
	isMobile: Ref<boolean>
}

/** Размер и место карточки, px: `offsetWidth`, `offsetHeight`, `offsetLeft`, `offsetTop` — без анимации появления */
export interface TourCardBox {
	width: number
	height: number
	left: number
	top: number
}

/** Карточка и стрелка: сдвиг карточки внутрь окна вдоль края цели и место стрелки на её крае */
export interface TourCardFit {
	/** Край карточки со стрелкой; `null` — стрелки нет (цель под карточкой или карточка не измерена) */
	side: TourArrowSide | null
	/** Сдвиг карточки вдоль края цели, чтобы она не вышла за окно */
	shift: number
	/** Расстояние от начала края карточки до середины цели */
	offset: number
}

/** Окно: ширина и высота, px */
export interface TourViewport {
	width: number
	height: number
}
