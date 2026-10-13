import type { UiProp } from '@composables/base/useUi'
import type { SeoComponentProps } from '@composables/seo/useStructuredData'
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

/** Цветовая схема карты: `auto` — по теме кита (`data-theme`, `prefers-color-scheme`), следует за сменой темы на лету */
export const MAP_SCHEMES = ['light', 'dark', 'auto'] as const

/** Цветовая схема карты */
export type MapScheme = (typeof MAP_SCHEMES)[number]

/** Подложка: `scheme` — схема, `satellite` — спутник, `hybrid` — спутник с подписями */
export const MAP_LAYERS = ['scheme', 'satellite', 'hybrid'] as const

/** Подложка карты */
export type MapLayer = (typeof MAP_LAYERS)[number]

/**
 * Метка: `id` — ключ для событий, `title` — подпись для экранного диктора и подсказки, `color` — цвет значка,
 * `icon` — имя иконки кита внутри значка, `size` — размер значка в px (по умолчанию 24, умножается на `sizeScale`)
 */
export interface MapMarker {
	id: string | number
	coordinates: MapCoordinates
	title?: string
	color?: string
	icon?: string
	size?: number
}

/**
 * Линия на карте (маршрут): `id` — ключ, `coordinates` — точки по порядку (от двух), `color` — CSS-цвет или токен
 * (`var(--rise-primary)`; по умолчанию основной цвет), `width` — толщина в px (по умолчанию 4),
 * `title` — подпись в списке для экранного диктора
 */
export interface MapPolyline {
	id: string | number
	coordinates: MapCoordinates[]
	color?: string
	width?: number
	title?: string
}

/**
 * Многоугольник на карте (зона доставки): `id` — ключ, `coordinates` — вершины (от трёх, замыкать не нужно),
 * `color` — цвет контура и полупрозрачной заливки (CSS-цвет или токен), `width` — толщина контура в px (по умолчанию 2),
 * `title` — подпись в списке для экранного диктора
 */
export interface MapPolygon {
	id: string | number
	coordinates: MapCoordinates[]
	color?: string
	width?: number
	title?: string
}

/** Что показывает карта: центр и масштаб */
export interface MapView {
	center: MapCoordinates
	zoom: number
}

/**
 * Части BaseMap для пропа `ui` (БЭМ-элементы `.base-map__<часть>`, `root` — вся область карты): canvas — слой, в который
 * поставщик рисует карту; placeholder — заглушка без ключа, без Map ID или при ошибке; balloon — балун открытой метки.
 * Метки `.base-map__marker` создаёт поставщик карты — их оформляют токены `--rise-map-marker-*` и `--rise-map-tooltip-*`
 */
export const MAP_PARTS = ['canvas', 'placeholder', 'balloon'] as const

/** Часть BaseMap для пропа `ui` */
export type BaseMapPart = (typeof MAP_PARTS)[number]

/** Состояние карты: нет ключа, нет Map ID (Google), загрузка скрипта, готова, ошибка загрузки */
export type MapStatus = 'no-key' | 'no-map-id' | 'loading' | 'ready' | 'error'

/**
 * Пропсы компонента BaseMap
 */
export interface BaseMapProps extends SeoComponentProps, BaseComponentProps<MapVariant, 'root' | 'canvas' | 'placeholder' | 'balloon'> {
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
	/**
	 * Цветовая схема карты. `auto` (по умолчанию) — по теме кита: `data-theme` ближайшего предка или `<html>`
	 * (`system` — по `prefers-color-scheme`), смена темы подхватывается сразу. Яндекс переключает слой, Google пересоздаёт карту
	 */
	scheme?: MapScheme
	/** Выбранная метка — её `id` (`v-model:selected`); у выбранной метки открыт балун из слота `balloon`, `null` — ничего не выбрано */
	selected?: string | number | null
	/** Язык подписей карты: `ru_RU`, `en_US` у Яндекса, `ru`, `en` у Google; по умолчанию — язык кита */
	language?: string
	/** Высота карты: CSS-значение; по умолчанию 400px */
	height?: string
	/**
	 * Map ID стиля карты Google — обязателен для `provider="google"` (без него метки не работают): проп или настройка
	 * плагина `defaults.BaseMap.mapId`. Без Map ID скрипт не загружается — вместо карты заглушка. Яндекс его не использует
	 */
	mapId?: string
	/** Имя карты для экранного диктора; по умолчанию «Карта» */
	ariaLabel?: string
	/**
	 * Классы частей (`root`, `canvas`, `placeholder` — см. `MAP_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseMap.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseMap :ui="{ root: 'shadow-lg', placeholder: 'p-8' }" />
	 */
	ui?: UiProp<BaseMapPart>
}

/**
 * События компонента BaseMap
 */
export interface BaseMapEmits {
	/** Новый центр после перемещения карты */
	(event: 'update:center', center: MapCoordinates): void
	/** Новый масштаб после приближения или отдаления */
	(event: 'update:zoom', zoom: number): void
	/** Выбрана другая метка (клик, Enter) или выбор снят (Esc, клик по карте, повторный клик, `close` балуна): `id` или `null` */
	(event: 'update:selected', selected: string | number | null): void
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
	/**
	 * Своя разметка метки вместо пина: внутри кнопки метки, только текст и иконки (кнопка не вкладывает интерактивное).
	 * Без слота метка с `icon` рисует иконку внутри пина
	 */
	marker?: (props: { marker: MapMarker }) => unknown
	/**
	 * Балун открытой метки (`selected`): окно над меткой, Esc и клик по карте закрывают, фокус возвращается на метку.
	 * Без слота выбор лишь отмечает метку. `close` закрывает балун и возвращает фокус на метку
	 */
	balloon?: (props: { marker: MapMarker; close: () => void }) => unknown
	/** Своя заглушка вместо карты: без ключа, без Map ID или при ошибке; `status` — `no-key`, `no-map-id` или `error` */
	placeholder?: (props: { status: MapStatus }) => unknown
}
