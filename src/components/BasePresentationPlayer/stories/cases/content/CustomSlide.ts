import { textSlides } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import { PRESENTATION_IMPORTS } from '../../render'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import BasePresentationPlayer from '../../../ui/BasePresentationPlayer.vue'

const template = `
	<BasePresentationPlayer v-bind="args" v-model:slide="current">
		<template #slide="{ slide, index }">
			<div class="story-stack" style="box-sizing: border-box; height: 100%; padding: 96px 64px 48px">
				<h2>{{ slide.title }}</h2>
				<p>Слайд {{ index + 1 }}: свой HTML вместо картинки — заголовки, списки, ссылки и кнопки.</p>
			</div>
		</template>
	</BasePresentationPlayer>
`

export const CustomSlide: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `slide` (`{ slide, index }`) — свой HTML вместо картинки или видео: текстовый слайд, схема, ссылки.',
					'Слайды без озвучки идут по `duration` (здесь 5 с). Клик по интерактивным элементам слота не ставит показ на паузу.',
					'Проверка: Tab до шкалы, → — следующий слайд со своим заголовком.',
				].join('\n'),
			},
			source: storySource({ template, imports: [], importsFrom: PRESENTATION_IMPORTS, models: { current: 'slide' } }),
		},
	},
	args: {
		title: 'Правила работы с документами',
		slides: textSlides(5),
	},
	render: args => ({
		components: { BasePresentationPlayer },
		setup: useStorySetup(args, { models: { current: 'slide' } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('heading', { name: 'Кто мы' })).toBeInTheDocument()
		await tabTo(canvas.getByRole('slider', { name: 'Слайды' }), userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Наши ценности' })).toBeInTheDocument())
	},
}
