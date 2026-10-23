import { expect } from 'storybook/test'
import type meta from '../BaseList.stories'
import BaseList from '../../ui/BaseList.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `<BaseList v-bind="args" v-model="value" />`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: v-model связан с Controls — выбранная строка появляется в панели.' },
			source: storySource({ template, imports: ['BaseList'], models }),
		},
	},
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const first = canvas.getByRole('option', { name: /Входящие/ })
		await userEvent.tab()
		await expect(first).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(first).toHaveAttribute('aria-selected', 'true')
	},
}
