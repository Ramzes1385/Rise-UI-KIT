import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCookieConsent.stories'
import BaseCookieConsent from '../../../ui/BaseCookieConsent.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-consent', title: 'story-themed-title' }

const template = `
	<div class="story-stack">
		<div class="story-frame" style="height: 240px; background: var(--rise-bg-muted)">
			<BaseCookieConsent v-bind="args" label="Cookies 1" />
		</div>
		<div class="story-frame" style="height: 240px; background: var(--rise-bg-muted); --rise-cookie-consent-bg: var(--rise-primary-soft); --rise-cookie-consent-text: var(--rise-primary-text); --rise-cookie-consent-title-text: var(--rise-primary-text); --rise-cookie-consent-radius: var(--rise-radius-2xl); --rise-cookie-consent-padding-y: 24px; --rise-cookie-consent-title-font-size: var(--rise-font-size-lg);">
			<BaseCookieConsent v-bind="args" label="Cookies 2" />
		</div>
		<div class="story-frame" style="height: 240px; background: var(--rise-bg-muted)">
			<BaseCookieConsent v-bind="args" :ui="ui" label="Cookies 3" />
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-cookie-consent-*` кит только читает: `bg`, `text`, `border`, `radius`, `shadow`, `gap`,',
					'`padding-x`, `padding-y`, `title-font-size`, `title-text` — задайте их на `:root`, в теме или на контейнере, как во втором окне.',
					'Отступы умножаются на плотность темы `--rise-density`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `content`, `title`, `description`, `settings`, `category`, `hint`, `actions`,',
					'`customize`, `accept-selected`, `accept-all`); глобально — `defaults.BaseCookieConsent.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCookieConsent'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseCookieConsent },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const [plain, themed, classed] = canvas.getAllByRole('region')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('24px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingTop).toBe('16px')
		await expect(classed).toHaveClass('base-cookie-consent', 'story-themed-consent')
		await expect(classed.querySelector('.base-cookie-consent__title')).toHaveClass('story-themed-title')
	},
}
