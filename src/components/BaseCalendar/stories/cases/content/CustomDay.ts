import { expect } from 'storybook/test'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCalendar from '../../../ui/BaseCalendar.vue'
import { storyDate, storySource, useStorySetup } from '@/stories/helpers'

function nightPrice(date: Date): string {
	const day = date.getDay()
	return day === 0 || day === 6 ? '4 200' : '3 100'
}

const models = { selected: 'modelValue' }

const template = `
	<BaseCalendar v-bind="args" v-model="selected">
		<template #day="{ date, isDisabled }">
			{{ date.getDate() }}
			<small v-if="!isDisabled" style="font-size: 10px; line-height: 12px;">{{ nightPrice(date) }}</small>
		</template>
	</BaseCalendar>
`

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
			source: storySource({
				template,
				imports: ['BaseCalendar'],
				models,
				script: `
					function nightPrice(date: Date): string {
						const day = date.getDay()
						return day === 0 || day === 6 ? '4 200' : '3 100'
					}
				`,
			}),
		},
	},
	render: args => ({
		components: { BaseCalendar },
		setup: useStorySetup(args, { models, slots: [], setup: () => ({ nightPrice }) }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /^15\s*3 100$/ })).toHaveAttribute('aria-pressed', 'true')
	},
}
