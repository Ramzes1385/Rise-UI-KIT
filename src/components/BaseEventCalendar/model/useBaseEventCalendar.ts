import { computed } from 'vue'
import { formatFullDate } from './eventCalendarFormat'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { groupByDay } from '@utils/calendar/eventUtils'
import { useEventCalendarMonth } from './useEventCalendarMonth'
import { useEventCalendarEvents } from './useEventCalendarEvents'
import { useEventCalendarContext } from './useEventCalendarContext'
import { useEventCalendarToolbar } from './useEventCalendarToolbar'
import { useEventCalendarTimeGrid } from './useEventCalendarTimeGrid'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseEventCalendarEmits } from '../types/BaseEventCalendar.types'
import type { EventCalendarProps } from '../types/BaseEventCalendarModel.types'

export function useBaseEventCalendar(props: EventCalendarProps, emit: BaseEventCalendarEmits) {
	const context = useEventCalendarContext(props, emit)
	return {
		...useStandardBaseComponent('base-event-calendar', props, ['root', 'toolbar', 'event']),
		...useEventCalendarToolbar(context),
		...useEventCalendarMonth(context),
		...useEventCalendarTimeGrid(context),
		...useEventCalendarEvents(context),
		currentView: context.view,
		agenda: computed(() => groupByDay(context.items.value, context.period.value)),
		formatFullDate,
		text: UI_EVENT_CALENDAR,
	}
}
