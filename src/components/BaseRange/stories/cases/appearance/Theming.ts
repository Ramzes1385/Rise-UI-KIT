import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-range', thumb: 'story-themed-thumb' }

const state = { plain: 40, themed: 60, classed: 30 }

const template = `
	<div class="story-col story-narrow">
		<span class="story-label">По умолчанию</span>
		<BaseRange v-bind="args" v-model="plain" />
		<span class="story-label">Токены на контейнере</span>
		<div style="--rise-range-track-height: 8px; --rise-range-fill-bg: var(--rise-success); --rise-range-thumb-border: var(--rise-success); --rise-range-thumb-width: 20px; --rise-range-thumb-height: 20px;">
			<BaseRange v-bind="args" v-model="themed" />
		</div>
		<span class="story-label">Классы через ui</span>
		<BaseRange v-bind="args" v-model="classed" :ui="ui" />
	</div>
`

const OMIT = ['modelValue', 'thumb', 'onUpdate:modelValue']

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'hasLabel', 'isVertical'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-range-*` (отступ, дорожка: высота, радиус, фон; заполнение; ползунок: ширина,',
					'высота, радиус, рамка, фон, тень; цвет значения) кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `track`, `fill`, `thumb`, `mark`',
					'и др. — `RANGE_PARTS`); глобально — `defaults.BaseRange.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRange'], state, script: `const ui = ${literal(ui)}`, omit: OMIT }),
		},
	},
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { state, data: { ui }, slots: OMIT }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-range')]
		const part = (range: HTMLElement, name: string) => getComputedStyle(range.querySelector(`.base-range__${name}`)!)

		await expect(part(themed, 'thumb').width).toBe('20px')
		await expect(part(plain, 'thumb').width).toBe('14px')
		await expect(part(themed, 'track').height).toBe('8px')
		await expect(part(themed, 'fill').backgroundColor).not.toBe(part(plain, 'fill').backgroundColor)
		await expect(classed).toHaveClass('base-range', 'story-themed-range')
		await expect(classed.querySelector('.base-range__thumb')).toHaveClass('story-themed-thumb')
	},
}
