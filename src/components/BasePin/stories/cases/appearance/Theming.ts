import { expect } from 'storybook/test'
import BasePin from '../../../ui/BasePin.vue'
import type meta from '../../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { cells: 'story-themed-cells', input: 'story-themed-input' }

const state = { plain: '48', themed: '48', classed: '48' }

const template = `
	<div class="story-col">
		<BasePin v-bind="args" v-model="plain" aria-label="По умолчанию" />
		<div style="--rise-pin-bg: var(--rise-bg-muted); --rise-pin-border: var(--rise-primary-border); --rise-pin-radius: var(--rise-radius-full); --rise-pin-gap: 12px; --rise-pin-font-weight: var(--rise-font-weight-bold);">
			<BasePin v-bind="args" v-model="themed" aria-label="Токены на контейнере" />
		</div>
		<BasePin v-bind="args" v-model="classed" aria-label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'length', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-pin-*` кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Ячейка: `bg`, `border`, `border-focus`, `border-checked` (заполненная), `radius`, `width`, `height`, `font-size`,',
					'`font-weight`; ряд — `gap`; текст — `text`. Без своих токенов ячейка берёт общие `--rise-input-*` (рамка, фон, радиус).',
					'Проп `ui` добавляет классы к частям (`root`, `cells`, `input`, `error-text`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BasePin'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BasePin },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-pin__cells')]
		const plainCell = plain.querySelector<HTMLElement>('.base-pin__input')!
		const themedCell = themed.querySelector<HTMLElement>('.base-pin__input')!

		await expect(getComputedStyle(themedCell).backgroundColor).not.toBe(getComputedStyle(plainCell).backgroundColor)
		await expect(getComputedStyle(themedCell).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themedCell).fontWeight).not.toBe(getComputedStyle(plainCell).fontWeight)
		await expect(getComputedStyle(themed).columnGap).toBe('12px')
		await expect(themed.lastElementChild).not.toHaveClass('base-pin__input--filled')
		await expect(getComputedStyle(themed.lastElementChild!).borderTopColor).not.toBe(
			getComputedStyle(plain.lastElementChild!).borderTopColor,
		)
		await expect(classed).toHaveClass('base-pin__cells', 'story-themed-cells')
		await expect(canvas.getAllByRole('textbox', { name: 'Символ 1 из 4' })[2]).toHaveClass('base-pin__input', 'story-themed-input')
	},
}
