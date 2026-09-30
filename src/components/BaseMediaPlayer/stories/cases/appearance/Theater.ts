import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import BaseMediaPlayer from '../../../ui/BaseMediaPlayer.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isTheater: false }

const template = `
	<div class="story-theater" :style="{ maxWidth: isTheater ? '100%' : '480px' }">
		<BaseMediaPlayer v-bind="args" v-model:is-theater="isTheater" />
	</div>
`

export const Theater: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Широкий экран: `v-model:is-theater` меняет раскладку страницы — здесь ширину блока с плеером. Клавиша T.',
			},
			source: storySource({ template, imports: [], importsFrom: { '@ramzes1385/rise-ui-kit/media': ['BaseMediaPlayer'] }, state }),
		},
	},
	render: args => ({
		components: { BaseMediaPlayer },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Широкий экран' }))
		await expect((canvasElement.querySelector('.story-theater') as HTMLElement).style.maxWidth).toBe('100%')
		await userEvent.click(canvas.getByRole('button', { name: 'Обычный режим' }))
	},
}
