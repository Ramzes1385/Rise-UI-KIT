import { expect } from 'storybook/test'
import { SMALL_COLUMNS } from '../../shared'
import type meta from '../../BaseKanban.stories'
import BaseKanban from '../../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-kanban', column: 'story-themed-column', card: 'story-themed-card', 'card-title': 'story-themed-title' }
const models = { cards: 'cards' }

const template = `
	<div style="display: grid; gap: 24px">
		<BaseKanban v-bind="args" v-model:cards="cards" aria-label="По умолчанию" />
		<div style="--rise-kanban-gap: 20px; --rise-kanban-column-bg: color-mix(in srgb, var(--rise-primary) 18%, var(--rise-bg)); --rise-kanban-column-radius: var(--rise-radius-xl); --rise-kanban-column-padding-x: 12px; --rise-kanban-column-padding-y: 12px; --rise-kanban-header-text: var(--rise-primary-text); --rise-kanban-header-font-weight: var(--rise-font-weight-bold); --rise-kanban-card-bg: var(--rise-bg); --rise-kanban-card-border: var(--rise-primary); --rise-kanban-card-radius: var(--rise-radius-lg); --rise-kanban-card-shadow: var(--rise-shadow-md);">
			<BaseKanban v-bind="args" v-model:cards="cards" aria-label="Токены на контейнере" />
		</div>
		<BaseKanban v-bind="args" v-model:cards="cards" aria-label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-kanban-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `gap` (между колонками), `column-bg`, `column-border` (рамка',
					'варианта `outline`), `column-radius`, `column-padding-x`, `column-padding-y`, `header-text` и `header-font-weight` (название',
					'колонки), `card-bg`, `card-border`, `card-radius`, `card-shadow`. Отступы умножаются на плотность темы `--rise-density`.',
					'Кнопки и аватары — токены BaseButton и BaseAvatarGroup. Проп `ui` добавляет классы к частям `root`, `board`, `column`,',
					'`header`, `dot`, `title`, `count`, `toggle`, `list`, `item`, `card`, `cover`, `labels`, `card-title`, `card-description`,',
					'`meta`, `empty`, `add`, `editor`, `field`, `ghost`; глобально — `defaults.BaseKanban.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseKanban'], models, script: `const ui = ${literal(ui)}` }),
		},
	},
	args: { columns: SMALL_COLUMNS },
	render: args => ({
		components: { BaseKanban },
		setup: useStorySetup(args, { models, data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('group', { name: 'По умолчанию' })
		const themed = canvas.getByRole('group', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('group', { name: 'Классы через ui' })
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-kanban__${name}`)!

		await expect(getComputedStyle(part(themed, 'column')).backgroundColor).not.toBe(
			getComputedStyle(part(plain, 'column')).backgroundColor,
		)
		await expect(getComputedStyle(part(themed, 'card')).borderTopColor).not.toBe(getComputedStyle(part(plain, 'card')).borderTopColor)
		await expect(getComputedStyle(part(themed, 'title')).color).not.toBe(getComputedStyle(part(plain, 'title')).color)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(part(themed, 'title')).fontWeight).toBe('700')
			await expect(getComputedStyle(part(plain, 'title')).fontWeight).toBe('600')
			await expect(getComputedStyle(part(plain, 'column')).paddingLeft).toBe('8px')
			await expect(getComputedStyle(part(themed, 'column')).paddingLeft).toBe('12px')
			await expect(getComputedStyle(part(plain, 'board')).columnGap).toBe('12px')
			await expect(getComputedStyle(part(themed, 'board')).columnGap).toBe('20px')
		}
		await expect(classed).toHaveClass('base-kanban', 'story-themed-kanban')
		for (const column of classed.querySelectorAll('.base-kanban__column')) await expect(column).toHaveClass('story-themed-column')
		for (const card of classed.querySelectorAll('.base-kanban__card')) await expect(card).toHaveClass('story-themed-card')
		for (const title of classed.querySelectorAll('.base-kanban__card-title')) await expect(title).toHaveClass('story-themed-title')
	},
}
