import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения модального окна:
 * default — рамка и тень; shadow — только тень, без рамки; ghost — без фона, рамки и тени (оформление даёт содержимое слота).
 */
export const MODAL_VARIANTS = ['default', 'ghost', 'shadow'] as const

export type ModalVariant = (typeof MODAL_VARIANTS)[number]

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
