import { models } from '../../render'
import { getDay } from '../../shared'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseEventCalendar from '../../../ui/BaseEventCalendar.vue'

const template = `
	<BaseEventCalendar v-bind="args" v-model:view="view" v-model:date="date">
		<template #day-2026-10-22="{ date }">🎂 {{ date.getDate() }}</template>
		<template #event-release="{ event, time }">
			<strong>{{ event.title }}</strong> <small>{{ time }}</small>
		</template>
		<template #category-meeting="{ event }">👥 {{ event.title }}</template>
		<template #header-day="{ label, isToday }">
			<strong v-if="isToday">{{ label }}</strong>
			<template v-else>{{ label }}</template>
		</template>
		<template #time-slot="{ time }">{{ time.getHours() }} ч</template>
		<template #all-day>Целый день</template>
	</BaseEventCalendar>
`

export const DynamicSlots: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Динамические слоты: `day-<ГГГГ-ММ-ДД>` — число одного дня, `event-<id>` — одно событие, `category-<категория>` —',
					'события категории (приоритет: id, категория, `event`); в неделе и дне — `header-day`, `time-slot` и `all-day`.',
					'Событие остаётся кнопкой со своим доступным именем: в слоте не нужны свои кнопки и ссылки.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEventCalendar'], models }),
		},
	},
	render: args => ({
		components: { BaseEventCalendar },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(getDay(canvasElement, '2026-10-22')).toHaveTextContent('🎂 22')
		await expect(canvas.getByRole('button', { name: 'Встреча с командой, 2 октября, 10:00–11:00' })).toHaveTextContent(
			'👥 Встреча с командой',
		)
		await userEvent.click(canvas.getByText('Неделя'))
		await expect(canvas.getByText('Целый день')).toBeVisible()
		await expect(canvas.getByText('10 ч')).toBeVisible()
		const friday = canvas.getByRole('group', { name: /2 окт/ })
		await expect(within(friday).getByRole('button', { name: /^Встреча с командой/ })).toHaveTextContent('👥 Встреча с командой')
	},
}
