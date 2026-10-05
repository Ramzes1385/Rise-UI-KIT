import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** У компонента одно оформление: строка состояния под списком */
export const INFINITE_SCROLL_VARIANTS = ['default'] as const

/**
 * Части ленты для пропа `ui` (БЭМ-элементы `.base-infinite-scroll__<часть>`, `root` — обёртка списка):
 * sentinel — невидимая метка конца списка, за которой следит подгрузка; footer — строка состояния под списком;
 * loader — индикатор загрузки (появляется и гаснет плавно); message — текст состояния (`role="status"`).
 */
export const INFINITE_SCROLL_PARTS = ['sentinel', 'footer', 'loader', 'message'] as const

export type BaseInfiniteScrollPart = (typeof INFINITE_SCROLL_PARTS)[number]

/**
 * Режим подгрузки: `intersect` — сама, когда конец списка подходит к краю области; `manual` — кнопкой «Загрузить ещё»
 */
export type InfiniteScrollMode = 'intersect' | 'manual'

/** Итог подгрузки: `ok` — есть ещё, `empty` — список закончился, `error` — ошибка (кнопка «Повторить») */
export type InfiniteScrollResult = 'ok' | 'empty' | 'error'

export type InfiniteScrollStatus = 'idle' | 'loading' | 'empty' | 'error'

/** Данные события load: done сообщает итог подгрузки */
export interface InfiniteScrollLoadEvent {
	done: (result: InfiniteScrollResult) => void
}

/** `sizeScale` масштабирует строку состояния; `variant` и `color` не используются. */
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
	/**
	 * Классы частей ленты (`root`, `sentinel`, `footer`, `loader`, `message`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseInfiniteScroll: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseInfiniteScroll :ui="{ footer: 'sticky bottom-0', message: 'italic' }" @load="onLoad">…</BaseInfiniteScroll>
	 */
	ui?: UiProp<BaseInfiniteScrollPart>
}

export interface BaseInfiniteScrollEmits {
	/** Пора подгрузить следующую часть; вызовите done с итогом */
	(event: 'load', value: InfiniteScrollLoadEvent): void
}

export interface BaseInfiniteScrollSlots {
	/** Список */
	default?: () => unknown
}

export interface BaseInfiniteScrollExpose {
	/** Начать заново (после смены фильтра): состояние сбрасывается, подгрузка снова следит за концом списка */
	reset: () => void
	/** Подгрузить сейчас */
	load: () => void
}
