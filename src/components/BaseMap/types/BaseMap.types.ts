import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления: `default` — рамка и скругление, `outline` — акцентная рамка, `ghost` — без рамки и скругления */
export const MAP_VARIANTS = ['default', 'outline', 'ghost'] as const

/** Вариант оформления карты */
export type MapVariant = (typeof MAP_VARIANTS)[number]

/** Поставщики карт: `yandex` — Яндекс Карты (API v3), `google` — Google Maps JavaScript API */
export const MAP_PROVIDERS = ['yandex', 'google'] as const

/** Поставщик карты */
export type MapProvider = (typeof MAP_PROVIDERS)[number]

/** Точка на карте: широта и долгота в градусах */
export interface MapCoordinates {
	lat: number
	lng: number
}

/** Метка: `id` — ключ для событий, `title` — подпись для экранного диктора и подсказки, `color` — цвет значка */
export interface MapMarker {
	id: string | number
	coordinates: MapCoordinates
	title?: string
	color?: string
}

/** Что показывает карта: центр и масштаб */
export interface MapView {
	center: MapCoordinates
	zoom: number
}

/** Состояние карты: нет ключа, загрузка скрипта, готова, ошибка загрузки */
export type MapStatus = 'no-key' | 'loading' | 'ready' | 'error'

/**
 * Пропсы компонента BaseMap
 */
export interface BaseMapProps extends BaseComponentProps<MapVariant, 'root' | 'canvas' | 'placeholder'> {
	/** Поставщик карты */
	provider?: MapProvider
	/**
	 * Ключ API поставщика. Задаётся пропом или для всех карт настройкой плагина `defaults.BaseMap.apiKey`.
	 * Без ключа внешний скрипт не загружается — вместо карты заглушка
	 */
	apiKey?: string
	/** Центр карты (`v-model:center`) */
	center?: MapCoordinates
	/** Масштаб, 0–21 (`v-model:zoom`) */
	zoom?: number
	/** Метки на карте */
	markers?: MapMarker[]
	/** Язык подписей карты: `ru_RU`, `en_US` у Яндекса, `ru`, `en` у Google; по умолчанию — язык кита */
	language?: string
	/** Высота карты: CSS-значение; по умолчанию 400px */
	height?: string
	/** Map ID стиля карты Google — нужен для меток; по умолчанию демо-стиль `DEMO_MAP_ID`. Яндекс его не использует */
	mapId?: string
	/** Имя карты для экранного диктора; по умолчанию «Карта» */
	ariaLabel?: string
}

/**
 * События компонента BaseMap
 */
export interface BaseMapEmits {
	/** Новый центр после перемещения карты */
	(event: 'update:center', center: MapCoordinates): void
	/** Новый масштаб после приближения или отдаления */
	(event: 'update:zoom', zoom: number): void
	/** Клик по карте: координаты точки */
	(event: 'click', coordinates: MapCoordinates): void
	/** Клик по метке или Enter на ней */
	(event: 'marker-click', marker: MapMarker): void
	/** Карта загружена и показана */
	(event: 'ready'): void
	/** Скрипт поставщика не загрузился или ключ отклонён */
	(event: 'error', error: Error): void
}

/**
 * Слоты компонента BaseMap
 */
export interface BaseMapSlots {
	/** Своя заглушка вместо карты: без ключа или при ошибке; `status` — `no-key` или `error` */
	placeholder?: (props: { status: MapStatus }) => unknown
}
