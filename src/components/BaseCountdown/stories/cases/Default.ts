import { expect } from 'storybook/test'
import { TO, TO_SCRIPT } from '../shared'
import type meta from '../BaseCountdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../ui/BaseCountdown.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<BaseCountdown v-bind="args" :to="to" />`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'До конца распродажи 2 дня 5 часов 42 минуты: секунды идут, скринридер слышит время с точностью до минуты.',
			},
			source: storySource({ template, imports: ['BaseCountdown'], script: TO_SCRIPT, omit: ['to'] }),
		},
	},
	render: args => ({
		components: { BaseCountdown },
		setup: useStorySetup(args, { data: { to: TO }, slots: ['to'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const timer = canvas.getByRole('timer')
		await expect(timer).toHaveAttribute('aria-live', 'off')
		await expect(timer).toHaveTextContent(/^До конца распродажи: \d дня? \d+ час/)
		await expect(canvasElement.querySelectorAll('.base-countdown__unit')).toHaveLength(4)
		await expect(canvasElement.querySelectorAll('.base-countdown__value')[3].textContent).toMatch(/^\d\d$/)
	},
}
