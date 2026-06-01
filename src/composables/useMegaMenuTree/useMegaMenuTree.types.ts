import type { InjectionKey, Ref } from 'vue'

/**
 * Реестр раскрытия дерева мега-меню.
 * Хранит единственный активный путь — цепочку открытых узлов сверху вниз.
 * Узел открыт, если активный путь начинается с его пути.
 */
export interface MegaMenuTree {
	/** Активный путь (цепочка ключей открытых узлов через разделитель) */
	activePath: Readonly<Ref<string>>
	/** Узел открыт, если его путь — префикс активного */
	isPathOpen: (path: string) => boolean
	/** Раскрыть узел: активным становится его путь (соседи закрываются) */
	open: (path: string) => void
	/** Свернуть узел: активным становится путь его родителя */
	close: (path: string) => void
}

/** Ключ inject для реестра дерева мега-меню */
export const MEGA_MENU_TREE_KEY: InjectionKey<MegaMenuTree> = Symbol('megaMenuTree')

/** Разделитель сегментов пути узла */
export const MEGA_MENU_PATH_SEPARATOR = '/'
