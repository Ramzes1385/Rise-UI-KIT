import { expect } from 'storybook/test'
import { GRID_STYLE } from '../../shared'
import type meta from '../../BaseStat.stories'
import BaseStat from '../../../ui/BaseStat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-stat', value: 'story-themed-value' }

const template = `
	<div style="${GRID_STYLE}">
		<BaseStat v-bind="args" label="По умолчанию" />
		<div style="--rise-stat-bg: var(--rise-primary-soft); --rise-stat-border: var(--rise-primary); --rise-stat-radius: var(--rise-radius-xs); --rise-stat-shadow: var(--rise-shadow-md); --rise-stat-padding-x: 24px; --rise-stat-label-text: var(--rise-primary-text); --rise-stat-value-text: var(--rise-primary-text); --rise-stat-value-font-weight: var(--rise-font-weight-bold);">
			<BaseStat v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseStat v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['value', 'change', 'variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-stat-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `bg`, `border`, `radius`, `shadow`, `padding-x`, `padding-y`,',
					'`gap` (карточка; фон и рамка — у вида `default`), `label-text` (подпись), `value-text`, `value-font-size`,',
					'`value-font-weight` (значение), `icon-text` (значок в углу). Проп `ui` добавляет классы к частям `root`, `body`,',
					'`label`, `value`, `content`, `change`, `trend`, `delta`, `period`, `icon`, `chart`; глобально — `defaults.BaseStat.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseStat'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	render: args => ({
		components: { BaseStat },
		setup: useStorySetup(args, { data: { ui }, slots: ['label'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-stat')]
		const value = (root: HTMLElement) => root.querySelector<HTMLElement>('.base-stat__value')!

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).boxShadow).not.toBe('none')
		await expect(getComputedStyle(value(themed)).fontWeight).not.toBe(getComputedStyle(value(plain)).fontWeight)
		await expect(getComputedStyle(themed).paddingLeft).not.toBe(getComputedStyle(plain).paddingLeft)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).paddingLeft).toBe('24px')
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('2px')
			await expect(getComputedStyle(value(plain)).fontWeight).toBe('600')
		}
		await expect(classed).toHaveClass('base-stat', 'story-themed-stat')
		await expect(value(classed)).toHaveClass('base-stat__value', 'story-themed-value')
	},
}
