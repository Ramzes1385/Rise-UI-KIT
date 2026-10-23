import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения тултипа:
 * default — инвертированный фон; soft — мягкий фон основного цвета с рамкой; outline — фон страницы с рамкой;
 * shadow — фон страницы с рамкой и тенью; ghost — приподнятый нейтральный фон без стрелки.
 */
export const TOOLTIP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части тултипа для пропа `ui`: root — обёртка триггера (`.base-tooltip`), popup — подсказка (`.base-tooltip-popup`),
 * text — текст подсказки (`.base-tooltip__text`).
 */
export const TOOLTIP_PARTS = ['root', 'popup', 'text'] as const

export type BaseTooltipPart = (typeof TOOLTIP_PARTS)[number]

export interface BaseTooltipProps extends BaseComponentProps<(typeof TOOLTIP_VARIANTS)[number], 'root' | 'tooltip' | 'text'> {
	/** Текст подсказки */
	text: string
	/** Позиция */
	position?: 'top' | 'bottom' | 'left' | 'right'
	/** Всегда видим */
	isAlwaysVisible?: boolean
	/**
	 * Без обёртки: подсказка вешается на сам элемент слота (первый элемент или компонент), `span.base-tooltip` не создаётся —
	 * `class` и атрибуты, переданные тултипу, попадают на этот элемент, его позиция и размер в разметке не меняются.
	 * Нужен для кнопок как корня компонента и абсолютно позиционированных элементов. Классы `ui.root` и `customClass.root`
	 * в этом режиме не применяются. Триггер должен быть одним элементом или компонентом с одним корневым элементом
	 */
	isWrapperless?: boolean
	/**
	 * Появление и уход подсказки: `fade` (по умолчанию) — прозрачность, `scale` — масштаб от триггера, `slide` — сдвиг
	 * от триггера, `pop` — масштаб с пружиной, `none` — сразу. Длительность — `--rise-duration-fast` и пресет
	 * `data-rise-motion` области триггера; при «уменьшить движение» — сразу. Глобально — `defaults.BaseTooltip.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей тултипа: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseTooltip.ui`.
	 *
	 * @example
	 * <BaseTooltip text="Подсказка" :ui="{ popup: 'max-w-xs', text: 'tracking-wide' }" />
	 */
	ui?: UiProp<BaseTooltipPart>
}

export type BaseTooltipEmits = Record<string, never>

export interface BaseTooltipSlots {
	/**
	 * Триггер тултипа. Кит сам ставит `aria-describedby` на первый фокусируемый элемент в слоте (при `isWrapperless` —
	 * на сам элемент слота) и не ставит, если доступное имя триггера совпадает с текстом подсказки;
	 * `triggerProps` нужен, если фокусируемый элемент вложен глубже
	 */
	default?: (props: { triggerProps: Record<string, string | undefined> }) => unknown
}

export type TooltipProps = PropsWithDefaults<BaseTooltipProps, 'position'>
