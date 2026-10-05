import { expect } from 'storybook/test'
import type meta from '../../BaseRating.stories'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-rating', value: 'story-themed-value' }

const state = { plain: 3, themed: 4, classed: 2 }

const OMIT = ['modelValue', 'isValueShown', 'onUpdate:modelValue']

const template = `
	<div class="story-col">
		<span class="story-label">По умолчанию</span>
		<BaseRating v-bind="args" v-model="plain" is-value-shown />
		<span class="story-label">Токены на контейнере</span>
		<div style="--rise-rating-star-fill-text: var(--rise-success); --rise-rating-gap: 6px; --rise-rating-value-font-weight: var(--rise-font-weight-bold);">
			<BaseRating v-bind="args" v-model="themed" is-value-shown />
		</div>
		<span class="story-label">Классы через ui</span>
		<BaseRating v-bind="args" v-model="classed" is-value-shown :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'step'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-rating-*` (цвет пустой и залитой звезды, залитой при наведении, отступ, радиус,',
					'отступы и рамка вариантов, тень, цвет, кегль и начертание числа) кит только читает: задайте их на `:root`, в теме',
					'или на контейнере. Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `star`,',
					'`star-fill`, `value`); глобально — `defaults.BaseRating.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRating'], state, script: `const ui = ${literal(ui)}`, omit: OMIT }),
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: useStorySetup(args, { state, data: { ui }, slots: OMIT }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-rating')]
		const fillColor = (rating: HTMLElement) => getComputedStyle(rating.querySelector('.base-rating__star-fill')!).color

		await expect(fillColor(themed)).not.toBe(fillColor(plain))
		await expect(getComputedStyle(themed).columnGap).toBe('6px')
		await expect(getComputedStyle(plain).columnGap).toBe('2px')
		await expect(getComputedStyle(themed.querySelector('.base-rating__value')!).fontWeight).toBe('700')
		await expect(classed).toHaveClass('base-rating', 'story-themed-rating')
		await expect(classed.querySelector('.base-rating__value')).toHaveClass('story-themed-value')
	},
}
