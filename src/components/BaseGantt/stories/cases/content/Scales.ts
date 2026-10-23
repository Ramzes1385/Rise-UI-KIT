import { SCALE_OPTIONS } from '../../shared'
import type meta from '../../BaseGantt.stories'
import { expect, waitFor } from 'storybook/test'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseSegmented } from '@components/BaseSegmented'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const state = { scale: 'week' }

const template = `
	<div class="story-stack">
		<BaseSegmented v-model="scale" :options="options" aria-label="Шкала времени" />
		<BaseGantt v-bind="args" :scale="scale" />
	</div>
`

const script = `const options = ${literal(SCALE_OPTIONS)}`

export const Scales: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'columnWidth', 'isTodayVisible'] },
		docs: {
			description: {
				story: [
					'Три шкалы: `day` — столбец на день, `week` — на неделю (начало недели — из языка кита), `month` — на календарный месяц.',
					'Полосы всегда стоят на своих днях: ширина столбца делится на дни, а не округляется до столбца. Переключатель — BaseSegmented;',
					'ширина столбца — `columnWidth`. Стрелки клавиатурной правки делают шаг шкалы: день, неделя, месяц.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseGantt', 'BaseSegmented', 'type GanttScale'],
				script,
				state,
				types: { scale: 'GanttScale' },
				omit: ['scale'],
			}),
		},
	},
	render: args => ({
		components: { BaseGantt, BaseSegmented },
		setup: useStorySetup(args, { state, data: { options: SCALE_OPTIONS }, slots: ['scale'] }),
		template,
	}),
	play: async ({ canvas, userEvent, canvasElement }) => {
		const cells = (): number => canvasElement.querySelectorAll('.base-gantt__scale-cell--bottom').length
		const weeks = cells()
		await userEvent.click(canvas.getByText('Дни'))
		await waitFor(() => expect(cells()).toBeGreaterThan(weeks * 3))
		await userEvent.click(canvas.getByText('Месяцы'))
		await waitFor(() => expect(cells()).toBeLessThan(weeks))
		await expect(canvas.getByRole('radio', { name: 'Месяцы' })).toBeChecked()
	},
}
