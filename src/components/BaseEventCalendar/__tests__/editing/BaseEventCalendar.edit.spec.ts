import { ref } from 'vue'
import { slotLocator } from '../../model/edit/eventCalendarEditDom'
import type { EventCalendarContext } from '../../types/BaseEventCalendarModel.types'

describe('BaseEventCalendar — поиск дня под указателем', () => {
	it.each(['month', 'time'] as const)('%s: без корня календаря — ничего', kind => {
		const context = { rootRef: ref(null), step: ref(30) } as unknown as EventCalendarContext
		expect(slotLocator(context, kind)({ x: 10, y: 10 })).toBeNull()
	})
})
