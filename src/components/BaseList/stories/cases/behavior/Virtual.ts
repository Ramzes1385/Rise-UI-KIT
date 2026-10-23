import { setup } from './Virtual.setup'
import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import setupSource from './Virtual.setup.ts?raw'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-narrow"><BaseList v-bind="args" :items="rows" is-virtual :height="320" /></div>`

export const Virtual: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'1 000 строк с `is-virtual`: в DOM только видимые строки и запас `overscan`, высота области — `height`.',
					'У строк `aria-setsize` и `aria-posinset` — скринридер слышит «строка 1000 из 1000»; строка с фокусом не выгружается.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseList'], script: scriptSource(setupSource) }),
		},
		controls: { exclude: ['items'] },
	},
	args: { label: 'Журнал' },
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('option').length).toBeLessThan(100)
		await userEvent.tab()
		await userEvent.keyboard('{End}')
		const last = await waitFor(() => canvas.getByRole('option', { name: 'Строка 1000' }))
		await waitFor(() => expect(last).toHaveFocus())
		await expect(last).toHaveAttribute('aria-posinset', '1000')
		await expect(last).toHaveAttribute('aria-setsize', '1000')
	},
}
