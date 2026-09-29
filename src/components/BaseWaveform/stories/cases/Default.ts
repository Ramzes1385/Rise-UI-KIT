import type meta from '../BaseWaveform.stories'
import { expect, waitFor } from 'storybook/test'
import BaseWaveform from '../../ui/BaseWaveform.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { tabTo, useModelArg } from '@/stories/helpers'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: щелчок и перетаскивание перематывают, стрелки — на `step` секунд. Позиция связана с Controls.',
			},
		},
	},
	render: args => {
		const onTime = useModelArg('currentTime')
		return {
			components: { BaseWaveform },
			setup: () => ({ args, onTime }),
			template: '<BaseWaveform v-bind="args" @update:current-time="onTime" />',
		}
	},
	play: async ({ canvas, userEvent }) => {
		const waveform = canvas.getByRole('slider', { name: 'Перемотка' })
		await tabTo(waveform, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(waveform).toHaveAttribute('aria-valuetext', '0:25 из 1:05'))
		await userEvent.keyboard('{Home}')
		await waitFor(() => expect(waveform).toHaveAttribute('aria-valuetext', '0:00 из 1:05'))
	},
}
