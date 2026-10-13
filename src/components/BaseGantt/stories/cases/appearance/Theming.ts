import { expect } from 'storybook/test'
import type meta from '../../BaseGantt.stories'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-gantt', bar: 'story-themed-bar' }

const template = `
	<div class="story-stack">
		<BaseGantt v-bind="args" :height="240" />
		<div style="--rise-gantt-bar-bg: var(--rise-success); --rise-gantt-bar-height: 14px; --rise-gantt-bar-radius: var(--rise-radius-full); --rise-gantt-today-bg: var(--rise-warning); --rise-gantt-header-bg: var(--rise-primary-soft); --rise-gantt-header-text: var(--rise-primary-text); --rise-gantt-radius: var(--rise-radius-xl);">
			<BaseGantt v-bind="args" :height="240" />
		</div>
		<BaseGantt v-bind="args" :height="240" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'scale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-gantt-*` кит только читает: `bg`, `text`, `border`, `radius` (корень), `header-bg`, `header-text`,',
					'`name-bg`, `name-bg-hover` (список слева), `row-border`, `row-bg-hover`, `grid-border` (линии шкалы), `bar-bg`, `bar-height`, `bar-radius`,',
					'`dependencies-border` (стрелки), `today-bg` (линия «сегодня») — задайте их на `:root`, в теме или на контейнере, как во втором примере.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `viewport`, `header`, `row`, `name`, `timeline`, `bar`,',
					'`progress`, `milestone`, `today`, `dependencies`, `status`); глобально — `defaults.BaseGantt.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseGantt'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll('.base-gantt')] as HTMLElement[]
		const fill = (root: HTMLElement): HTMLElement => root.querySelector('.base-gantt__progress') as HTMLElement
		await expect(getComputedStyle(fill(themed)).backgroundColor).not.toBe(getComputedStyle(fill(plain)).backgroundColor)
		await expect(getComputedStyle(themed.querySelector('.base-gantt__today') as HTMLElement).backgroundColor).not.toBe(
			getComputedStyle(plain.querySelector('.base-gantt__today') as HTMLElement).backgroundColor,
		)
		if (!isStoryBranded()) await expect(getComputedStyle(themed.querySelector('.base-gantt__bar') as HTMLElement).height).toBe('14px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain.querySelector('.base-gantt__bar') as HTMLElement).height).toBe('22px')
		await expect(classed).toHaveClass('base-gantt', 'story-themed-gantt')
		await expect(classed.querySelector('.base-gantt__bar')).toHaveClass('story-themed-bar')
	},
}
