import type { StoryObj } from '@storybook/vue3-vite'
import { expect, fn, waitFor } from 'storybook/test'
import type meta from '../../../BaseDatePicker.stories'
import BaseDatePicker from '../../../../ui/BaseDatePicker.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { start: null, end: null }

const types = { start: 'Date | null', end: 'Date | null' }

const template = `
	<div class="story-medium">
		<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />
	</div>
`

export const RangeKeyboardInput: StoryObj<typeof meta> = {
	name: 'Ввод периода с клавиатуры',
	args: {
		label: 'Период поездки',
		selectionMode: 'range',
		isReadonly: false,
		minDays: 2,
		maxDays: 14,
		'onInput-invalid': fn(),
	},
	parameters: {
		controls: { include: ['isReadonly', 'minDays', 'maxDays', 'dateFormat', 'showTime', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'`isReadonly="false"` в режиме `range` разрешает вводить период в поле: «дд.мм.гггг — дд.мм.гггг» (порядок частей и разделители',
					'берутся из языка поля, между датами — тире любой длины). Enter или уход из поля применяют ввод, Escape отменяет. Поздняя дата',
					'раньше ранней меняется местами, одна дата или «дата — ...» задают только начало, пустое поле очищает диапазон.',
					'Нечитаемый текст, недоступные даты (`minDate`, `maxDate`…) и период короче `minDays` или длиннее `maxDays` не принимаются:',
					'текст остаётся в поле с ошибкой и событием `input-invalid` (`format`, `unavailable`, `min-days`, `max-days`).',
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
	play: async ({ args, canvas, userEvent }) => {
		const field = canvas.getByLabelText('Период поездки')
		await tabTo(field, userEvent)
		await userEvent.keyboard('01.05.2025 — 07.05.2025{Enter}')
		await expect(field).toHaveValue('01.05.2025 — 07.05.2025')
		await expect(field).not.toHaveAttribute('aria-invalid', 'true')

		await userEvent.clear(field)
		await userEvent.keyboard('99.99.2025{Enter}')
		const error = await canvas.findByText('Не удалось разобрать период. Пример: 25.11.2000 — 03.12.2000')
		await waitFor(() => expect(error).toBeVisible())
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(args['onInput-invalid']).toHaveBeenLastCalledWith('format', '99.99.2025')

		await userEvent.clear(field)
		await userEvent.keyboard('01.05.2025 — 30.05.2025{Enter}')
		const lengthError = await canvas.findByText('Период длиннее допустимого: максимум 14 дней')
		await waitFor(() => expect(lengthError).toBeVisible())
		await expect(args['onInput-invalid']).toHaveBeenLastCalledWith('max-days', '01.05.2025 — 30.05.2025')

		await userEvent.keyboard('{Escape}')
		await expect(field).toHaveValue('01.05.2025 — 07.05.2025')
		await expect(field).not.toHaveAttribute('aria-invalid', 'true')

		await userEvent.clear(field)
		await userEvent.keyboard('{Tab}')
		await expect(field).toHaveValue('')
	},
}
