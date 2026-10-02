import { computed, ref, watch } from 'vue'
import { formatMessage } from '@/locales/state'
import { daysInMonth } from '@utils/data/dateUtils'
import { addDays } from '@utils/calendar/eventUtils'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { periodTitle, viewLabel } from './eventCalendarFormat'
import type { EventCalendarContext } from '../types/BaseEventCalendarModel.types'
import type { EventCalendarToolbarSlotProps, EventCalendarView } from '../types/BaseEventCalendar.types'

function shiftMonths(date: Date, months: number): Date {
	const first = new Date(date.getFullYear(), date.getMonth() + months, 1)
	return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), daysInMonth(first.getFullYear(), first.getMonth())))
}

export function shiftPeriod(view: EventCalendarView, date: Date, direction: number): Date {
	if (view === 'week') return addDays(date, 7 * direction)
	if (view === 'day') return addDays(date, direction)
	return shiftMonths(date, direction)
}

export function useEventCalendarToolbar(context: EventCalendarContext) {
	const { props, view, date, period, setDate, setView } = context
	const title = computed(() => periodTitle(period.value, date.value))
	const status = ref('')
	watch([title, view], () => {
		status.value = formatMessage(UI_EVENT_CALENDAR.STATUS, { period: title.value, view: viewLabel(view.value) })
	})
	const actions = {
		today: (): void => setDate(context.today.value),
		prev: (): void => setDate(shiftPeriod(view.value, date.value, -1)),
		next: (): void => setDate(shiftPeriod(view.value, date.value, 1)),
		setView,
	}
	return {
		...actions,
		title,
		status,
		viewOptions: computed(() => props.views.map(value => ({ value, label: viewLabel(value) }))),
		handleViewChange: (value: string | number | null): void => setView(value as EventCalendarView),
		toolbarProps: computed<EventCalendarToolbarSlotProps>(() => ({
			title: title.value,
			view: view.value,
			date: date.value,
			period: period.value,
			...actions,
		})),
	}
}
