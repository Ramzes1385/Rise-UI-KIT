import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения поповера (те же, что у панели BaseDropdown):
 * default — рамка и тень; outline — рамка заметнее, без тени; shadow — только тень, крупнее;
 * soft — мягкий нейтральный фон без рамки; ghost — без фона, рамки, тени и стрелки (оформление даёт содержимое).
 */
export const POPOVER_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type PopoverVariant = (typeof POPOVER_VARIANTS)[number]

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'

export interface BasePopoverProps extends BaseComponentProps<PopoverVariant, 'root' | 'trigger' | 'arrow' | 'inner' | 'panel'> {
	/** Состояние открытия */
	isOpen?: boolean
	/** Позиция */
	position?: PopoverPosition
	/** Предел высоты панели (CSS-длина): содержимое выше прокручивается. По умолчанию `320px`, как у BaseDropdown */
	maxHeight?: string
}

export interface BasePopoverEmits {
	(event: 'update:isOpen', value: boolean): void
	/** Поповер закрыт: кнопкой, Escape или кликом снаружи */
	(event: 'close'): void
}

export interface BasePopoverSlots {
	/**
	 * Триггер. Кит ставит `aria-haspopup`, `aria-expanded` и `aria-controls` на первый фокусируемый элемент в слоте;
	 * `triggerProps` нужен, если он вложен глубже. Без фокусируемого элемента (в слоте `span`, `BaseAvatar`) первый
	 * элемент слота получает `role="button"` и `tabindex="0"`, Enter и Space открывают поповер
	 */
	trigger?: (props: { isOpen: boolean; triggerProps: Record<string, string | undefined> }) => unknown
	/** Содержимое поповера */
	default?: () => unknown
}

export type PopoverProps = PropsWithDefaults<BasePopoverProps, 'isOpen'>
