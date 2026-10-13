import type { Ref } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const CALENDAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type CalendarVariant = (typeof CALENDAR_VARIANTS)[number]

/**
 * Части календаря для пропа `ui` (БЭМ-элементы `.base-calendar__<часть>`, `root` — корень):
 * header — шапка; nav-btn — стрелки «назад» и «вперёд»; title-btn — кнопка заголовка (смена вида); title — текст заголовка;
 * days — вид «дни» (дни недели и сетка); weekdays — строка дней недели; weekday — день недели; week-num-header — заголовок
 * колонки номеров недель; week-num — номер недели; grid — сетка дней; day-wrapper — ячейка дня; day — кнопка дня;
 * day-dot — точка события; popover — всплывающая карточка дня; popover-arrow — её стрелка; popover-date — дата в карточке;
 * popover-highlights — список событий; popover-highlight — событие; popover-highlight-dot — точка события в списке;
 * months — вид «месяцы»; month-btn — кнопка месяца; years — вид «годы»; year-btn — кнопка года; time — блок времени;
 * time-caption — подпись «Время»; time-fields — поля времени; time-input — поле часов, минут или секунд;
 * time-sep — двоеточие; time-ampm — переключатель AM/PM; footer — подвал; today-btn — кнопка «Сегодня».
 */
export const CALENDAR_PARTS = [
	'header',
	'nav-btn',
	'title-btn',
	'title',
	'days',
	'weekdays',
	'weekday',
	'week-num-header',
	'week-num',
	'grid',
	'day-wrapper',
	'day',
	'day-dot',
	'popover',
	'popover-arrow',
	'popover-date',
	'popover-highlights',
	'popover-highlight',
	'popover-highlight-dot',
	'months',
	'month-btn',
	'years',
	'year-btn',
	'time',
	'time-caption',
	'time-fields',
	'time-input',
	'time-sep',
	'time-ampm',
	'footer',
	'today-btn',
] as const

export type BaseCalendarPart = (typeof CALENDAR_PARTS)[number]

/** Последняя смена отображения: `view` — дни ↔ месяцы ↔ годы, `next` и `prev` — период вперёд или назад */
export type CalendarChange = 'view' | 'next' | 'prev'

/** Состояние календаря, по которому выбирается движение: вид, месяц и год */
export interface CalendarMotionSource {
	/** Текущий вид */
	currentView: Ref<CalendarView>
	/** Отображаемый месяц (0-11) */
	currentMonth: Ref<number>
	/** Отображаемый год */
	currentYear: Ref<number>
}

export type CalendarSelectionMode = 'single' | 'range' | 'multiple'

export type CalendarView = 'days' | 'months' | 'years'

/**
 * День недели (0 = воскресенье, 6 = суббота)
 */
export type CalendarWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface CalendarHighlight {
	/** Дата */
	date: Date
	/** CSS-класс */
	cssClass?: string
	/** Цвет маркера */
	color?: string
	/** Подпись (отображается в popover) */
	label?: string
}

export interface CalendarWeekends {
	/** Дни недели, считающиеся выходными (0=вс, 1=пн, ..., 6=сб) */
	days: CalendarWeekday[]
	/** Праздничные даты */
	holidays: Date[]
}

export interface CalendarTimeConfig {
	/** Показывать выбор времени */
	showTime?: boolean
	/** Показывать секунды */
	showSeconds?: boolean
	/** Формат времени 24ч */
	is24Hour?: boolean
}

/**
 * Ограничения календаря (даты, которые нельзя выбрать)
 */
export interface CalendarConstraints {
	/** Минимальная дата */
	minDate?: Date | null
	/** Максимальная дата */
	maxDate?: Date | null
	/** Выключенные даты */
	disabledDates?: Date[]
	/** Выключенные дни недели */
	disabledWeekdays?: CalendarWeekday[]
	/** Выключить даты начиная с (отключает все после) */
	disableFrom?: Date | null
	/** Выключить даты до (отключает все до) */
	disableTo?: Date | null
}

export interface CalendarDisplayConfig {
	/** Показывать кнопки навигации в шапке */
	showNavigation?: boolean
	/** Разрешить переключение вида (месяцы/годы) при клике на заголовок */
	canSwitchView?: boolean
	/** Показывать кнопку "Сегодня" в подвале */
	showTodayButton?: boolean
	/** Показывать год в заголовке */
	showYear?: boolean
	/** Показывать номер недели */
	showWeekNumber?: boolean
}

export interface BaseCalendarProps extends BaseComponentProps<
	CalendarVariant,
	'root' | 'header' | 'weekdays' | 'grid' | 'dayWrapper' | 'day' | 'popover' | 'months' | 'years' | 'time' | 'footer'
> {
	/** Выбранная дата / начало диапазона */
	modelValue?: Date | null
	/** Конец диапазона (для range) */
	modelValueEnd?: Date | null
	/** Выбранные даты (для multiple) */
	selectedDates?: Date[]
	/** Режим выбора */
	selectionMode?: CalendarSelectionMode
	/** Группа: конфигурация времени */
	timeConfig?: CalendarTimeConfig
	/** Группа: ограничения дат */
	constraints?: CalendarConstraints
	/** Группа: настройки отображения */
	displayConfig?: CalendarDisplayConfig
	/** Выделенные даты */
	highlights?: CalendarHighlight[]
	/** Конфигурация выходных */
	weekends?: CalendarWeekends | null
	/** Первый день недели (0=вс, 1=пн) */
	firstDayOfWeek?: CalendarWeekday
	/** Локаль */
	locale?: string
	/** Показывать popover при клике на дату */
	showDatePopover?: boolean
	/** Отключённый календарь */
	isDisabled?: boolean
	/** Начальный месяц (0-11). Если не задан — текущий */
	initialMonth?: number
	/** Начальный год. Если не задан — текущий */
	initialYear?: number
	/**
	 * Дата «сегодня»: на ней кольцо дня (`--rise-calendar-day-ring`), к ней ведёт кнопка «Сегодня», по ней выбирается начальный месяц.
	 * Без пропа календарь берёт текущую дату по часам; проп нужен историям, снимкам и тестам, где «сегодня» должно быть одним и тем же.
	 */
	today?: Date
	/**
	 * Классы частей календаря (`root`, `header`, `title`, `grid`, `day`, `months`, `footer`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseCalendar: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseCalendar v-model="date" :ui="{ title: 'tracking-wide', day: 'font-medium' }" />
	 */
	ui?: UiProp<BaseCalendarPart>
}

export interface BaseCalendarEmits {
	(event: 'update:modelValue', value: Date | null): void
	(event: 'update:modelValueEnd', value: Date | null): void
	(event: 'update:selectedDates', value: Date[]): void
	(event: 'date-click', date: Date): void
	(event: 'range-select', start: Date, end: Date): void
	(event: 'month-change', month: number): void
	(event: 'year-change', year: number): void
	(event: 'view-change', view: CalendarView): void
}

export interface BaseCalendarSlots {
	/** Кастомная ячейка дня */
	day?: (props: {
		date: Date
		isToday: boolean
		isSelected: boolean
		isDisabled: boolean
		isWeekend: boolean
		isInRange: boolean
	}) => unknown
	/** Кастомный заголовок */
	header?: (props: { month: number; year: number }) => unknown
	/** Кастомный popover для даты */
	'date-popover'?: (props: { date: Date; close: () => void; highlights: CalendarHighlight[] }) => unknown
}
