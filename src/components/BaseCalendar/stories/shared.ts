import { ref } from 'vue'
import type { within } from 'storybook/test'
import type meta from './BaseCalendar.stories'
import BaseCalendar from '../ui/BaseCalendar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storyDate, useArgsWithoutSlots } from '@/stories/helpers'

type Canvas = ReturnType<typeof within>

const DAY_NAME = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function getDay(canvas: Canvas, days: number): HTMLElement {
	const name = DAY_NAME.format(storyDate(days))
	return canvas.getByRole('button', { name: (accessibleName: string) => accessibleName.startsWith(name) })
}

function nightPrice(date: Date): string {
	const day = date.getDay()
	return day === 0 || day === 6 ? '4 200' : '3 100'
}

export function renderWithLocalModel(
	template = '<BaseCalendar v-bind="props" v-model="value" v-model:model-value-end="valueEnd" v-model:selected-dates="dates" />',
): NonNullable<StoryObj<typeof meta>['render']> {
	return args => ({
		components: { BaseCalendar },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'modelValueEnd', 'selectedDates']),
			value: ref<Date | null>(args.modelValue ?? null),
			valueEnd: ref<Date | null>(args.modelValueEnd ?? null),
			dates: ref<Date[]>(args.selectedDates ?? []),
			nightPrice,
		}),
		template,
	})
}
