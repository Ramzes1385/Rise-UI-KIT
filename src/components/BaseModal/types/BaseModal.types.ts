import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения модального окна:
 * default — рамка и тень; shadow — только тень, без рамки; ghost — без фона, рамки и тени (оформление даёт содержимое слота).
 */
export const MODAL_VARIANTS = ['default', 'ghost', 'shadow'] as const

export type ModalVariant = (typeof MODAL_VARIANTS)[number]

/**
 * Части окна для пропа `ui` (кроме `root` — затемнение): content — окно, header — шапка, header-left — левая часть шапки,
 * title — заголовок, close — кнопка «Закрыть», body — содержимое, footer — подвал.
 */
export const MODAL_PARTS = ['root', 'content', 'header', 'header-left', 'title', 'close', 'body', 'footer'] as const

export type BaseModalPart = (typeof MODAL_PARTS)[number]

export type ModalFullScreen = 'width' | 'height' | 'both'

export interface BaseModalProps extends BaseComponentProps<
	ModalVariant,
	'root' | 'content' | 'header' | 'headerLeft' | 'title' | 'close' | 'body' | 'footer'
> {
	/** Состояние открытия */
	isOpen: boolean
	/** Заголовок */
	title?: string
	/** Закрытие по клику на оверлей */
	closeOnOverlay?: boolean
	/**
	 * Закрытие по Escape (по умолчанию `true`). `false` — блокирующий диалог: Escape не закрывает окно
	 * и не достаётся слоям под ним (поповеру или меню, из которого окно открыто). Закрыть такое окно —
	 * кнопкой в окне; вместе с `closeOnOverlay: false` — только ею
	 */
	closeOnEscape?: boolean
	/** Растянуть окно на всю ширину, высоту или на весь экран (с отступом 16px от краёв) */
	fullScreen?: ModalFullScreen
	/**
	 * Окно внутри контейнера: рендерится на месте (без teleport) и перекрывает ближайшего родителя с position: relative.
	 * Такой диалог немодальный: без aria-modal, ловушки фокуса и блокировки прокрутки страницы.
	 */
	isContained?: boolean
	/** Показывать затемнение фона за модалом */
	hasOverlay?: boolean
	/**
	 * Роль окна: `dialog` (по умолчанию) или `alertdialog` — подтверждение или предупреждение, которое требует ответа.
	 * Скринридер объявляет alertdialog сразу вместе с описанием из `ariaDescribedby`
	 */
	dialogRole?: 'dialog' | 'alertdialog'
	/** id элемента с описанием окна: скринридер читает его после заголовка */
	ariaDescribedby?: string
	/** Имя окна для скринридера, когда видимого заголовка нет: «Палитра команд», «Просмотр фото» */
	ariaLabel?: string
	/**
	 * Появление и уход окна: `scale` (по умолчанию) — масштаб от центра, `fade` — только прозрачность, `slide` — снизу,
	 * `pop` — масштаб с пружиной, `none` — сразу. Длительности — токены движения и пресет `data-rise-motion`;
	 * при «уменьшить движение» — сразу. Глобально — `defaults.BaseModal.animation` или `defaults.global.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей окна: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseModal.ui`.
	 *
	 * @example
	 * <BaseModal :ui="{ content: 'rounded-3xl', footer: 'justify-between' }" />
	 */
	ui?: UiProp<BaseModalPart>
}

export interface BaseModalEmits {
	(event: 'update:isOpen', value: boolean): void
	(event: 'close'): void
	/** Окно закрыто и анимация закрытия закончилась: его можно удалить из DOM */
	(event: 'after-leave'): void
}

export interface BaseModalSlots {
	default?: () => unknown
	/** Подвал модального окна */
	footer?: () => unknown
}
