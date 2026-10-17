import { expect } from 'storybook/test'
import type meta from '../../BaseChecklist.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseChecklist from '../../../ui/BaseChecklist.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-checklist', item: 'story-themed-item', label: 'story-themed-label' }
const models = { completed: 'completed' }

const template = `
	<div class="story-grid" style="--story-grid-min: 300px;">
		<BaseChecklist v-bind="args" v-model:completed="completed" title="По умолчанию" />
		<div style="--rise-checklist-bg: var(--rise-bg-muted); --rise-checklist-border: var(--rise-primary); --rise-checklist-radius: var(--rise-radius-xl); --rise-checklist-padding-x: 24px; --rise-checklist-padding-y: 24px; --rise-checklist-item-bg-active: var(--rise-bg); --rise-checklist-title-font-weight: var(--rise-font-weight-bold); --rise-checklist-label-text-checked: var(--rise-success-text);">
			<BaseChecklist v-bind="args" v-model:completed="completed" title="Токены на контейнере" />
		</div>
		<BaseChecklist v-bind="args" v-model:completed="completed" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-checklist-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `padding-x`, `padding-y`, `gap`,',
					'`title-font-weight`, `item-radius`, `item-bg-active` (подсветка следующего шага), `label-text`, `label-text-checked`',
					'(выполненный шаг). Отступы умножаются на плотность темы `--rise-density`. Полоса прогресса и кнопки — токены BaseProgress',
					'и BaseButton. Проп `ui` добавляет классы к частям `root`, `header`, `title`, `count`, `progress`, `list`, `item`, `checkbox`,',
					'`body`, `line`, `label`, `next`, `description`, `action`, `done`; глобально — `defaults.BaseChecklist.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseChecklist'], models, script: `const ui = ${literal(ui)}`, omit: ['title'] }),
		},
	},
	render: args => ({
		components: { BaseChecklist },
		setup: useStorySetup(args, { models, data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('group', { name: 'По умолчанию' })
		const themed = canvas.getByRole('group', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('group', { name: 'Классы через ui' })
		const title = (root: HTMLElement) => root.querySelector<HTMLElement>('.base-checklist__title')!

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(title(themed)).fontWeight).toBe('700')
		await expect(getComputedStyle(title(plain)).fontWeight).toBe('600')
		if (!isStoryBranded()) {
			await expect(getComputedStyle(plain).paddingInlineStart).toBe('16px')
			await expect(getComputedStyle(themed).paddingInlineStart).toBe('24px')
		}
		await expect(classed).toHaveClass('base-checklist', 'story-themed-checklist')
		for (const item of classed.querySelectorAll('.base-checklist__item')) await expect(item).toHaveClass('story-themed-item')
		for (const label of classed.querySelectorAll('.base-checklist__label')) await expect(label).toHaveClass('story-themed-label')
	},
}
