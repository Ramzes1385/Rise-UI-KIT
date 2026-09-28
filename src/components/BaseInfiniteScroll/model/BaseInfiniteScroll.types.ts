import type { BaseComponentProps } from '@composables/useBaseComponent'

/** У компонента одно оформление: строка состояния под списком */
export const INFINITE_SCROLL_VARIANTS = ['default'] as const

/**
 * Режим подгрузки: `intersect` — сама, когда конец списка подходит к краю области; `manual` — кнопкой «Загрузить ещё»
 */
export type InfiniteScrollMode = 'intersect' | 'manual'

/** Итог подгрузки: `ok` — есть ещё, `empty` — список закончился, `error` — ошибка (кнопка «Повторить») */
export type InfiniteScrollResult = 'ok' | 'empty' | 'error'

/** Состояние компонента */
export type InfiniteScrollStatus = 'idle' | 'loading' | 'empty' | 'error'

/** Данные события load: done сообщает итог подгрузки */
export interface InfiniteScrollLoadEvent {
	done: (result: InfiniteScrollResult) => void
}

/**
 * Пропсы компонента BaseInfiniteScroll.
 * `sizeScale` масштабирует строку состояния; `variant` и `color` не используются.
 */
export interface BaseInfiniteScrollProps extends BaseComponentProps<(typeof INFINITE_SCROLL_VARIANTS)[number], 'root' | 'status'> {
	/** Режим подгрузки */
	mode?: InfiniteScrollMode
	/** За сколько пикселей до края области начинать подгрузку */
	distance?: number
	/** Прокручиваемый контейнер — CSS-селектор или элемент; по умолчанию окно */
	root?: string | HTMLElement
	/** Текст во время загрузки (по умолчанию «Загрузка...») */
	loadingText?: string
	/** Текст в конце списка (по умолчанию «Больше ничего нет») */
	emptyText?: string
	/** Текст ошибки (по умолчанию «Не удалось загрузить») */
	errorText?: string
	/** Кнопка в режиме manual (по умолчанию «Загрузить еще») */
	loadMoreText?: string
}

/**
 * События компонента BaseInfiniteScroll
 */
export interface BaseInfiniteScrollEmits {
	/** Пора подгрузить следующую часть; вызовите done с итогом */
	(event: 'load', value: InfiniteScrollLoadEvent): void
}

/**
 * Слоты компонента BaseInfiniteScroll
 */
export interface BaseInfiniteScrollSlots {
	/** Список */
	default?: () => unknown
}

/**
 * Методы BaseInfiniteScroll (ref)
 */
export interface BaseInfiniteScrollExpose {
	/** Начать заново (после смены фильтра): состояние сбрасывается, подгрузка снова следит за концом списка */
	reset: () => void
	/** Подгрузить сейчас */
	load: () => void
}
