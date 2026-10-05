import { expect } from 'storybook/test'
import type meta from '../../BaseSparkline.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSparkline from '../../../ui/BaseSparkline.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-sparkline', line: 'story-themed-mark', bar: 'story-themed-mark' }

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 24px; padding-top: 40px">
		<BaseSparkline v-bind="args" label="По умолчанию" />
		<div style="--rise-sparkline-mark-bg: var(--rise-success); --rise-sparkline-dot-border: var(--rise-success-soft); --rise-sparkline-bar-radius: 0px; --rise-sparkline-bars-gap: 4px; --rise-sparkline-tooltip-bg: var(--rise-bg-inverted); --rise-sparkline-tooltip-text: var(--rise-text-inverted); --rise-sparkline-tooltip-border: var(--rise-bg-inverted); --rise-sparkline-tooltip-radius: var(--rise-radius-full);">
			<BaseSparkline v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseSparkline v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'height', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-sparkline-*` кит',
					'только читает — задайте их на `:root`, в теме или на контейнере: `mark-bg` (цвет линии, заливки, точки и столбиков;',
					'проп `markColor` сильнее), `dot-border` (обводка точки), `bar-radius`, `bars-gap` (столбики), `tooltip-bg`,',
					'`tooltip-text`, `tooltip-border`, `tooltip-radius`, `tooltip-shadow`, `tooltip-padding-x`, `tooltip-padding-y`',
					'(подсказка при наведении). Проп `ui` добавляет классы к частям `root`, `svg`, `line`, `area`, `bars`, `bar`, `dot`,',
					'`tooltip`; глобально — `defaults.BaseSparkline.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSparkline'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	render: args => ({
		components: { BaseSparkline },
		setup: useStorySetup(args, { data: { ui }, slots: ['label'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const [plain, themed, classed] = canvas.getAllByRole('img')
		const mark = (root: HTMLElement) => root.querySelector<HTMLElement>('.base-sparkline__line, .base-sparkline__bar')!
		const paint = (root: HTMLElement) => `${getComputedStyle(mark(root)).stroke} ${getComputedStyle(mark(root)).backgroundColor}`

		await expect(paint(themed)).not.toBe(paint(plain))
		await expect(classed).toHaveClass('base-sparkline', 'story-themed-sparkline')
		await expect(mark(classed)).toHaveClass('story-themed-mark')
	},
}
