import { findPanel, dayName } from '../../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../BaseDatePicker.stories'
import BaseDatePicker from '../../../../ui/BaseDatePicker.vue'
import { within, expect, screen, waitFor } from 'storybook/test'
import { docsFrame, storyDate, storySource, useStorySetup } from '@/stories/helpers'

const state = { start: storyDate(0, 0, 0), end: null }

const types = { start: 'Date | null', end: 'Date | null' }

const template = `
	<div class="story-medium">
		<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />
	</div>
`

export const RangeLimits: StoryObj<typeof meta> = {
	name: 'Длина диапазона',
	args: {
		label: 'Срок аренды',
		selectionMode: 'range',
		presets: true,
		minDays: 3,
		maxDays: 7,
		isMultiMonth: false,
	},
	parameters: {
		controls: { include: ['minDays', 'maxDays', 'presets', 'isMultiMonth', 'sizeScale', 'isDisabled'] },
		docs: {
			...docsFrame(560),
			description: {
				story: [
					'`minDays` и `maxDays` ограничивают длину диапазона в днях, оба конца включительно (один день — длина 1).',
					'Когда выбрано только начало, панель отключает дни, которые дали бы слишком короткий или слишком длинный период —',
					'по обе стороны от начала. Готовые периоды и введённый вручную текст за пределами длины отклоняются.',
					'Если `maxDays` меньше `minDays`, он приравнивается к `minDays`.',
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
		const field = canvas.getByLabelText('Срок аренды')
		await expect(field).toHaveValue('15.05.2025 — ...')
		await userEvent.click(field)
		const panel = within(await findPanel())

		for (const offset of [-1, 0, 1]) await expect(panel.getByRole('button', { name: dayName(offset) })).toBeDisabled()
		for (const offset of [-6, -2, 2, 6]) await expect(panel.getByRole('button', { name: dayName(offset) })).toBeEnabled()
		for (const offset of [-7, 7]) await expect(panel.getByRole('button', { name: dayName(offset) })).toBeDisabled()

		const presets = within(panel.getByRole('group', { name: 'Готовые периоды' }))
		await expect(presets.getByRole('button', { name: '7 дней' })).toBeEnabled()
		await expect(presets.getByRole('button', { name: 'Вчера' })).toBeDisabled()
		await expect(presets.getByRole('button', { name: '30 дней' })).toBeDisabled()

		await userEvent.click(panel.getByRole('button', { name: dayName(2) }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveValue('15.05.2025 — 17.05.2025')
	},
}
