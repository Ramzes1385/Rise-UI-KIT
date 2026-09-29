import { expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../../BaseCalendar.stories'
import { renderWithLocalModel } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomDay: StoryObj<typeof meta> = {
	args: {
		modelValue: storyDate(0, 0, 0),
		constraints: { minDate: storyDate(-5, 0, 0) },
		displayConfig: { showTodayButton: false },
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `day` заменяет содержимое ячейки — например, цена ночи под числом. Ячейка растягивается по содержимому,',
					'состояния (выбор, наведение, фокус) рисует календарь; в слот приходят `date`, `isSelected`, `isDisabled` и другие флаги.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseCalendar v-model="date">',
					'  <template #day="{ date, isDisabled }">',
					'    {{ date.getDate() }}',
					'    <small v-if="!isDisabled">{{ price(date) }}</small>',
					'  </template>',
					'</BaseCalendar>',
				].join('\n'),
			},
		},
	},
	render: renderWithLocalModel(`
		<BaseCalendar v-bind="props" v-model="value">
			<template #day="{ date, isDisabled }">
				{{ date.getDate() }}
				<small v-if="!isDisabled" style="font-size: 10px; line-height: 12px;">{{ nightPrice(date) }}</small>
			</template>
		</BaseCalendar>
	`),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /^15\s*3 100$/ })).toHaveAttribute('aria-pressed', 'true')
	},
}
