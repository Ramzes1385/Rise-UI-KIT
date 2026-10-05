import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { UiClassFn } from '@composables/base/useUi'
import type { BaseCalendarPart, BaseCalendarProps } from '../types/BaseCalendar.types'

const CALENDAR_UI_KEY: InjectionKey<UiClassFn<BaseCalendarPart>> = Symbol('base-calendar-ui')

export function provideCalendarUi(props: BaseCalendarProps): UiClassFn<BaseCalendarPart> {
	const ui = useUi(props, 'base-calendar')
	provide(CALENDAR_UI_KEY, ui)
	return ui
}

export function useCalendarUi(): UiClassFn<BaseCalendarPart> {
	return inject(CALENDAR_UI_KEY)!
}
