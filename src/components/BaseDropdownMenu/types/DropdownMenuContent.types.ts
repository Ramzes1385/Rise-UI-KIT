import type { PropsWithDefaults } from '@composables/useDefaults'
import type { DropdownMenuItem, DropdownMenuItems, DropdownMenuVariant } from './BaseDropdownMenu.types'

export interface DropdownMenuContentProps {
	items: DropdownMenuItems
	/** id меню (для aria-controls кнопки) */
	id?: string
	/** id элемента с именем меню: кнопка или пункт с подменю */
	labelledBy?: string
	/** Имя меню, если нет labelledBy */
	ariaLabel?: string
	variant?: DropdownMenuVariant
	sizeScale?: number
	/** Классы частей из customClass компонента */
	classes?: Partial<Record<'panel' | 'item' | 'label' | 'separator', string>>
	/** Уровень вложенности: 0 — меню, 1 и глубже — подменю */
	level?: number
}

export interface DropdownMenuContentEmits {
	/** Выбор пункта; `shouldClose` — закрыть меню (обычный пункт, Enter на флажке) */
	(event: 'select', item: DropdownMenuItem, e: Event, shouldClose: boolean): void
	/** Стрелка влево в подменю: вернуться к пункту меню */
	(event: 'back'): void
	/** Указатель вошёл в меню: подменю не должно закрываться по таймеру родителя */
	(event: 'pointerenter'): void
}

export type MenuContentProps = PropsWithDefaults<DropdownMenuContentProps, 'sizeScale' | 'classes' | 'level'>
