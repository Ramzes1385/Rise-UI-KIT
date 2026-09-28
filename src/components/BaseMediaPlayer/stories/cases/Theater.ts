import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'

export const Theater: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Широкий экран: `v-model:is-theater` меняет раскладку страницы — здесь ширину блока с плеером. Клавиша T.',
			},
			source: {
				code: [
					"<div :style=\"{ maxWidth: isTheater ? '100%' : '480px' }\">",
					'\t<BaseMediaPlayer v-model:is-theater="isTheater" :sources="sources" title="Демо-ролик" />',
					'</div>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseMediaPlayer },
		setup: () => ({ props: useArgsWithoutSlots(args), isTheater: ref(false) }),
		template: `
			<div class="story-theater" :style="{ maxWidth: isTheater ? '100%' : '480px' }">
				<BaseMediaPlayer v-bind="props" v-model:is-theater="isTheater" />
			</div>`,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Широкий экран' }))
		await expect((canvasElement.querySelector('.story-theater') as HTMLElement).style.maxWidth).toBe('100%')
		await userEvent.click(canvas.getByRole('button', { name: 'Обычный режим' }))
	},
}
