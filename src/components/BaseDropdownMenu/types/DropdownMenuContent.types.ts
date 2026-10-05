import type { UiClassFn } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { DropdownMenuItem, DropdownMenuItems, DropdownMenuVariant } from './BaseDropdownMenu.types'

/** Части списка меню, которые получают классы `ui` от меню (и панели подменю) */
export type DropdownMenuContentPart = 'panel' | 'content' | 'group' | 'item' | 'label' | 'separator' | 'shortcut' | 'icon'

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
	/** Классы частей (`ui` меню): БЭМ-класс кита и классы приложения */
	ui: UiClassFn<DropdownMenuContentPart>
	/** Появление и уход подменю */
	animation?: EnterAnimation
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
