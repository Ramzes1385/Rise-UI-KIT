import type { ImageMapDirectoryView } from './BaseImageMap.types'
import type { ResolvedImageMapObject } from './imageMapModel.types'
import type { ImageMapFilter, ImageMapFilterOption, ImageMapFilterType, ImageMapGroup } from './imageMapData.types'

/** Строка списка объектов */
export interface ImageMapDirectoryEntry {
	/** Объект */
	item: ResolvedImageMapObject
	/** Короткое название слоя, если в списке объекты нескольких слоёв */
	layerTitle: string | undefined
	/** Объект выбран */
	isActive: boolean
	/** Объект под указателем на карте или в списке */
	isHovered: boolean
}

/** Раздел списка: группа или буква */
export interface ImageMapDirectorySection {
	/** Ключ раздела */
	id: string
	/** Заголовок; пустой — список без разделов */
	title: string
	/** Строки раздела */
	entries: ImageMapDirectoryEntry[]
}

/** Фильтр, готовый к показу */
export interface ImageMapFilterControl {
	/** Фильтр из данных */
	filter: ImageMapFilter
	/** Вид с учётом умолчания */
	type: ImageMapFilterType
	/** Варианты (свои или группы) */
	options: ImageMapFilterOption[]
	/** Выбранные значения */
	selected: string[]
}

/** Переключение варианта фильтра */
export interface ImageMapFilterToggle {
	/** Id фильтра */
	id: string
	/** Значение варианта */
	value: string
	/** Включён ли вариант */
	isOn: boolean
}

/** Пропсы списка объектов (внутренний компонент BaseImageMap) */
export interface ImageMapDirectoryProps {
	/** Разделы со строками */
	sections: ImageMapDirectorySection[]
	/** Фильтры */
	controls: ImageMapFilterControl[]
	/** Строка поиска */
	search: string
	/** Показывать поле поиска */
	hasSearch: boolean
	/** Вид списка */
	view: ImageMapDirectoryView
	/** Текст статуса для скринридера: сколько найдено; пустой — без объявления */
	statusText: string
	/** Показывать «Сбросить фильтры» */
	hasClear: boolean
	/** Классы из customClass: список и фильтры */
	classes: { directory?: string; filters?: string }
}

/** События списка объектов */
export interface ImageMapDirectoryEmits {
	(event: 'update:search', value: string): void
	(event: 'set-filter', id: string, values: string[]): void
	(event: 'toggle-filter', payload: ImageMapFilterToggle): void
	(event: 'select', id: string, nativeEvent: Event): void
	(event: 'hover', id: string | null): void
	(event: 'clear'): void
}

/** Слоты списка объектов */
export interface ImageMapDirectorySlots {
	/** Содержимое строки */
	item?: (props: { object: ResolvedImageMapObject['object']; group: ImageMapGroup | undefined; isActive: boolean }) => unknown
	/** Пустой список */
	empty?: () => unknown
}
