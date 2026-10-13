import { expect } from 'storybook/test'
import type meta from '../../BaseResult.stories'
import BaseResult from '../../../ui/BaseResult.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-result', title: 'story-themed-title' }

const template = `
	<div class="story-stack story-medium">
		<BaseResult v-bind="args" title="По умолчанию" />
		<div style="--rise-result-bg: var(--rise-primary-soft); --rise-result-text: var(--rise-primary-text); --rise-result-border: var(--rise-primary); --rise-result-radius: var(--rise-radius-2xl); --rise-result-padding-y: 48px; --rise-result-icon-wrapper-height: 80px; --rise-result-title-font-size: var(--rise-font-size-2xl);">
			<BaseResult v-bind="args" title="Токены на контейнере" />
		</div>
		<BaseResult v-bind="args" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['status', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-result-*` кит только читает: `bg`, `border`, `radius`, `text`, `padding-x`, `padding-y`, `gap`,',
					'`icon-wrapper-height`, `icon-size`, `title-font-size`, `title-text` — задайте их на `:root`, в теме или на контейнере, как здесь.',
					'Отступы умножаются на плотность темы `--rise-density`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `icon-wrapper`, `code`, `content`, `title`, `description`, `body`, `extra`);',
					'глобально — `defaults.BaseResult.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseResult'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseResult },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = Array.from(canvasElement.querySelectorAll<HTMLElement>('.base-result'))

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('48px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingTop).toBe('32px')
		await expect(themed.querySelector('.base-result__icon-wrapper')?.getBoundingClientRect().height).toBe(80)
		await expect(classed).toHaveClass('base-result', 'story-themed-result')
		await expect(classed.querySelector('.base-result__title')).toHaveClass('story-themed-title')
	},
}
