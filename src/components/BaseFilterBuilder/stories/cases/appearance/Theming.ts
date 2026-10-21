import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFilterBuilder.stories'
import BaseFilterBuilder from '../../../ui/BaseFilterBuilder.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-filter', row: 'story-themed-row', add: 'story-themed-add' }

const template = `
	<div style="display: flex; flex-direction: column; gap: 16px; max-width: 720px">
		<span class="story-label">По умолчанию</span>
		<BaseFilterBuilder v-bind="args" />
		<span class="story-label">Токены на контейнере</span>
		<div style="--rise-filter-builder-bg: var(--rise-bg-elevated); --rise-filter-builder-border: var(--rise-primary); --rise-filter-builder-radius: var(--rise-radius-xl); --rise-filter-builder-padding-x: 20px; --rise-filter-builder-padding-y: 16px; --rise-filter-builder-joiner-text: var(--rise-primary-text); --rise-filter-builder-field-radius: 999px; --rise-filter-builder-field-border: var(--rise-primary);">
			<BaseFilterBuilder v-bind="args" />
		</div>
		<span class="story-label">Классы через ui</span>
		<BaseFilterBuilder v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-filter-builder-*` кит',
					'только читает — задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `padding-x`, `padding-y`,',
					'`gap` (отступы умножаются на плотность `--rise-density`), `joiner-text` — связка «Где», «и», «или»; поля условия —',
					'`field-bg`, `field-border`, `field-border-focus`, `field-radius`. Кнопки — токены BaseButton. Проп `ui` добавляет классы',
					'к частям `root`, `match`, `select`, `empty`, `list`, `item`, `row`, `joiner`, `input`, `value`, `remove`, `actions`, `button`,',
					'`add`; глобально — `defaults.BaseFilterBuilder.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFilterBuilder'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseFilterBuilder },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-filter-builder')]
		const select = (root: HTMLElement) => getComputedStyle(root.querySelector('.base-filter-builder__select select')!)
		const joiner = (root: HTMLElement) => getComputedStyle(root.querySelector('.base-filter-builder__joiner')!)

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(joiner(themed).color).not.toBe(joiner(plain).color)
		await expect(select(themed).borderTopColor).not.toBe(select(plain).borderTopColor)
		await expect(select(themed).borderTopLeftRadius).toBe('999px')
		if (!isStoryBranded()) {
			await expect(getComputedStyle(plain).paddingInlineStart).toBe('12px')
			await expect(getComputedStyle(themed).paddingInlineStart).toBe('20px')
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
		}
		await expect(classed).toHaveClass('base-filter-builder', 'story-themed-filter')
		for (const row of classed.querySelectorAll('.base-filter-builder__row')) await expect(row).toHaveClass('story-themed-row')
		await expect(classed.querySelector('.base-filter-builder__add')).toHaveClass('base-button', 'story-themed-add')
	},
}
