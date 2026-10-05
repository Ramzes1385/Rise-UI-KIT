import { items } from '../../shared'
import type meta from '../../BaseAnchor.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAnchor from '../../../ui/BaseAnchor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-anchor', link: 'story-themed-link', indicator: 'story-themed-indicator' }

const template = `
	<div class="story-row" style="align-items: flex-start">
		<BaseAnchor v-bind="args" :items="items" label="По умолчанию" style="width: 200px" />
		<div style="width: 200px; --rise-anchor-indicator-bg: var(--rise-success); --rise-anchor-text-active: var(--rise-success-text); --rise-anchor-border: var(--rise-border-accented); --rise-anchor-padding-y: 6px; --rise-anchor-font-weight-active: var(--rise-font-weight-bold);">
			<BaseAnchor v-bind="args" :items="items" label="Токены на контейнере" />
		</div>
		<BaseAnchor v-bind="args" :items="items" label="Классы через ui" :ui="ui" style="width: 200px" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'direction', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-anchor-*` кит только читает: `text`, `text-hover`, `text-active` (цвет пунктов),',
					'`font-size`, `font-weight-active` (начертание текущего), `border` (линия списка), `radius`, `gap`, `padding-x`, `padding-y`,',
					'`indicator-bg` (отметка текущего: линия у `default`, заливка у `soft`) — задайте их на `:root`, в теме или на контейнере,',
					'как здесь. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `list`, `item`, `link`, `indicator`); глобально — `defaults.BaseAnchor.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAnchor'],
				script: `
					const items = ${literal(items)}
					const ui = ${literal(ui)}
				`,
				omit: ['items', 'label'],
			}),
		},
	},
	render: args => ({
		components: { BaseAnchor },
		setup: useStorySetup(args, { data: { items, ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const nav = (name: string) => canvas.getByRole('navigation', { name })
		const part = (name: string, selector: string) => nav(name).querySelector<HTMLElement>(selector)!
		const plain = 'По умолчанию'
		const themed = 'Токены на контейнере'
		const classed = 'Классы через ui'

		await waitFor(() => expect(part(themed, '.base-anchor__indicator')).toBeInTheDocument())
		await waitFor(() => expect(part(plain, '.base-anchor__indicator')).toBeInTheDocument())
		const style = (name: string, selector: string) => getComputedStyle(part(name, selector))
		await expect(style(themed, '.base-anchor__indicator').backgroundColor).not.toBe(
			style(plain, '.base-anchor__indicator').backgroundColor,
		)
		await expect(style(themed, '.base-anchor__link--active').color).not.toBe(style(plain, '.base-anchor__link--active').color)
		if (!isStoryBranded()) {
			await expect(style(themed, '.base-anchor__link').paddingTop).toBe('6px')
			await expect(style(plain, '.base-anchor__link').paddingTop).toBe('4px')
			await expect(style(themed, '.base-anchor__link--active').fontWeight).toBe('700')
		}
		await expect(nav(classed)).toHaveClass('base-anchor', 'story-themed-anchor')
		await expect(part(classed, '.base-anchor__link')).toHaveClass('story-themed-link')
		await waitFor(() => expect(part(classed, '.base-anchor__indicator')).toHaveClass('story-themed-indicator'))
	},
}
