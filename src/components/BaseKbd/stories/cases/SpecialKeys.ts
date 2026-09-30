import { expect } from 'storybook/test'
import BaseKbd from '../../ui/BaseKbd.vue'
import type meta from '../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const keys = [
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
]

const template = `
	<div class="story-stack">
		<div class="story-row"><span class="story-label">macOS</span><BaseKbd v-for="key in keys" :key="key" v-bind="args" :value="key" platform="mac" /></div>
		<div class="story-row"><span class="story-label">Windows, Linux</span><BaseKbd v-for="key in keys" :key="key" v-bind="args" :value="key" platform="other" /></div>
	</div>
`

export const SpecialKeys: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Служебные клавиши: символ на экране, название для скринридера. На macOS `meta` — ⌘, `alt` — ⌥; на других',
					'системах — Ctrl и Alt.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseKbd'], script: `const keys = ${literal(keys)}`, omit: ['value', 'platform'] }),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseKbd },
		setup: useStorySetup(args, { data: { keys }, slots: ['value', 'platform'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [macMeta] = canvasElement.querySelectorAll('kbd')
		await expect(macMeta).toHaveTextContent('⌘Command')
	},
}
