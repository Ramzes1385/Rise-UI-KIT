import { expect } from 'storybook/test'
import type meta from '../../BaseRadio.stories'
import BaseRadio from '../../../ui/BaseRadio.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { item: 'story-themed-item', dot: 'story-themed-dot' }

const state = { plain: 'courier', themed: 'courier', classed: 'courier' }

const OWN_ARGS = ['modelValue', 'name', 'label', 'onUpdate:modelValue']

const template = `
	<div class="story-stack">
		<BaseRadio v-bind="args" v-model="plain" name="delivery-plain" label="По умолчанию" />
		<div style="--rise-radio-circle-bg-checked: var(--rise-success); --rise-radio-circle-border-checked: var(--rise-success); --rise-radio-option-label-font-weight: var(--rise-font-weight-semibold); --rise-radio-options-gap: 12px;">
			<BaseRadio v-bind="args" v-model="themed" name="delivery-themed" label="Токены на контейнере" />
		</div>
		<BaseRadio v-bind="args" v-model="classed" name="delivery-classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isVertical'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-radio-*` (круг: фон, рамка, фон и рамка выбранного, тень, кольцо фокуса; точка,',
					'текст и начертание подписи пункта, зазор между пунктами) кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Токены фона и рамки — вида `default`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям группы (`root`, `label`, `required`, `options`, `error-text`) и пункта (`item`, `wrapper`,',
					'`input`, `circle`, `dot`, `option-label`); глобально — `defaults.BaseRadio.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseRadio'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseRadio },
		setup: useStorySetup(args, { state, data: { ui }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-radio')]
		const circle = (group: HTMLElement) => group.querySelector('.base-radio-item__circle')!
		const optionLabel = (group: HTMLElement) => group.querySelector('.base-radio-item__option-label')!

		await expect(getComputedStyle(circle(themed!)).backgroundColor).not.toBe(getComputedStyle(circle(plain!)).backgroundColor)
		await expect(getComputedStyle(optionLabel(themed!)).fontWeight).toBe('600')
		await expect(getComputedStyle(themed!.querySelector('.base-radio__options')!).rowGap).toBe('12px')
		await expect(getComputedStyle(optionLabel(plain!)).fontWeight).toBe('500')
		await expect(classed!.querySelector('.base-radio-item')).toHaveClass('base-radio-item', 'story-themed-item')
		await expect(classed!.querySelector('.base-radio-item__dot')).toHaveClass('base-radio-item__dot', 'story-themed-dot')
		await expect(canvas.getByRole('radiogroup', { name: 'Классы через ui' })).toBe(classed)
	},
}
