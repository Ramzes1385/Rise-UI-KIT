import type meta from '../BaseWaveform.stories'
import { expect, waitFor } from 'storybook/test'
import BaseWaveform from '../../ui/BaseWaveform.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { tabTo, useModelArg } from '@/stories/helpers'

export const Selection: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Выделение фрагмента (`isSelectable`, `v-model:selection`): перетаскивание по волне или стрелки с Shift.',
					'Escape снимает выделение, щелчок без перетаскивания перематывает и тоже снимает его.',
				].join('\n'),
			},
		},
	},
	args: { isSelectable: true, currentTime: 12, selection: { start: 12, end: 30 } },
	render: args => {
		const onTime = useModelArg('currentTime')
		const onSelection = useModelArg('selection')
		return {
			components: { BaseWaveform },
			setup: () => ({ args, onTime, onSelection }),
			template: '<BaseWaveform v-bind="args" @update:current-time="onTime" @update:selection="onSelection" />',
		}
	},
	play: async ({ canvas, userEvent }) => {
		const waveform = canvas.getByRole('slider', { name: 'Перемотка' })
		await expect(waveform).toHaveAccessibleDescription('Фрагмент 0:12–0:30')
		await tabTo(waveform, userEvent)
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
		await waitFor(() => expect(waveform).toHaveAccessibleDescription('Фрагмент 0:17–0:30'))
	},
}
