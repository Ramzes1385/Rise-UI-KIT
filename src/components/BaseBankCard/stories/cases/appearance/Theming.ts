import { expect } from 'storybook/test'
import type meta from '../../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBankCard from '../../../ui/BaseBankCard.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-card', number: 'story-themed-number' }

const template = `
	<div class="story-row" style="align-items: start;">
		<BaseBankCard v-bind="args" label="По умолчанию" />
		<div style="--rise-bank-card-width: 360px; --rise-bank-card-radius: var(--rise-radius-2xl); --rise-bank-card-padding-x: 28px; --rise-bank-card-shadow: var(--rise-shadow-lg); --rise-bank-card-number-font-size: var(--rise-font-size-2xl); --rise-bank-card-border: var(--rise-primary);">
			<BaseBankCard v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseBankCard v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['brand', 'isCompact', 'variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-bank-card-*` кит только читает: `width`, `radius`, `padding-x`, `padding-y`, `gap`,',
					'`shadow`, `text`, `number-font-size` (полная карта; фон — по марке или проп `background`), `bg` и `border` (строка `isCompact`).',
					'Задайте их на `:root`, в теме или на контейнере, как здесь; отступы полной карты умножаются на плотность `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root`, `summary`, `brand`, `label`, `number`, `holder`, `expiry`, `expired`);',
					'глобально — `defaults.BaseBankCard.ui` плагина. Переключите `isCompact`, чтобы увидеть токены строки.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBankCard'],
				script: `const ui = ${literal(ui)}`,
				omit: ['label', 'default', 'cover'],
			}),
		},
	},
	render: args => ({
		components: { BaseBankCard },
		setup: useStorySetup(args, { data: { ui }, slots: ['label', 'default', 'cover'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-bank-card')]

		if (!isStoryBranded()) await expect(getComputedStyle(themed).width).toBe('360px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).width).toBe('320px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingInlineStart).toBe('28px')
		await expect(getComputedStyle(themed).boxShadow).not.toBe(getComputedStyle(plain).boxShadow)
		await expect(classed).toHaveClass('base-bank-card', 'story-themed-card')
		await expect(classed.querySelector('.base-bank-card__number')).toHaveClass('story-themed-number')
	},
}
