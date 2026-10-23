import { LONG_SAMPLE } from '../../shared'
import type meta from '../../BaseCode.stories'
import BaseCode from '../../../ui/BaseCode.vue'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-medium"><BaseCode v-bind="args" /></div>`

export const Wrapped: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`is-wrapped` — длинные строки переносятся, горизонтальной прокрутки нет; номер строки стоит у её первой части.',
			},
			source: storySource({ template, imports: ['BaseCode'] }),
		},
	},
	args: { code: LONG_SAMPLE, language: 'js', isWrapped: true },
	render: args => ({
		components: { BaseCode },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const pre = canvasElement.querySelector('.base-code__pre') as HTMLElement
		await waitFor(() => expect(pre.scrollWidth).toBeLessThanOrEqual(pre.clientWidth))
		await expect(canvas.queryByRole('region')).toBeNull()
	},
}
