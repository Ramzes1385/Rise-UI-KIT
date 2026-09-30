import { RECENT_SAMPLE } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseEmojiPicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseEmojiPicker from '../../ui/BaseEmojiPicker.vue'
import { STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const state = { recent: RECENT_SAMPLE }

const template = `
	<div style="display: grid; gap: 12px; justify-items: start">
		<BaseEmojiPicker v-bind="args" v-model:recent="recent" />
		<p style="margin: 0">Недавние эмодзи: {{ recent.join(' ') }}</p>
	</div>
`

export const WithRecent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Недавние через `v-model:recent`: выбранный эмодзи встаёт первым. Пока пикер открыт, ряд не перестраивается под курсором.',
			},
			source: storySource({ template, imports: ['BaseEmojiPicker'], state, types: { recent: 'string[]' } }),
		},
	},
	render: args => ({
		components: { BaseEmojiPicker },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const recent = await canvas.findByRole('group', { name: 'Недавние' }, { timeout: STORY_WAIT_TIMEOUT })
		await waitFor(() => expect(recent.querySelectorAll('button')).toHaveLength(6), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.click(recent.querySelectorAll('button')[3])
		await expect(canvas.getByText(/^Недавние эмодзи:/)).toHaveTextContent(/^Недавние эмодзи: 😂 👍️? 🎉 ❤️ 🔥 👀$/u)
	},
}
