import type { ComputedRef, Ref, ShallowRef } from 'vue'

/** Точка на экране в координатах окна */
export interface SortablePoint {
	x: number
	y: number
}

/** Перестановка, которую надо завершить: какой элемент и откуда его взяли */
export interface SortableMove<TPlace> {
	id: string
	origin: TPlace
}

/** Перетаскивание мышью: элемент, точка захвата внутри него и ширина для «призрака» под курсором */
export interface SortableDrag<TItem> {
	item: TItem
	x: number
	y: number
	offsetX: number
	offsetY: number
	width: number
}

/** Нажатие, с которого может начаться перетаскивание: элемент, точка и DOM-элемент под ним */
export interface SortablePress<TItem> {
	item: TItem
	x: number
	y: number
	element: HTMLElement
}

/** Обработчики окна на время перетаскивания */
export interface SortableWindowHandlers {
	move: (event: PointerEvent) => void
	up: () => void
	key: (event: KeyboardEvent) => void
}

/** Что объявить скринридеру во время перестановки с клавиатуры: элемент взят или сдвинут на шаг */
export type SortableAnnouncement = 'PICKED' | 'MOVED'

/** Откуда начата перестановка */
export type SortableSource = 'keyboard' | 'pointer'

/**
 * Где искать элементы для анимации перестановки (FLIP): селектор и ключ `dataset`, в котором лежит id.
 * Например, `{ selector: '[data-card-id]', key: 'cardId' }`.
 */
export interface SortableFlipTarget {
	selector: string
	key: string
}

/** Анимация перестановки (FLIP): элементы плавно едут на новое место, контейнеры — меняют высоту. При `prefers-reduced-motion` — без анимации */
export interface SortableFlipOptions {
	/** Источник порядка: при его смене элементы до и после сравниваются по положению */
	source: () => unknown
	/** Элементы, которые едут на новое место; новые — появляются */
	items: SortableFlipTarget
	/** Контейнеры, у которых плавно меняется высота (колонки канбана) */
	containers?: SortableFlipTarget
	/** Длительность в мс (по умолчанию 220) */
	duration?: number
}

/**
 * Опции `useSortable`. Место (`TPlace`) описывает приложение: индекс в списке, `{ columnId, index }` в канбане.
 * Composable ведёт захват, шаги и отмену; порядок элементов и черновик хранит вызывающий код.
 */
export interface UseSortableOptions<TItem, TPlace> {
	/** Корень: в нём ищутся элементы и вешается анимация */
	rootRef: Ref<HTMLElement | null>
	/** Id элемента */
	itemId: (item: TItem) => string
	/** Перестановка выключена (взять нельзя ни мышью, ни с клавиатуры) */
	isDisabled: () => boolean
	/** Текущее место элемента в показанном порядке; `null` — элемента нет */
	locate: (id: string) => TPlace | null
	/** Совпадают ли два места */
	isSamePlace: (a: TPlace | null, b: TPlace | null) => boolean
	/** Место после шага клавишей (стрелки, Home, End) или `null`, если шагать некуда */
	stepPlace: (id: string, key: string) => TPlace | null
	/** Место под указателем или `null` */
	dropPlace: (point: SortablePoint, id: string) => TPlace | null
	/** DOM-элемент по id: фокус после шага и посадка «призрака» */
	itemElement: (id: string) => HTMLElement | null
	/** Перестановка началась: завести черновик порядка */
	onStart: (id: string, source: SortableSource) => void
	/** Показать элемент на новом месте в черновике */
	onPreview: (id: string, place: TPlace) => void
	/** Положить: применить черновик или отказать; `done` — вызвать в конце */
	onDrop: (move: SortableMove<TPlace>, done: () => void) => void
	/** Отменить: сбросить черновик; `done` — вызвать в конце */
	onCancel: (id: string, done: () => void) => void
	/** Объявить шаг для скринридера */
	onAnnounce: (message: SortableAnnouncement, id: string) => void
	/** Перевести фокус на элемент (после шага, отмены и броска) */
	focusItem: (id: string) => void
	/** Клавиши шага, по умолчанию стрелки, Home и End */
	moveKeys?: readonly string[]
	/** Класс «призрака» на время посадки на место (например, чтобы выпрямить наклон) */
	settlingClass?: string
	/** Анимация перестановки; без опции — без анимации */
	flip?: SortableFlipOptions
}

/** Что возвращает `useSortable` */
export interface UseSortableReturn<TItem> {
	/** Id элемента, взятого с клавиатуры, или `null` */
	grabbedId: ComputedRef<string | null>
	/** Перетаскивание мышью или `null` */
	drag: ShallowRef<SortableDrag<TItem> | null>
	/** Ref на «призрак» под курсором: к нему плавно возвращается элемент после броска */
	ghostRef: Ref<HTMLElement | null>
	/** Стиль «призрака»: ширина и положение под курсором */
	ghostStyle: ComputedRef<Record<string, string>>
	/** Взять элемент с клавиатуры */
	grab: (item: TItem) => void
	/** Клавиша, пока элемент взят: стрелки — шаг, пробел и Enter — положить, Escape — отменить, Tab — отменить и уйти. `true` — элемент взят и клавиша обработана им */
	handleGrabbedKeydown: (event: KeyboardEvent) => boolean
	/** Нажатие мыши на элементе: перетаскивание начнётся после сдвига на 5 px */
	handlePointerDown: (event: PointerEvent, item: TItem) => void
	/** Клик сразу после перетаскивания — не клик: `true`, если его надо пропустить */
	consumeClick: () => boolean
}
