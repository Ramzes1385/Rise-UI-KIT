import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseHeader.stories'
import BaseHeader from '../../../ui/BaseHeader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-header', title: 'story-themed-title' }

const template = `
	<div class="story-stack">
		<section aria-label="Шапка по умолчанию">
			<BaseHeader v-bind="args" title="По умолчанию" :is-sticky="false">
				<BaseLink href="#orders">Заказы</BaseLink>
			</BaseHeader>
		</section>
		<section aria-label="Шапка с токенами" style="--rise-header-bg: var(--rise-bg-muted); --rise-header-border: var(--rise-border-accented); --rise-header-height: 80px; --rise-header-shadow: var(--rise-shadow-sm); --rise-header-title-font-size: var(--rise-font-size-xl);">
			<BaseHeader v-bind="args" title="Токены на контейнере" :is-sticky="false">
				<BaseLink href="#clients">Клиенты</BaseLink>
			</BaseHeader>
		</section>
		<section aria-label="Шапка с классами">
			<BaseHeader v-bind="args" title="Классы через ui" :is-sticky="false" :ui="ui">
				<BaseLink href="#reports">Отчёты</BaseLink>
			</BaseHeader>
		</section>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'isCompact', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-header-*` кит только читает: `bg`, `text`, `border` (линия снизу), `shadow`,',
					'`font-size`, `height` (наименьшая высота строки), `gap` (промежуток зон), `title-font-size`, `title-font-weight` —',
					'задайте их на `:root`, в теме или на обёртке. Боковые отступы — токены BaseContainer. Список — docs/design/COMPONENT_TOKENS.md.',
					'Шапки — в `<section>`: на странице один ориентир banner. Проп `ui` добавляет классы к частям (`root`, `inner`, `start`, `title`, `center`, `end`, `toggle`, `bottom`);',
					'глобально — `defaults.BaseHeader.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseHeader', 'BaseLink'],
				script: `const ui = ${literal(ui)}`,
				omit: ['title', 'isSticky'],
			}),
		},
	},
	render: args => ({
		components: { BaseHeader, BaseLink },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-header')]
		const inner = (header: HTMLElement) => header.querySelector<HTMLElement>('.base-header__inner')!

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).boxShadow).not.toBe(getComputedStyle(plain).boxShadow)
		await expect(inner(themed).offsetHeight).toBeGreaterThan(inner(plain).offsetHeight)
		if (!isStoryBranded()) await expect(getComputedStyle(inner(themed)).minHeight).toBe('80px')
		if (!isStoryBranded()) await expect(getComputedStyle(inner(plain)).minHeight).toBe('64px')
		await expect(classed).toHaveClass('base-header', 'story-themed-header')
		await expect(classed.querySelector('.base-header__title')).toHaveClass('story-themed-title')
	},
}
