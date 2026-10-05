import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseFooter.stories'
import BaseFooter from '../../../ui/BaseFooter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-footer', start: 'story-themed-start' }

const template = `
	<div class="story-stack">
		<section aria-label="Подвал по умолчанию">
			<BaseFooter v-bind="args">
				<template #start>По умолчанию</template>
				<BaseLink href="#terms">Условия</BaseLink>
			</BaseFooter>
		</section>
		<section aria-label="Подвал с токенами" style="--rise-footer-bg: var(--rise-bg-muted); --rise-footer-text: var(--rise-text); --rise-footer-border: var(--rise-primary); --rise-footer-padding-y: 32px; --rise-footer-font-size: var(--rise-font-size-base);">
			<BaseFooter v-bind="args">
				<template #start>Токены на контейнере</template>
				<BaseLink href="#privacy">Конфиденциальность</BaseLink>
			</BaseFooter>
		</section>
		<section aria-label="Подвал с классами">
			<BaseFooter v-bind="args" :ui="ui">
				<template #start>Классы через ui</template>
				<BaseLink href="#help">Помощь</BaseLink>
			</BaseFooter>
		</section>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['containerSize', 'isCompact', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-footer-*` кит только читает: `bg`, `text`, `border` (линия сверху и над нижней строкой),',
					'`shadow`, `font-size`, `padding-y` (отступ нижней строки), `gap` (промежуток зон нижней строки),',
					'`column-title-text`, `column-title-font-weight` — задайте их на `:root`, в теме или на обёртке. Боковые отступы — токены',
					'BaseContainer. Список — docs/design/COMPONENT_TOKENS.md. Подвалы — в `<section>`: на странице один ориентир contentinfo.',
					'Проп `ui` добавляет классы к частям (`root`, `top`, `about`, `columns`, `column`, `column-title`, `links`, `inner`,',
					'`start`, `center`, `end`); глобально — `defaults.BaseFooter.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFooter', 'BaseLink'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseFooter, BaseLink },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-footer')]
		const inner = (footer: HTMLElement) => getComputedStyle(footer.querySelector('.base-footer__inner')!)

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).color).not.toBe(getComputedStyle(plain).color)
		await expect(inner(themed).paddingTop).not.toBe(inner(plain).paddingTop)
		if (!isStoryBranded()) await expect(inner(themed).paddingTop).toBe('32px')
		if (!isStoryBranded()) await expect(inner(plain).paddingTop).toBe('24px')
		await expect(classed).toHaveClass('base-footer', 'story-themed-footer')
		await expect(classed.querySelector('.base-footer__start')).toHaveClass('story-themed-start')
	},
}
