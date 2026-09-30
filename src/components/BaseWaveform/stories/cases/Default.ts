import type meta from '../BaseWaveform.stories'
import { expect, waitFor } from 'storybook/test'
import BaseWaveform from '../../ui/BaseWaveform.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { currentTime: 'currentTime' }

const template = `
	<BaseWaveform v-bind="args" v-model:current-time="currentTime" />
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: щелчок и перетаскивание перематывают, стрелки — на `step` секунд. Позиция связана с Controls.',
			},
			source: storySource({ template, imports: ['BaseWaveform'], models }),
		},
	},
	render: args => ({
		components: { BaseWaveform },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const waveform = canvas.getByRole('slider', { name: 'Перемотка' })
		await tabTo(waveform, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(waveform).toHaveAttribute('aria-valuetext', '0:25 из 1:05'))
		await userEvent.keyboard('{Home}')
		await waitFor(() => expect(waveform).toHaveAttribute('aria-valuetext', '0:00 из 1:05'))
	},
}
