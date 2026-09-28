import { expect } from 'storybook/test'
import BaseKbd from '../../ui/BaseKbd.vue'
import type meta from '../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const SpecialKeys: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Служебные клавиши: символ на экране, название для скринридера. На macOS `meta` — ⌘, `alt` — ⌥; на других',
					'системах — Ctrl и Alt.',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseKbd },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['value', 'platform']),
			keys: [
				'meta',
				'ctrl',
				'alt',
				'shift',
				'enter',
				'backspace',
				'delete',
				'escape',
				'tab',
				'space',
				'arrowup',
				'arrowdown',
				'arrowleft',
				'arrowright',
			],
		}),
		template: `
			<div class="story-stack">
				<div class="story-row"><span class="story-label">macOS</span><BaseKbd v-for="key in keys" :key="key" v-bind="props" :value="key" platform="mac" /></div>
				<div class="story-row"><span class="story-label">Windows, Linux</span><BaseKbd v-for="key in keys" :key="key" v-bind="props" :value="key" platform="other" /></div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [macMeta] = canvasElement.querySelectorAll('kbd')
		await expect(macMeta).toHaveTextContent('⌘Command')
	},
}
