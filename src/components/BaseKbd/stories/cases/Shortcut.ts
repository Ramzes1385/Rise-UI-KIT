import { expect } from 'storybook/test'
import BaseKbd from '../../ui/BaseKbd.vue'
import type meta from '../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Shortcut: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Сочетание в тексте: «Нажмите Ctrl + K, чтобы открыть поиск».' } },
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseKbd },
		setup: () => ({ props: useArgsWithoutSlots(args, ['value', 'platform']) }),
		template:
			'<p style="margin: 0;">Нажмите <BaseKbd v-bind="props" value="meta" platform="other" /> + <BaseKbd v-bind="props" value="K" />, чтобы открыть поиск</p>',
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelectorAll('kbd')).toHaveLength(2)
		await expect(canvasElement.querySelector('p')).toHaveTextContent('Нажмите Ctrl + K, чтобы открыть поиск')
	},
}
