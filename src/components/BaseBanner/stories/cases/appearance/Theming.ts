import { expect } from 'storybook/test'
import type meta from '../../BaseBanner.stories'
import BaseBanner from '../../../ui/BaseBanner.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-banner', text: 'story-themed-text' }

const template = `
	<div class="story-stack">
		<BaseBanner v-bind="args" text="По умолчанию" label="Объявление по умолчанию" />
		<div style="--rise-banner-bg: var(--rise-success-soft); --rise-banner-text: var(--rise-success-text); --rise-banner-border: var(--rise-success-border); --rise-banner-shadow: var(--rise-shadow-md); --rise-banner-font-size: var(--rise-font-size-base); --rise-banner-gap: 20px; --rise-banner-padding-x: 32px; --rise-banner-padding-y: 20px;">
			<BaseBanner v-bind="args" text="Токены на контейнере" label="Объявление с токенами" />
		</div>
		<BaseBanner v-bind="args" text="Классы через ui" label="Объявление с классами" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['type', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-banner-*` кит только читает: `bg`, `text`, `border`, `shadow`, `font-size`,',
					'`gap`, `padding-x`, `padding-y` — задайте их на `:root`, в теме или на контейнере, как здесь.',
					'Отступы умножаются на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root`, `body`, `icon-wrapper`, `content`, `text`, `action`, `close`);',
					'глобально — `defaults.BaseBanner.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBanner'],
				script: `const ui = ${literal(ui)}`,
				omit: ['text', 'label'],
			}),
		},
	},
	render: args => ({
		components: { BaseBanner },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const [plain, themed, classed] = canvas.getAllByRole('region')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).boxShadow).not.toBe('none')
		await expect(getComputedStyle(plain).boxShadow).toBe('none')
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed.querySelector('.base-banner__body') as HTMLElement).paddingTop).toBe('20px')
			await expect(getComputedStyle(plain.querySelector('.base-banner__body') as HTMLElement).paddingTop).toBe('10px')
		}
		await expect(classed).toHaveClass('base-banner', 'story-themed-banner')
		await expect(classed.querySelector('.base-banner__text')).toHaveClass('story-themed-text')
	},
}
