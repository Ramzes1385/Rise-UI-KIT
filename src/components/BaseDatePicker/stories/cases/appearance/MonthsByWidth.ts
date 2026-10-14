import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { findPanel, monthsForWidth } from '../../shared'
import { expect, screen, waitFor } from 'storybook/test'
import BaseDatePicker from '../../../ui/BaseDatePicker.vue'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'

const state = { deadline: null, trip: null, report: null }

const template = `
	<div class="story-stack">
		<div style="width: 360px; max-width: 100%">
			<BaseDatePicker v-bind="args" v-model="deadline" label="Срок задачи" />
		</div>
		<div style="width: 600px; max-width: 100%">
			<BaseDatePicker v-bind="args" v-model="trip" label="Дата поездки" />
		</div>
		<div style="width: 900px; max-width: 100%">
			<BaseDatePicker v-bind="args" v-model="report" label="Дата отчёта" />
		</div>
	</div>
`

export const MonthsByWidth: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['maxMonths', 'showWeekNumber', 'sizeScale', 'selectionMode'] },
		docs: {
			...docsFrame(620),
			description: {
				story: [
					'Панель открывается на всю ширину поля (`isMultiMonth`, по умолчанию включён). Если в неё помещается больше одного',
					'календаря, месяцев становится два, три и больше: поле 360px — один месяц, 600px — два, 900px — три.',
					'`maxMonths` ограничивает число месяцев, `:is-multi-month="false"` возвращает панель по ширине одного календаря.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDatePicker'],
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseDatePicker },
		setup: useStorySetup(args, { state, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		for (const label of ['Срок задачи', 'Дата поездки', 'Дата отчёта']) {
			const field = canvas.getByLabelText(label)
			const wrapper = field.closest('.base-date-picker') as HTMLElement
			await userEvent.click(field)
			const panel = await findPanel()
			await expect(Math.round(panel.getBoundingClientRect().width)).toBe(Math.round(wrapper.getBoundingClientRect().width))
			await expect(panel.querySelectorAll('.base-calendar')).toHaveLength(monthsForWidth(wrapper.clientWidth))
			await userEvent.keyboard('{Escape}')
			await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		}
		await userEvent.click(canvas.getByLabelText('Дата отчёта'))
		await findPanel()
	},
}
