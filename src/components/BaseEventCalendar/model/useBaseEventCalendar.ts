import { computed } from 'vue'
import { useUi } from '@composables/base/useUi'
import { formatFullDate } from './eventCalendarFormat'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { groupByDay } from '@utils/calendar/eventUtils'
import { useEventCalendarMonth } from './useEventCalendarMonth'
import { useEventCalendarEvents } from './useEventCalendarEvents'
import { useEventCalendarEdit } from './edit/useEventCalendarEdit'
import { useEventCalendarContext } from './useEventCalendarContext'
import { useEventCalendarToolbar } from './useEventCalendarToolbar'
import { useEventCalendarTimeGrid } from './useEventCalendarTimeGrid'
import { useEventCalendarSelect } from './edit/useEventCalendarSelect'
import { useEventCalendarMotion } from './view/useEventCalendarMotion'
import { useEventCalendarClasses } from './view/useEventCalendarClasses'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseEventCalendarEmits } from '../types/BaseEventCalendar.types'
import type { EventCalendarProps } from '../types/BaseEventCalendarModel.types'

export function useBaseEventCalendar(props: EventCalendarProps, emit: BaseEventCalendarEmits) {
	const context = useEventCalendarContext(props, emit)
	const month = useEventCalendarMonth(context)
	const select = useEventCalendarSelect(context)
	const events = useEventCalendarEvents(context)
	const base = useStandardBaseComponent('base-event-calendar', props, ['root', 'toolbar', 'event'])
	const ui = useUi(props, 'base-event-calendar')
	const timeGrid = useEventCalendarTimeGrid(context)
	const edit = useEventCalendarEdit(context, events.handleEventClick)
	return {
		...base,
		ui,
		...useEventCalendarMotion(context),
		...useEventCalendarClasses({
			ui,
			classes: base.classes,
			editClass: edit.editClass,
			isDaySelected: select.isDaySelected,
			isCompact: timeGrid.isCompact,
		}),
		...useEventCalendarToolbar(context),
		...month,
		...select,
		handleGridKeydown: (event: KeyboardEvent): void => select.handleMonthKeydown(event, month.handleGridKeydown),
		rootRef: context.rootRef,
		...timeGrid,
		...events,
		...edit,
		currentView: context.view,
		agenda: computed(() => groupByDay(context.items.value, context.period.value)),
		formatFullDate,
		text: UI_EVENT_CALENDAR,
	}
}
