import { expect } from 'storybook/test'
import { TO, TO_SCRIPT } from '../../shared'
import type meta from '../../BaseCountdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-countdown', unit: 'story-themed-unit', caption: 'story-themed-caption' }

const template = `
	<div class="story-stack">
		<BaseCountdown v-bind="args" :to="to" />
		<div style="--rise-countdown-unit-bg: var(--rise-primary-soft); --rise-countdown-caption-text: var(--rise-primary-text); --rise-countdown-unit-border: var(--rise-primary); --rise-countdown-unit-radius: var(--rise-radius-full); --rise-countdown-unit-padding-x: 16px; --rise-countdown-value-text: var(--rise-primary); --rise-countdown-value-font-weight: var(--rise-font-weight-bold); --rise-countdown-gap: 4px;">
			<BaseCountdown v-bind="args" :to="to" />
		</div>
		<BaseCountdown v-bind="args" :to="to" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'layout', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-countdown-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `text`, `gap`, ячейка `unit-bg`, `unit-border`, `unit-radius`,',
					'`unit-padding-x`, `unit-padding-y`, число `value-text`, `value-font-size`, `value-font-weight`, подпись `caption-text`,',
					'строка `clock-font-size` (`layout="inline"`; цвет и начертание — от `value-*`). Отступы умножаются на `--rise-density`.',
					'Проп `ui` добавляет классы к частям `root`, `finished`, `spoken`, `display`, `clock`, `unit`, `value`, `caption`,',
					'`slot`, `digit`; глобально — `defaults.BaseCountdown.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCountdown'],
				script: [TO_SCRIPT, `const ui = ${literal(ui)}`].join('\n'),
				omit: ['to'],
			}),
		},
	},
	render: args => ({
		components: { BaseCountdown },
		setup: useStorySetup(args, { data: { ui, to: TO }, slots: ['to'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-countdown')]
		const unit = (root: HTMLElement) => getComputedStyle(root.querySelector('.base-countdown__unit')!)
		const value = (root: HTMLElement) => getComputedStyle(root.querySelector('.base-countdown__value')!)

		await expect(unit(themed).backgroundColor).not.toBe(unit(plain).backgroundColor)
		await expect(value(themed).color).not.toBe(value(plain).color)
		await expect(value(themed).fontWeight).toBe('700')
		if (!isStoryBranded()) await expect(unit(themed).borderTopLeftRadius).toBe('9999px')
		if (!isStoryBranded()) await expect(unit(themed).paddingLeft).toBe('16px')
		if (!isStoryBranded()) await expect(unit(plain).paddingLeft).toBe('10px')
		if (!isStoryBranded()) await expect(value(plain).fontWeight).toBe('600')
		await expect(classed).toHaveClass('base-countdown', 'story-themed-countdown')
		await expect(classed.querySelector('.base-countdown__unit')).toHaveClass('story-themed-unit')
		await expect(classed.querySelector('.base-countdown__caption')).toHaveClass('story-themed-caption')
	},
}
