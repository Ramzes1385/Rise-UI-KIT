import type { BaseComponentProps } from '../../../types/base.types'

/**
 * Варианты маркеров: default — круг цвета события с белой иконкой или точкой; soft — мягкий фон и иконка цвета события;
 * outline — кольцо цвета события на фоне страницы
 */
export const TIMELINE_VARIANTS = ['default', 'soft', 'outline'] as const

/** Цвет маркера события */
export type TimelineColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

/** Событие ленты */
export interface TimelineItem {
	/** Уникальный ключ */
	id: string | number
	/** Заголовок события */
	title: string
	/** Описание под заголовком */
	description?: string
	/** Время события: `Date` или строка ISO показываются в формате языка (`dateFormat`), другая строка — как есть */
	date?: Date | string
	/** Иконка в маркере (имя из спрайта) */
	icon?: string
	/** Цвет маркера (по умолчанию primary) */
	color?: TimelineColor
}

/**
 * Пропсы компонента BaseTimeline
 */
export interface BaseTimelineProps extends BaseComponentProps<(typeof TIMELINE_VARIANTS)[number], 'root' | 'item' | 'marker' | 'content'> {
	/** События сверху вниз (или слева направо) */
	items: TimelineItem[]
	/** Текущее событие: у него `aria-current="step"`, следующие приглушены как предстоящие */
	currentId?: string | number
	/** Направление ленты */
	orientation?: 'vertical' | 'horizontal'
	/** Формат даты (Intl.DateTimeFormat); по умолчанию — «12 мая 2026 г.» */
	dateFormat?: Intl.DateTimeFormatOptions
}

/**
 * Слоты компонента BaseTimeline
 */
export interface BaseTimelineSlots {
	/** Своё содержимое события (маркер и линию рисует компонент) */
	item?: (props: { item: TimelineItem; index: number; isCurrent: boolean; isUpcoming: boolean }) => unknown
}
