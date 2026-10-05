import { expect } from 'storybook/test'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-bottom-nav', label: 'story-themed-label' }

const template = `
	<div class="story-stack story-narrow">
		<BaseBottomNav v-bind="args" aria-label="По умолчанию" />
		<div style="--rise-bottom-nav-bg: var(--rise-bg-elevated); --rise-bottom-nav-text-active: var(--rise-primary); --rise-bottom-nav-indicator-bg: var(--rise-primary-soft); --rise-bottom-nav-height: 64px; --rise-bottom-nav-font-weight-active: var(--rise-font-weight-bold);">
			<BaseBottomNav v-bind="args" aria-label="Токены на контейнере" />
		</div>
		<BaseBottomNav v-bind="args" aria-label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-bottom-nav-*` кит только читает: задайте их на `:root`, в теме или на контейнере — как здесь.',
					'Панель: `bg`, `border`, у `floating` — `bar-radius`, `bar-shadow`. Пункт: `text`, `text-hover`, `text-active`, `font-weight-active`,',
					'`font-size` (подпись), `height` (наименьшая высота), `gap` (значок — подпись). Индикатор выбранного пункта — `indicator-bg`.',
					'Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `bar`, `indicator`, `list`, `item`, `link`, `icon-wrap`, `icon`, `badge`, `label`);',
					'глобально — `defaults.BaseBottomNav.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBottomNav'],
				script: `const ui = ${literal(ui)}`,
				omit: ['ariaLabel'],
			}),
		},
	},
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const nav = (name: string) => canvas.getByRole('navigation', { name })
		const activeLink = (name: string) => nav(name).querySelector<HTMLElement>('.base-bottom-nav__link--active')!
		const plain = nav('По умолчанию')
		const themed = nav('Токены на контейнере')
		const classed = nav('Классы через ui')

		await expect(getComputedStyle(activeLink('Токены на контейнере')).color).not.toBe(
			getComputedStyle(activeLink('По умолчанию')).color,
		)
		await expect(classed).toHaveClass('base-bottom-nav', 'story-themed-bottom-nav')
		await expect(classed.querySelector('.base-bottom-nav__label')).toHaveClass('story-themed-label')
		await expect(themed.getBoundingClientRect().height).toBeGreaterThan(plain.getBoundingClientRect().height)
		if (!isStoryBranded()) await expect(getComputedStyle(activeLink('Токены на контейнере')).fontWeight).toBe('700')
		if (!isStoryBranded()) await expect(getComputedStyle(activeLink('Токены на контейнере')).minHeight).toBe('64px')
		if (!isStoryBranded()) await expect(getComputedStyle(activeLink('По умолчанию')).minHeight).toBe('56px')
	},
}
