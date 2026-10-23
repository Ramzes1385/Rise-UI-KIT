import { expect } from 'storybook/test'
import BaseKbd from '../../../ui/BaseKbd.vue'
import type meta from '../../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<p style="margin: 0;">Нажмите <BaseKbd v-bind="args" value="meta" platform="other" /> + <BaseKbd v-bind="args" value="K" />, чтобы открыть поиск</p>
`

export const Shortcut: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Сочетание в тексте: «Нажмите Ctrl + K, чтобы открыть поиск».' },
			source: storySource({ template, imports: ['BaseKbd'], omit: ['value', 'platform'] }),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseKbd },
		setup: useStorySetup(args, { slots: ['value', 'platform'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelectorAll('kbd')).toHaveLength(2)
		await expect(canvasElement.querySelector('p')).toHaveTextContent('Нажмите Ctrl + K, чтобы открыть поиск')
	},
}
