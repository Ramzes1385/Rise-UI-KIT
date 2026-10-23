import { LONG_SAMPLE } from '../../shared'
import type meta from '../../BaseCode.stories'
import BaseCode from '../../../ui/BaseCode.vue'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-medium"><BaseCode v-bind="args" /></div>`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Длинные строки не переносятся: область прокручивается и, пока есть что прокручивать, получает фокус с клавиатуры',
					'(Tab, затем стрелки) — роль `region` и имя «Код, JavaScript». Ширина не больше контейнера (здесь 560 px).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCode'] }),
		},
	},
	args: { code: LONG_SAMPLE, language: 'js' },
	render: args => ({
		components: { BaseCode },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const region = await waitFor(() => canvas.getByRole('region', { name: 'Код, JavaScript' }))
		await expect(region.scrollWidth).toBeGreaterThan(region.clientWidth)
		await tabTo(region, userEvent)
		await expect(region).toHaveFocus()
		await userEvent.tab()
		await expect(region).not.toHaveFocus()
	},
}
