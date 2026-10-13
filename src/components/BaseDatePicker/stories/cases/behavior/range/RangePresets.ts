import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../BaseDatePicker.stories'
import BaseDatePicker from '../../../../ui/BaseDatePicker.vue'
import { within, expect, screen, waitFor } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { docsFrame, findPanel, todayName, todayRange } from '../../../shared'

const state = { start: null, end: null }

const types = { start: 'Date | null', end: 'Date | null' }

const template = `
	<div class="story-medium">
		<BaseDatePicker v-bind="args" v-model="start" v-model:model-value-end="end" />
	</div>
`

export const RangePresets: StoryObj<typeof meta> = {
	name: 'Готовые периоды',
	args: {
		label: 'Период отчёта',
		selectionMode: 'range',
		presets: true,
		isClearable: true,
	},
	parameters: {
		controls: { include: ['presets', 'minDays', 'maxDays', 'monthsShown', 'isMultiMonth', 'sizeScale', 'isDisabled'] },
		docs: {
			...docsFrame(500),
			description: {
				story: [
					'`presets` добавляет в панель диапазона колонку готовых периодов: «Сегодня», «Вчера», «7 дней», «30 дней», «Этот месяц»,',
					'«Прошлый месяц». Клик ставит оба конца, шлёт `preset-select` и `range-select` и закрывает панель; активный период',
					'(совпадает с выбранным диапазоном) подсвечен и отмечен `aria-pressed`. Кнопки идут группой в порядке Tab,',
					'период, нарушающий `minDate`, `maxDate`, `minDays` или `maxDays`, отключён. Свой список: `:presets="[\'today\', { id, label, range }]"` —',
					'встроенный период строкой, свой — объектом с `range` или `getRange(today)`. На узком экране колонка уходит над календарём.',
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
		const field = canvas.getByLabelText('Период отчёта')
		await userEvent.click(field)
		const panel = within(await findPanel())
		const group = within(panel.getByRole('group', { name: 'Готовые периоды' }))
		await expect(group.getAllByRole('button').map(button => button.textContent?.trim())).toEqual([
			'Сегодня',
			'Вчера',
			'7 дней',
			'30 дней',
			'Этот месяц',
			'Прошлый месяц',
		])

		await userEvent.click(group.getByRole('button', { name: '7 дней' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveValue(todayRange(-6, 0))

		await tabTo(field, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		const reopened = within(await findPanel())
		await waitFor(() => expect(reopened.getByRole('button', { name: todayName(-6) })).toHaveFocus())
		const presets = within(reopened.getByRole('group', { name: 'Готовые периоды' }))
		await expect(presets.getByRole('button', { name: '7 дней' })).toHaveAttribute('aria-pressed', 'true')
		await expect(presets.getByRole('button', { name: 'Вчера' })).toHaveAttribute('aria-pressed', 'false')

		presets.getByRole('button', { name: 'Вчера' }).focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveValue(todayRange(-1, -1))
		await expect(field).toHaveFocus()
	},
}
