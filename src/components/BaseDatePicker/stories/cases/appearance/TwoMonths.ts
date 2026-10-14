import { findPanel, dayName } from '../../shared'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDatePicker from '../../../ui/BaseDatePicker.vue'
import { within, expect, screen, waitFor } from 'storybook/test'
import { storyDate, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const state = { start: storyDate(0, 0, 0), end: null }

const types = { start: 'Date | null', end: 'Date | null' }

const template = `
	<div class="story-narrow">
		<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />
	</div>
`

export const TwoMonths: StoryObj<typeof meta> = {
	name: 'Два месяца рядом',
	args: {
		label: 'Период',
		selectionMode: 'range',
		monthsShown: 2,
	},
	parameters: {
		controls: { include: ['monthsShown', 'showWeekNumber', 'presets', 'sizeScale', 'isDisabled'] },
		docs: {
			...docsFrame(460),
			description: {
				story: [
					'`monthsShown` задаёт число месяцев в панели: `2` — два месяца рядом, как в календарях бронирования. Без него число месяцев',
					'считается по ширине поля (`isMultiMonth`, `maxMonths`); с ним панель не растягивается до поля и не зависит от его ширины:',
					'здесь поле 360px, а месяцев два. Диапазон можно начать в одном месяце и закончить в другом.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDatePicker'], state, types }),
		},
	},
	render: args => ({
		components: { BaseDatePicker },
		setup: useStorySetup(args, { state, slots: [] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Период')
		await userEvent.click(field)
		const panel = await findPanel()
		const [may, june] = Array.from(panel.querySelectorAll<HTMLElement>('.base-calendar'))
		await expect(panel.querySelectorAll('.base-calendar')).toHaveLength(2)
		await expect(within(may).getByRole('button', { name: dayName(0) })).toHaveAttribute('aria-pressed', 'true')

		await userEvent.click(within(june).getByRole('button', { name: dayName(19) }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveValue('15.05.2025 — 03.06.2025')
	},
}
