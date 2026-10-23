import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { DropdownPosition } from '@components/BaseDropdown/types/BaseDropdown.types'

/**
 * Варианты оформления карточки (те же, что у панели BaseDropdown и BasePopover):
 * default — рамка и тень; outline — рамка заметнее, без тени; shadow — только тень, крупнее;
 * soft — мягкий нейтральный фон без рамки; ghost — без фона, рамки, тени и стрелки (оформление даёт содержимое).
 */
export const HOVER_CARD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type HoverCardVariant = (typeof HOVER_CARD_VARIANTS)[number]

/** Части для пропа `ui`: root — обёртка, trigger — обёртка триггера, panel — панель, inner — содержимое, arrow — стрелка */
export const HOVER_CARD_PARTS = ['root', 'trigger', 'panel', 'inner', 'arrow'] as const

export type BaseHoverCardPart = (typeof HOVER_CARD_PARTS)[number]

export interface BaseHoverCardProps extends BaseComponentProps<HoverCardVariant, 'root' | 'trigger' | 'arrow' | 'inner' | 'panel'> {
	/** Карточка открыта (`v-model:is-open`). Без v-model карточка открывается и закрывается сама */
	isOpen?: boolean
	/** Сторона и выравнивание относительно триггера; у края окна карточка переворачивается и сдвигается */
	position?: DropdownPosition
	/** Задержка перед показом при наведении, мс. При фокусе с клавиатуры карточка открывается сразу */
	openDelay?: number
	/** Задержка перед закрытием после ухода указателя или фокуса, мс: за это время указатель успевает перейти на саму карточку */
	closeDelay?: number
	/** Карточка не открывается и закрыта, если была открыта */
	isDisabled?: boolean
	/** Предел высоты карточки (CSS-длина): содержимое выше прокручивается. По умолчанию `320px` */
	maxHeight?: string
	/**
	 * Появление и уход: `scale` (по умолчанию) — масштаб от стрелки, `fade` — прозрачность, `slide` — сдвиг от триггера,
	 * `pop` — масштаб с пружиной, `none` — сразу. Глобально — `defaults.BaseHoverCard.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseHoverCard.ui`.
	 *
	 * @example
	 * <BaseHoverCard :ui="{ panel: 'max-w-md', inner: 'p-6' }" />
	 */
	ui?: UiProp<BaseHoverCardPart>
}

export interface BaseHoverCardEmits {
	(event: 'update:isOpen', value: boolean): void
	/** Карточка открылась */
	(event: 'open'): void
	/** Карточка закрылась: уходом указателя или фокуса, Escape, кликом снаружи */
	(event: 'close'): void
}

export interface BaseHoverCardSlots {
	/**
	 * Триггер: ссылка, аватар, имя. Наведение и фокус на нём открывают карточку, на касании она открывается нажатием.
	 * Первый фокусируемый элемент слота получает `aria-describedby` на открытую карточку; триггер без фокусируемого элемента
	 * (`span`, `BaseAvatar`) получает `tabindex="0"`, чтобы карточку можно было открыть с клавиатуры
	 */
	trigger?: (props: { isOpen: boolean }) => unknown
	/**
	 * Содержимое карточки. Это дополнение к триггеру: всё важное должно быть доступно и без карточки.
	 * С клавиатуры до содержимого не добраться (карточка в `body`, Tab уходит мимо, потеря фокуса триггером закрывает её),
	 * поэтому интерактивные элементы в ней недоступны — для них нужен `BasePopover`
	 */
	default?: () => unknown
}

export type HoverCardProps = PropsWithDefaults<
	BaseHoverCardProps,
	'isOpen' | 'position' | 'openDelay' | 'closeDelay' | 'isDisabled' | 'maxHeight'
>

/** Что открывает и закрывает карточку: события триггера и карточки */
export interface HoverIntent {
	handlePointerenter: (event: PointerEvent) => void
	handlePointerleave: (event: PointerEvent) => void
	handlePointerdown: (event: PointerEvent) => void
	handleKeydown: () => void
	handleClick: () => void
	handleFocusin: () => void
	handleFocusout: (event: FocusEvent) => void
	/** Указатель или фокус на самой карточке: закрытие отменяется */
	hold: () => void
	/** Указатель или фокус ушёл с карточки */
	release: (event: FocusEvent | PointerEvent) => void
}

/** Что нужно наблюдателю за наведением: задержки, состояние и проверка, принадлежит ли узел карточке или триггеру */
export interface HoverIntentOptions {
	openDelay: () => number
	closeDelay: () => number
	isDisabled: () => boolean
	isOpen: () => boolean
	setOpen: (value: boolean) => void
	isWithinCard: (node: EventTarget | null) => boolean
}
