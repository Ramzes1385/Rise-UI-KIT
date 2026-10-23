import { expect } from 'storybook/test'
import { DEEP_COMMENTS } from '../../sampleComments'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCommentThread.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseCommentThread from '../../../ui/BaseCommentThread.vue'

const template = `
	<div class="story-narrow">
		<BaseCommentThread v-bind="args" />
	</div>
`

export const DeepNesting: StoryObj<typeof meta> = {
	args: { comments: DEEP_COMMENTS, maxDepth: 3 },
	parameters: {
		docs: {
			description: {
				story: [
					'Длинная ветка в колонке 360px: до `maxDepth` (по умолчанию 3) каждый ответ сдвигается вправо, глубже — идёт',
					'без нового отступа, а рядом с автором стоит, кому он отвечает. В узкой колонке (до 480px) отступ уровня — 20px',
					'вместо 44px. Ветка любой глубины не выходит за ширину страницы и не прокручивается по горизонтали.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCommentThread'] }),
		},
	},
	render: args => ({
		components: { BaseCommentThread },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.base-comment-thread') as HTMLElement
		await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
		await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth)
		const replyTo = Array.from(canvasElement.querySelectorAll('.base-comment-thread__reply-to'), item => item.textContent?.trim())
		await expect(replyTo).toEqual([
			'в ответ пользователю Мария Кузнецова',
			'в ответ пользователю Олег Соколов',
			'в ответ пользователю Анна Смирнова',
			'в ответ пользователю Иван Петров',
			'в ответ пользователю Мария Кузнецова',
		])
		const levels = Array.from(canvasElement.querySelectorAll<HTMLElement>('.base-comment-thread__card'), card =>
			Math.round(card.getBoundingClientRect().left - root.getBoundingClientRect().left),
		)
		await expect(new Set(levels.slice(3)).size).toBe(1)
	},
}
