import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения поповера (те же, что у панели BaseDropdown):
 * default — рамка и тень; outline — рамка заметнее, без тени; shadow — только тень, крупнее;
 * soft — мягкий нейтральный фон без рамки; ghost — без фона, рамки, тени и стрелки (оформление даёт содержимое).
 */
export const POPOVER_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type PopoverVariant = (typeof POPOVER_VARIANTS)[number]

/** Части для пропа `ui`: root — обёртка, trigger — обёртка триггера, panel — панель, inner — содержимое, arrow — стрелка */
export const POPOVER_PARTS = ['root', 'trigger', 'panel', 'inner', 'arrow'] as const

export type BasePopoverPart = (typeof POPOVER_PARTS)[number]

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right'

export interface BasePopoverProps extends BaseComponentProps<PopoverVariant, 'root' | 'trigger' | 'arrow' | 'inner' | 'panel'> {
	/** Состояние открытия */
	isOpen?: boolean
	/** Позиция */
	position?: PopoverPosition
	/** Предел высоты панели (CSS-длина): содержимое выше прокручивается. По умолчанию `320px`, как у BaseDropdown */
	maxHeight?: string
	/**
	 * Появление и уход: `scale` (по умолчанию) — масштаб от стрелки, `fade` — прозрачность, `slide` — сдвиг от триггера,
	 * `pop` — масштаб с пружиной, `none` — сразу. Глобально — `defaults.BasePopover.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей: добавляются к БЭМ-классам кита, глобальные — `defaults.BasePopover.ui`.
	 *
	 * @example
	 * <BasePopover :ui="{ panel: 'max-w-md', inner: 'p-6' }" />
	 */
	ui?: UiProp<BasePopoverPart>
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
