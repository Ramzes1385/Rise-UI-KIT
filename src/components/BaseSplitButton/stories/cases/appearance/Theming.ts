import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSplitButton.stories'
import BaseSplitButton from '../../../ui/BaseSplitButton.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-split', toggle: 'story-themed-toggle' }

const template = `
	<div class="story-row">
		<BaseSplitButton v-bind="args" label="По умолчанию" />
		<div style="--rise-split-button-gap: var(--rise-control-gap); --rise-split-button-toggle-padding-x: var(--rise-control-padding-x); --rise-split-button-toggle-border: var(--rise-on-primary); --rise-button-bg: var(--rise-success); --rise-button-bg-hover: var(--rise-success-hover);">
			<BaseSplitButton v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseSplitButton v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Половинки — это BaseButton, поэтому',
					'их фон, текст, рамку, радиус и начертание задают токены `--rise-button-*` (здесь — `--rise-button-bg`). Свои токены',
					'`--rise-split-button-*` кнопок не перекрывают: `gap` (зазор между половинками; по умолчанию −1px — рамки совпадают),',
					'`toggle-padding-x` (поле кнопки-стрелки), `toggle-border` (разделитель у варианта `default`). Задайте их на `:root`,',
					'в теме или на контейнере. Проп `ui` добавляет классы к частям `root`, `main`, `menu`, `toggle`;',
					'глобально — `defaults.BaseSplitButton.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSplitButton'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	render: args => ({
		components: { BaseSplitButton },
		setup: useStorySetup(args, { data: { ui }, slots: ['label'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('group', { name: 'По умолчанию' })
		const themed = canvas.getByRole('group', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('group', { name: 'Классы через ui' })
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-split-button__${name}`)!

		await expect(getComputedStyle(part(plain, 'menu')).marginInlineStart).toBe('-1px')
		await expect(getComputedStyle(part(themed, 'menu')).marginInlineStart).not.toBe('-1px')
		await expect(getComputedStyle(part(themed, 'toggle')).paddingInlineStart).not.toBe(
			getComputedStyle(part(plain, 'toggle')).paddingInlineStart,
		)
		await expect(getComputedStyle(part(themed, 'main')).backgroundColor).not.toBe(getComputedStyle(part(plain, 'main')).backgroundColor)
		await expect(classed).toHaveClass('base-split-button', 'story-themed-split')
		await expect(part(classed, 'toggle')).toHaveClass('base-button', 'story-themed-toggle')
	},
}
