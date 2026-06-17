import { inject, provide, readonly, ref } from 'vue'
import { MEGA_MENU_PATH_SEPARATOR, MEGA_MENU_TREE_KEY } from './useMegaMenuTree.types'
import type { MegaMenuTree } from './useMegaMenuTree.types'

/** Является ли path префиксом-сегментом active (или равен ему) */
function isAncestorPath(path: string, active: string): boolean {
	if (!path) return true
	return active === path || active.startsWith(`${path}${MEGA_MENU_PATH_SEPARATOR}`)
}

/** Путь родителя: всё до последнего разделителя */
function parentPath(path: string): string {
	const index = path.lastIndexOf(MEGA_MENU_PATH_SEPARATOR)
	return index === -1 ? '' : path.slice(0, index)
}

/** Создать изолированный реестр раскрытия дерева */
function createTree(): MegaMenuTree {
	const activePath = ref('')
	return {
		activePath: readonly(activePath),
		isPathOpen: path => isAncestorPath(path, activePath.value),
		open: path => {
			activePath.value = path
		},
		close: path => {
			activePath.value = parentPath(path)
		},
	}
}

/**
 * Создаёт и предоставляет реестр раскрытия дерева мега-меню (provide).
 * Хранит единственный активный путь — поэтому в каждой ветви открыт только
 * один узел на уровень, а раскрытие соседа автоматически закрывает остальные.
 *
 * @example
 * ```ts
 * // в корневом компоненте меню
 * const tree = useMegaMenuTreeProvider()
 * ```
 */
export function useMegaMenuTreeProvider(): MegaMenuTree {
	const tree = createTree()
	provide(MEGA_MENU_TREE_KEY, tree)
	return tree
}

/**
 * Получает реестр раскрытия дерева мега-меню (inject).
 * Используется рекурсивными узлами. Если провайдер отсутствует —
 * возвращает изолированный экземпляр (узел работает автономно).
 */
export function useMegaMenuTree(): MegaMenuTree {
	return inject(MEGA_MENU_TREE_KEY, null) ?? createTree()
}
