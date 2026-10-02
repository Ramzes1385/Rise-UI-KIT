import { expect } from 'storybook/test'
import BaseTag from '../../ui/BaseTag.vue'
import type meta from '../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { isSelected: 'isSelected' }

const template = `<BaseTag v-bind="args" v-model:is-selected="isSelected" />`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: меняйте props в панели Controls. Выбираемая метка — кнопка-переключатель: Tab, затем Enter или Space меняют `isSelected`.',
			},
			source: storySource({ template, imports: ['BaseTag'], models }),
		},
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { models, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const tag = canvas.getByRole('button', { name: 'Vue' })
		await tabTo(tag, userEvent)
		await expect(getComputedStyle(tag).outlineStyle).toBe('solid')
		await userEvent.keyboard(' ')
		await expect(tag).toHaveAttribute('aria-pressed', 'true')
		await userEvent.keyboard('{Enter}')
		await expect(tag).toHaveAttribute('aria-pressed', 'false')
	},
}
