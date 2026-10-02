import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { CalendarTimeSegment, CalendarWeekSegment, NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import type {
	BaseEventCalendarEmits,
	BaseEventCalendarProps,
	EventCalendarPeriod,
	EventCalendarResource,
	EventCalendarSelection,
	EventCalendarView,
} from './BaseEventCalendar.types'

/** Пропсы после `withDefaults`: значения по умолчанию заданы в `ui/BaseEventCalendar.vue` */
export type EventCalendarProps = PropsWithDefaults<
	BaseEventCalendarProps,
	'events' | 'view' | 'views' | 'slotDuration' | 'maxEventsPerDay' | 'hasNowIndicator' | 'isSelectable' | 'isEditable' | 'resources'
>

/** Событие, которое сейчас переносят или растягивают: ключ показа и новое время; `isBlocked` — `canMove` запретил */
export interface EventCalendarDraft {
	key: string
	start: Date
	end: Date
	isBlocked: boolean
	/** Ресурс колонки, куда переносят: есть только при заданных `resources` */
	resourceId?: string | number
}

/** Выделение: откуда начали (`anchor`) и где сейчас (`focus`) — дни (`allDay`) или начала шагов времени */
export interface EventCalendarSelectionState {
	anchor: Date
	focus: Date
	allDay: boolean
	/** Ресурс колонки, где начали выделение: выделение не выходит за его колонки */
	resourceId?: string | number
}

/** Общее состояние календаря: вид, дата, сегодня, показанный период и его события */
export interface EventCalendarContext {
	props: EventCalendarProps
	emit: BaseEventCalendarEmits
	view: ShallowRef<EventCalendarView>
	date: ShallowRef<Date>
	now: ComputedRef<Date>
	today: ComputedRef<Date>
	firstDay: ComputedRef<number>
	period: ComputedRef<EventCalendarPeriod>
	items: ComputedRef<NormalizedCalendarEvent[]>
	/** Ресурсы колонок недели и дня; пусто — в месяце, списке и без `resources` */
	resources: ComputedRef<EventCalendarResource[]>
	/** Шаг сетки времени, минуты (5–60) */
	step: ComputedRef<number>
	/** Текст `role="status"`: смена периода, выделение, перенос */
	status: Ref<string>
	draft: ShallowRef<EventCalendarDraft | null>
	rootRef: Ref<HTMLElement | null>
	setDate: (value: Date) => void
	setView: (value: EventCalendarView) => void
}

/** День сетки месяца */
export interface EventCalendarMonthDay {
	date: Date
	key: string
	column: number
	isToday: boolean
	isOutside: boolean
	label: string
	/** События дня, которые не поместились: за кнопкой «+N ещё» */
	hidden: number
	/** Все события дня — для поповера и слота `day` */
	items: NormalizedCalendarEvent[]
}

/** Неделя сетки месяца: дни, отрезки событий и сколько рядов видно */
export interface EventCalendarMonthWeek {
	key: string
	days: EventCalendarMonthDay[]
	segments: CalendarWeekSegment[]
	lanes: number
	hasMore: boolean
}

/**
 * Колонка сетки времени — день, а при заданных `resources` — день ресурса: подпись, рабочие часы (доли суток),
 * события со временем. `key` — ключ колонки (`<ресурс>|<ГГГГ-ММ-ДД>` или `ГГГГ-ММ-ДД`), `dayKey` — ключ дня
 */
export interface EventCalendarTimeDay {
	date: Date
	key: string
	dayKey: string
	resource: EventCalendarResource | null
	/** Первая колонка ресурса: от соседнего ресурса её отделяет заметная граница */
	isResourceStart: boolean
	/** Доступное имя колонки: день, у ресурса — «Переговорная, пн, 2 окт.» */
	name: string
	label: string
	isToday: boolean
	work: { top: number; height: number } | null
	segments: CalendarTimeSegment[]
}

/** Шаг шкалы времени: время и подпись (у шагов не на целый час подписи нет) */
export interface EventCalendarTimeSlot {
	key: string
	time: Date
	label: string
	isHour: boolean
}

/** Слот события по приоритету: `event-<id>`, `category-<категория>`, `event` */
export type EventSlotName = 'event' | `event-${string}` | `category-${string}`

/** Слот дня месяца: `day-<ГГГГ-ММ-ДД>` или `day` */
export type DaySlotName = 'day' | `day-${string}`

/** Слот заголовка ресурса: `resource-<id>` или `resource` */
export type ResourceSlotName = 'resource' | `resource-${string}`

/** Точка экрана: координаты указателя */
export interface ScreenPoint {
	x: number
	y: number
}

/** Обработчики слежения за указателем после нажатия: движение, отпускание, отмена (Escape, `pointercancel`) */
export interface PointerTrackHandlers {
	move: (point: ScreenPoint) => void
	up: (point: ScreenPoint) => void
	cancel: () => void
}

/** Выделение для мыши и клавиатуры: состояние, диапазон и действия */
export interface EventCalendarSelectionApi {
	selection: ShallowRef<EventCalendarSelectionState | null>
	range: ComputedRef<EventCalendarSelection | null>
	update: (state: EventCalendarSelectionState | null) => void
	clear: () => void
	finish: (state: EventCalendarSelectionState) => void
}

/** Где лежит событие, которое переносят: сетка месяца, строка «Весь день» или сетка времени */
export type EventCalendarEditKind = 'month' | 'all-day' | 'time'

/** Сдвиг времени события: дни по календарю и минуты */
export interface EventCalendarShift {
	days: number
	minutes: number
}

/** Время события: начало и конец (не входит); `resourceId` — ресурс колонки, если заданы `resources` */
export interface EventCalendarTime {
	start: Date
	end: Date
	resourceId?: string | number
}

/** id ресурса; `undefined` — колонка без ресурса */
export type ResourceId = string | number | undefined

/** Место в сетке времени: время шага или день и ресурс колонки */
export interface EventCalendarSlot {
	date: Date
	resourceId?: string | number
}

/** Заголовок ресурса над его колонками: ресурс, дни, сколько колонок занимает */
export interface EventCalendarResourceHeader {
	key: string
	resource: EventCalendarResource
	days: Date[]
}

/** Событие, взятое с клавиатуры: исходный показ и где он лежит */
export interface EventCalendarGrab {
	item: NormalizedCalendarEvent
	kind: EventCalendarEditKind
}

/** Нажатие на событие мышью: событие, где лежит, место и точка нажатия, тянут ли за край (растягивание) */
export interface EventCalendarPress {
	item: NormalizedCalendarEvent
	kind: EventCalendarEditKind
	origin: EventCalendarSlot
	point: ScreenPoint
	isResize: boolean
}

/** Объявление переноса с клавиатуры: ключ строки словаря `eventCalendar` */
export type EventCalendarAnnouncement = 'PICKED' | 'MOVED' | 'DROPPED' | 'CANCELLED' | 'BLOCKED'
