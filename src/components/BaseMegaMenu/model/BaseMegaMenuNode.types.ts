import type { MegaMenuItem, MegaMenuLayout, MegaMenuTrigger } from './BaseMegaMenu.types'

/**
 * Пропсы рекурсивного узла BaseMegaMenuNode.
 */
export interface BaseMegaMenuNodeProps {
	/** Данные узла */
	item: MegaMenuItem
	/** Уровень вложенности (0 = корневой пункт списка) */
	level: number
	/** Путь родителя в дереве раскрытия (для режима «открыт только один узел») */
	parentPath: string
	/** Режим раскрытия подменю */
	trigger: MegaMenuTrigger
	/** Режим отображения родительского меню */
	layout: MegaMenuLayout
	/** Мобильный режим: вложенные узлы — аккордеон вниз; на десктопе — каскад flyout */
	isMobile: boolean
	/** Задержка закрытия при hover (мс) */
	hoverDelay: number
	/** Масштаб размера */
	sizeScale: number
}

/**
 * События узла BaseMegaMenuNode.
 */
export interface BaseMegaMenuNodeEmits {
	(event: 'navigate', url: string): void
	(event: 'item-click', item: MegaMenuItem): void
}

/**
 * Слоты узла BaseMegaMenuNode.
 */
export interface BaseMegaMenuNodeSlots {
	/** Кастомный рендер пункта меню */
	item?: (props: { item: MegaMenuItem; level: number }) => unknown
}
