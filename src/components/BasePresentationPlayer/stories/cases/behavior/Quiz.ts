import { expect, waitFor } from 'storybook/test'
import { PRESENTATION_IMPORTS } from '../../render'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'
import BasePresentationPlayer from '../../../ui/BasePresentationPlayer.vue'
import { literal, storySource, tabTo, useStorySetup } from '@/stories/helpers'
import type { PresentationSlide } from '../../../types/BasePresentationPlayer.types'

const options = [
	{ id: 'free', label: 'free', isCorrect: false },
	{ id: 'linear', label: 'linear', isCorrect: true },
]

const slides: PresentationSlide[] = [
	{ id: 'quiz', title: 'Проверим себя', isInteractive: true },
	{ id: 'values', title: 'Наши ценности', duration: 5 },
	{ id: 'team', title: 'Команда', duration: 5 },
]

const state = { picked: '' }

const template = `
	<BasePresentationPlayer v-bind="args" v-model:slide="current">
		<template #slide="{ slide, index, complete }">
			<div class="story-stack" style="box-sizing: border-box; height: 100%; padding: 96px 64px 48px">
				<h2>{{ slide.title }}</h2>
				<template v-if="slide.isInteractive">
					<p>Какой режим пускает вперёд только после прохождения слайда?</p>
					<div class="story-row">
						<BaseButton
							v-for="option in options"
							:key="option.id"
							variant="outline"
							@click="picked = option.id; option.isCorrect && complete()">
							{{ option.label }}
						</BaseButton>
					</div>
					<p role="status">{{ picked ? (picked === 'linear' ? 'Верно!' : 'Неверно, попробуйте ещё раз') : '' }}</p>
				</template>
				<p v-else>Слайд {{ index + 1 }}: обычный текстовый слайд.</p>
			</div>
		</template>
	</BasePresentationPlayer>
`

export const Quiz: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Слайд-вопрос: `isInteractive: true`, слот `slide` получает `{ slide, index, complete, isCompleted }`. Слайд',
					'пройден (`slide-complete`, `progress`) только после `complete()` — и когда кончилась озвучка и прошло',
					'`minDuration`. Конец озвучки на неотвеченном вопросе ставит показ на паузу; после ответа авто-перехода нет.',
					'В `linear` и `strict` до ответа «Следующий слайд» закрыта: «Ответьте на вопрос, чтобы продолжить».',
					'Проверка: «Следующий слайд» недоступна; Tab до неверного ответа и Enter — ничего не открылось; верный ответ —',
					'«Следующий слайд» открыта, Enter — второй слайд.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton'],
				importsFrom: PRESENTATION_IMPORTS,
				models: { current: 'slide' },
				state,
				script: `const options = ${literal(options)}`,
			}),
		},
	},
	args: {
		title: 'Правила работы с документами',
		navigation: 'linear',
		slides,
	},
	render: args => ({
		components: { BasePresentationPlayer, BaseButton },
		setup: useStorySetup(args, { models: { current: 'slide' }, state, data: { options } }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const next = canvas.getByRole('button', { name: 'Следующий слайд' })
		await expect(next).toHaveAttribute('aria-disabled', 'true')
		await waitFor(() => expect(next).toHaveAccessibleDescription('Ответьте на вопрос, чтобы продолжить'))

		await tabTo(canvas.getByRole('button', { name: 'free' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByText('Неверно, попробуйте ещё раз')).toBeInTheDocument()
		await expect(next).toHaveAttribute('aria-disabled', 'true')
		await expect(args['onSlide-complete']).not.toHaveBeenCalled()

		await tabTo(canvas.getByRole('button', { name: 'linear' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByText('Верно!')).toBeInTheDocument()
		await waitFor(() => expect(next).not.toHaveAttribute('aria-disabled'))
		await expect(args['onSlide-complete']).toHaveBeenCalled()

		await tabTo(next, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() =>
			expect(canvas.getByRole('slider', { name: 'Слайды' })).toHaveAttribute('aria-valuetext', 'Слайд 2 из 3: Наши ценности'),
		)
	},
}
