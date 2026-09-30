import type meta from '../BaseWaveform.stories'
import { expect, waitFor } from 'storybook/test'
import BaseWaveform from '../../ui/BaseWaveform.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { currentTime: 'currentTime', selection: 'selection' }

const template = `
	<BaseWaveform v-bind="args" v-model:current-time="currentTime" v-model:selection="selection" />
`

export const Selection: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Выделение фрагмента (`isSelectable`, `v-model:selection`): перетаскивание по волне или стрелки с Shift.',
					'Escape снимает выделение, щелчок без перетаскивания перематывает и тоже снимает его.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseWaveform'], models }),
		},
	},
	args: { isSelectable: true, currentTime: 12, selection: { start: 12, end: 30 } },
	render: args => ({
		components: { BaseWaveform },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const waveform = canvas.getByRole('slider', { name: 'Перемотка' })
		await expect(waveform).toHaveAccessibleDescription('Фрагмент 0:12–0:30')
		await tabTo(waveform, userEvent)
		await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}')
		await waitFor(() => expect(waveform).toHaveAccessibleDescription('Фрагмент 0:17–0:30'))
	},
}
