import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { SAMPLE_COMMENTS } from '../../sampleComments'
import type meta from '../../BaseCommentThread.stories'
import BaseCommentThread from '../../../ui/BaseCommentThread.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const comments = SAMPLE_COMMENTS.slice(1)
const ui = { root: 'story-themed-thread', card: 'story-themed-card', author: 'story-themed-author' }

const template = `
	<div class="story-row" style="align-items: flex-start">
		<div style="width: 360px">
			<BaseCommentThread v-bind="args" :comments="comments" label="По умолчанию" />
		</div>
		<div style="width: 360px; --rise-comment-thread-bg: var(--rise-bg-muted); --rise-comment-thread-radius: var(--rise-radius-xl); --rise-comment-thread-padding: 24px; --rise-comment-thread-author-text: var(--rise-primary-text); --rise-comment-thread-shadow: var(--rise-shadow-md);">
			<BaseCommentThread v-bind="args" :comments="comments" label="Токены на контейнере" />
		</div>
		<div style="width: 360px">
			<BaseCommentThread v-bind="args" :comments="comments" label="Классы через ui" :ui="ui" />
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-comment-thread-*` кит только читает: `bg`, `text`, `border`, `radius`, `shadow`,',
					'`padding` (умножается на `--rise-density`), `gap`, `font-size` (текст комментария), `author-text`, `author-font-weight`,',
					'`time-text`, `like-text-checked` (нажатое «Нравится») — задайте их на `:root`, в теме или на контейнере, как здесь.',
					'Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `list`, `replies`, `comment`, `card`, `avatar`, `meta`, `author`, `time`,',
					'`text`, `actions`, `composer`, `count`, `empty`); глобально — `defaults.BaseCommentThread.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCommentThread'],
				script: `const comments = ${literal(comments)}\nconst ui = ${literal(ui)}`,
			}),
		},
	},
	render: args => ({
		components: { BaseCommentThread },
		setup: useStorySetup(args, { data: { comments, ui }, slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('region', { name: 'По умолчанию' })
		const themed = canvas.getByRole('region', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('region', { name: 'Классы через ui' })
		const author = (thread: HTMLElement) => thread.querySelector('.base-comment-thread__author') as HTMLElement

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).boxShadow).not.toBe(getComputedStyle(plain).boxShadow)
		await expect(getComputedStyle(author(themed)).color).not.toBe(getComputedStyle(author(plain)).color)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingLeft).toBe('24px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingLeft).toBe('16px')
		await expect(classed).toHaveClass('base-comment-thread', 'story-themed-thread')
		await expect(classed.querySelector('article')).toHaveClass('base-comment-thread__card', 'story-themed-card')
		await expect(author(classed)).toHaveClass('story-themed-author')
	},
}
